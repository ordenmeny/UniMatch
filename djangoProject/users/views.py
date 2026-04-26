import logging
from datetime import datetime, timedelta, time

import requests

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail.message import EmailMultiAlternatives
from django.db.models import Q
from django.http import HttpResponseRedirect

from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
    UpdateAPIView,
)
from rest_framework.permissions import (
    AllowAny,
    IsAdminUser,
    IsAuthenticated
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import (
    TokenBlacklistSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import (
    AccessToken,
    RefreshToken
)
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
)
from rest_framework import status

from djoser.email import PasswordResetEmail

from .algorithm import PairingAlgorithm
from .models import (
    CustomUser,
    PairsModel,
    HobbyModel,
)
from .serializers import (
    EmailTokenObtainPairSerializer,
    UserSerializer,
    PairsSerializer,
    HobbySerializer,
    HobbyUpdateSerializer,
)
from users.utils.check_sign import check_telegram_auth
from users.utils.generate_pairs import generate_weekly_pairs

logger = logging.getLogger(__name__)


class AdminApiViewCreatePairs(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request, *args, **kwargs):
        users = get_user_model().objects.filter(is_active_pair=True)
        history = PairsModel.objects.all()
        history.update(is_archived=True)

        pairing_algorithm = PairingAlgorithm(users, history)

        pairs, excluded_user = pairing_algorithm.find_pairs()

        if excluded_user:
            pair_with_excluded_user = PairsModel(
                user1=excluded_user,
                user2=get_user_model().objects.get(username="admin")
            )
            pair_with_excluded_user.save()

        logger.info(f"Найдено пар: {len(pairs)}")
        if excluded_user:
            logger.info(f"Исключен: {excluded_user.username}")

        pairs_with_hobbies = 0
        for i, (user1, user2, has_common_hobbies) in enumerate(pairs, 1):
            if has_common_hobbies:
                common_hobbies = user1.get_common_hobbies(user2)

                pair = PairsModel.objects.filter((Q(user1=user1) | Q(user2=user1))
                                                 & (Q(user1=user2) | Q(user2=user2)))[0]

                pair.common_hobbies.set(common_hobbies)

            hobby_status = "✓" if has_common_hobbies else "✗"

            logger.info(f"  Пара {i}: {user1.username} - {user2.username} {hobby_status}")
            if has_common_hobbies:
                logger.info(f"    Общие хобби: {[str(hobby) for hobby in common_hobbies]}")
                pairs_with_hobbies += 1
            else:
                logger.info(f"Общих хобби нет")

        success_rate = (pairs_with_hobbies / len(pairs)) * 100 if pairs else 0
        logger.info(f"  Процент пар с общими хобби: {success_rate:.1f}%")

        return Response({"success": str(success_rate)}, status=status.HTTP_201_CREATED)


class SendEmailApiView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        subject = request.data.get('subject')
        html_message = request.data.get('html_message')

        if not (html_message and subject):
            return Response({'message': 'No message'}, status=status.HTTP_400_BAD_REQUEST)

        emails = get_user_model().objects.all().values_list('email', flat=True)
        log_count = 0
        for email in emails:
            try:
                msg = EmailMultiAlternatives(
                    subject=subject,
                    from_email=settings.EMAIL_HOST_USER,
                    to=[email]
                )
                msg.attach_alternative(html_message, "text/html")
                msg.send()
                log_count += 1

            except Exception as e:
                logger.error(f"Не получилось отправить письмо для {email}")
                return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'SEND_COUNT': str(log_count)}, status=status.HTTP_200_OK)


class CustomPasswordResetEmail(PasswordResetEmail):
    template_name = "users/custom_password_reset.html"

    def get_context_data(self):
        context = super().get_context_data()
        context["domain"] = "unimatch.ru"
        context["site_name"] = "unimatch.ru"
        context["protocol"] = "https"
        return context


class CustomTokenBlacklistView(TokenBlacklistView):
    serializer_class = TokenBlacklistSerializer

    def post(self, request, *args, **kwargs):
        cookies_refresh_token = request.COOKIES.get('refresh_token')

        serializer = self.get_serializer(data={"refresh": cookies_refresh_token})

        if serializer.is_valid():
            response = Response(
                {
                    "signout": "Вы вышли из системы"
                }, status=status.HTTP_200_OK
            )

            response.delete_cookie(
                key="refresh_token",
                path="/",
                samesite="Lax"
            )

            return response

        return Response({
            "error": "Не получилось выйти из системы"
        }, status=status.HTTP_400_BAD_REQUEST)


class GetAccessTokenHttponly(APIView):
    def get(self, request):
        cookies_access_token = request.COOKIES.get('access_token')

        if not cookies_access_token:
            logger.warning("Cookies access token not found")
            return Response(
                {
                    'error': 'Access token not found'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            access_token = AccessToken(cookies_access_token)

            return Response({"access": str(access_token)}, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response(
                {
                    'error': 'Необходимо пройти авторизацию'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )


class YandexAuthUrl(APIView):
    def get(self, request):
        client_id = settings.yandex_client_id
        link = f"https://oauth.yandex.ru/authorize?response_type=code&client_id={client_id}"

        return Response({"auth_url": link})


class YandexAuth(APIView):
    """
    Поменять Redirect URI в настройках яндекс oauth: https://oauth.yandex.ru !

    Обмен кода подтверждения на OAuth-токен:
    яндекс OAuth возвращает
    OAuth-токен (access_token), refresh-токен и время их жизни в JSON-формате.
    Проверка на работоспособность сервера яндекса.
    """

    def get(self, request):
        code = request.GET.get('code')
        try:
            tokens_response = requests.post(
                "https://oauth.yandex.ru/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "client_id": settings.yandex_client_id,
                    "client_secret": settings.yandex_client_secret,
                }
            )
        except requests.RequestException as e:
            logger.error(f"Ошибка сети при запросе токена: {e}")
            return Response(
                {
                    "error": "Сервис авторизации недоступен"
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        if tokens_response.status_code != 200:
            logger.warning(
                f"Не удалось получить токен пользователя яндекса: {tokens_response.text}"
            )
            return Response(
                {
                    "error": "Не удалось получить токен пользователя яндекса"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        tokens_data = tokens_response.json()
        access_token = tokens_data.get("access_token")

        if not access_token:
            logger.error(f"В ответе Яндекса нет access_token")
            return Response(
                {
                    "error": "Яндекс не вернул access_token"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_data_response = requests.get(
                "https://login.yandex.ru/info?",
                headers={
                    "Authorization": f'OAuth {access_token}'
                }
            )
        except requests.RequestException as e:
            logger.error(f"Ошибка сети при запросе данных пользователя: {e}")
            return Response(
                {
                    "error": "Сервис авторизации недоступен"
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        if user_data_response.status_code != 200:
            logger.warning(f"Ошибка получения данных пользователя яндекс")
            return Response(
                {
                    "error": "Не удалось получить данные пользователя яндекс"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user_data_response = user_data_response.json()

        all_user_yandex_emails = user_data_response.get("emails")
        user_by_yandex_email = None
        user_yandex_email = None

        if len(all_user_yandex_emails) == 0:
            return Response(
                {
                    "error": "Произошла ошибка получения почты пользователя"
                }, status=status.HTTP_400_BAD_REQUEST
            )
        elif len(all_user_yandex_emails) == 1:
            user_yandex_email = all_user_yandex_emails[0]

            user_by_yandex_email = get_user_model().objects.filter(
                email=user_yandex_email,
                yandex_oauth=True
            ).first()
        elif len(all_user_yandex_emails) == 2:
            user_yandex_email = all_user_yandex_emails[1]
            user_by_yandex_email = get_user_model().objects.filter(
                email=user_yandex_email,
                yandex_oauth=True
            ).first()

        # Если уже входил через яндекс (почта 1/почта 2).
        if user_by_yandex_email:
            pass
        # Если не входил ни разу -> создать пользователя
        else:
            if get_user_model().objects.filter(
                    email=user_yandex_email,
                    yandex_oauth=False
            ):
                return Response({
                    "error": "Чтобы войти, используйте почту"
                }, status=status.HTTP_400_BAD_REQUEST)

            user_by_yandex_email = get_user_model().objects.create(
                username=user_yandex_email.split("@")[0],
                email=user_yandex_email,
                birth="2000-08-12",
                yandex_oauth=True,
                first_name=user_data_response.get("first_name"),
                last_name=user_data_response.get("last_name"),
            )

        refresh_token = RefreshToken.for_user(user_by_yandex_email)
        access_token = refresh_token.access_token

        frontend_host = settings.frontend_host

        response = HttpResponseRedirect(f"{frontend_host}/me/")

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.SECURE_HTTP_ONLY,
            samesite="Lax",
            max_age=24 * 60 * 60,
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.SECURE_HTTP_ONLY,
            samesite="Lax",
            max_age=24 * 60 * 60,
            path="/",
        )

        return response


class UserByUniqCodeAPIView(RetrieveUpdateDestroyAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    lookup_field = "uniq_code"
    lookup_url_kwarg = "uniq_code"

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        token, created = Token.objects.get_or_create(user=instance)

        serializer = self.get_serializer(instance)

        return Response({"user": serializer.data, "token": token.key})


class UserByChatIDAPIView(RetrieveAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    lookup_field = "chat_id"
    lookup_url_kwarg = "chat_id"
    permission_classes = [IsAdminUser]


class RegisterUserAPIView(CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            for field, messages in serializer.errors.items():
                if field == "email":
                    for message in messages:
                        if message.code == "unique":
                            return Response({
                                "error": "Пользователь с таким email уже существует"
                            }, status=status.HTTP_400_BAD_REQUEST)
                        if message.code == "invalid":
                            return Response({
                                "error": "Введите правильный адрес электронной почты"
                            }, status=status.HTTP_400_BAD_REQUEST)
                if field == "password":
                    return Response({
                        "error": "Пароль либо слишком простой, либо содержит меньше 4 символов"
                    }, status=status.HTTP_400_BAD_REQUEST)
                if field == "birth":
                    return Response({
                        "error": "Проблема с полем ввода даты рождения"
                    }, status=status.HTTP_400_BAD_REQUEST)

                return Response({
                    "error": "Произошла непредвиденная ошибка"
                }, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        refresh_token = RefreshToken.for_user(user)
        access = refresh_token.access_token

        response = Response(
            {
                "user": UserSerializer(user).data,
                "access": str(access)
            },
            status=status.HTTP_201_CREATED,
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh_token),
            httponly=True,
            secure=settings.SECURE_HTTP_ONLY,
            samesite="Lax",
            max_age=24 * 60 * 60,
        )

        return response


class AllPairsAPIView(ListCreateAPIView):
    serializer_class = PairsSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        pairs = (
            PairsModel.objects.filter(is_archived=True)
            .filter(Q(user1=user) | Q(user2=user))
            .order_by("-created_at")
        )

        cur_pair = (
            PairsModel.objects.filter(is_archived=False)
            .filter(Q(user1=user) | Q(user2=user))
            .order_by("-created_at")
            .first()
        )

        all_pairs = list(pairs)
        if cur_pair:
            all_pairs.insert(0, cur_pair)

        serializer = self.get_serializer(pairs, many=True)

        return Response(
            {
                "current_pair": self.get_serializer(cur_pair).data
                if cur_pair
                else None,
                "pairs": serializer.data if serializer.data else [],
            }
        )


class TgAuthView(APIView):
    """
    Перед использованием зайти в botfather, выбрать бота, отправить хост.
    """

    def post(self, request, *args, **kwargs):
        data = request.data

        if not check_telegram_auth(data, settings.TELEGRAM_BOT_TOKEN):
            return Response(
                {"error": "Invalid tg auth"}, status=status.HTTP_400_BAD_REQUEST
            )

        chat_id = data.get("id")
        username = data.get('username')
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = f'unimatch_username_null_{chat_id}@unimatch.ru'

        exists_user = get_user_model().objects.filter(email=email)
        if exists_user.exists():
            refresh_token = RefreshToken.for_user(exists_user.first())
            access_token = refresh_token.access_token
            return Response({"access": str(access_token)}, status=status.HTTP_200_OK)

        if username:
            new_user = get_user_model().objects.create(
                username=username,
                email=email,
                chat_id=chat_id,
                tg_auth=True,
            )
        elif first_name and last_name:
            new_user = get_user_model().objects.create(
                username=f'{first_name}{last_name}{chat_id}_unimatch_user',
                email=email,
                first_name=first_name,
                last_name=last_name,
                chat_id=chat_id,
                tg_auth=True,
            )
        elif first_name:
            new_user = get_user_model().objects.create(
                username=f'{first_name}{chat_id}_unimatch_user',
                email=email,
                first_name=first_name,
                chat_id=chat_id,
                tg_auth=True,
            )

        elif last_name:
            new_user = get_user_model().objects.create(
                username=f'{last_name}{chat_id}_unimatch_user',
                email=email,
                last_name=last_name,
                chat_id=chat_id,
                tg_auth=True,
            )

        refresh_token = RefreshToken.for_user(new_user)
        access_token = refresh_token.access_token

        response = Response({"access": str(access_token)}, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.SECURE_HTTP_ONLY,
            samesite="Lax",
            max_age=24 * 60 * 60,
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.SECURE_HTTP_ONLY,
            samesite="Lax",
            max_age=24 * 60 * 60,
        )

        return response


class HobbyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        hobbies = request.user.hobby.all().values_list("name", flat=True)
        return Response(list(hobbies), status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        user = request.user
        serializer = HobbyUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_hobbies = serializer.validated_data["hobby"]
        user.hobby.set(new_hobbies)
        user.save()

        return Response(new_hobbies, status=status.HTTP_200_OK)


class HobbyAllAPIView(ListAPIView):
    queryset = HobbyModel.objects.all()
    serializer_class = HobbySerializer
    permission_classes = [AllowAny]


class DaysToMatch(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        now = datetime.now()

        # День недели мэтча (0 = Понедельник, 1 = Вторник, ..., 6 = Воскресенье)
        day_of_week_match = 0

        # Время мэтча
        match_time = time(18, 0)

        # Сколько дней до следующего мэтча
        days_ahead = (day_of_week_match - now.weekday()) % 7
        if days_ahead == 0:
            # Сегодня день мэтча, но надо проверить время
            if now.time() >= match_time:
                days_ahead = 7  # Уже позже 10:00 — ждём следующий понедельник

        next_match_datetime = datetime.combine(
            now.date() + timedelta(days=days_ahead), match_time
        )

        # Разница между сейчас и следующим мэтчем
        delta = next_match_datetime - now

        response_data = {
            "days_left": delta.days,
            "hours_left": delta.seconds // 3600,
            "minutes_left": (delta.seconds % 3600) // 60,
            "next_match_at": next_match_datetime.strftime("%Y-%m-%d %H:%M:%S"),
        }

        return Response(response_data, status=status.HTTP_200_OK)


class HobbyTotal(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        user_tags = user.hobby.all()
        all_tags = HobbyModel.objects.all()

        user_tags_data = [{"id": tag.id, "name": tag.name} for tag in user_tags]
        all_tags_data = [{"id": tag.id, "name": tag.name} for tag in all_tags]

        response_data = {"user_tags": user_tags_data, "all_tags": all_tags_data}

        return Response(response_data)


class UpdateUserAPIView(UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed:
            return Response(
                {"error": "Неверный email или пароль"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_data = serializer.validated_data
        access_token = validated_data.get("access")
        refresh_token = validated_data.pop("refresh")
        response = Response({"access": access_token}, status=status.HTTP_200_OK)

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.SECURE_HTTP_ONLY,
            samesite="Lax",
            max_age=24 * 60 * 60,
        )

        return response


class RefreshTokenView(APIView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        logger.warning(f"Refresh_token: {refresh_token}")

        if refresh_token is None:
            logger.warning("Необходимо пройти авторизацию")
            return Response(
                {
                    # редирект с frontend на страницу авторизации.
                    "error": "Необходимо пройти авторизацию",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            logger.warning("Необходимо пройти авторизацию 2")
            return Response(
                {
                    "error": "Необходимо пройти авторизацию",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access = serializer.validated_data.get("access")
        new_refresh = serializer.validated_data.get("refresh")

        logger.warning(f"Access: {access}")
        logger.warning(f"New refresh: {new_refresh}")
        response = Response({"access": access}, status=status.HTTP_200_OK)
        if new_refresh:
            response.set_cookie(
                key="refresh_token",
                value=new_refresh,
                httponly=True,
                secure=settings.SECURE_HTTP_ONLY,
                samesite="Lax",
                max_age=24 * 60 * 60,
            )

        return response

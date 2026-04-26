from django.urls import path, re_path, include
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenVerifyView

from users.views import (
    CustomTokenObtainPairView,
    CustomTokenBlacklistView,
    RegisterUserAPIView,
    UpdateUserAPIView,
    UserByChatIDAPIView,
    AllPairsAPIView,
    TgAuthView,
    HobbyAPIView,
    HobbyAllAPIView,
    DaysToMatch,
    HobbyTotal,
    RefreshTokenView,
    YandexAuthUrl,
    YandexAuth,
    GetAccessTokenHttponly,
    SendEmailApiView,
    AdminApiViewCreatePairs,
)

app_name = "users"

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='login_token_custom'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/token/blacklist/', CustomTokenBlacklistView.as_view(), name='token_blacklist'),
    re_path(r'api/auth/', include('djoser.urls')),
    path("auth/", include("djoser.urls.jwt")),
    path("api/register/", RegisterUserAPIView.as_view()),
    path("api/update/user/", UpdateUserAPIView.as_view()),
    path("api/user-by-chat-id/<str:chat_id>/", UserByChatIDAPIView.as_view()),
    path("api/pairs/", AllPairsAPIView.as_view()),
    path("api/tg-auth/", TgAuthView.as_view()),
    path("api/hobby/", HobbyAPIView.as_view()),
    path("api/hobby/all/", HobbyAllAPIView.as_view()),
    path("api/days-to-match/", DaysToMatch.as_view()),
    path("api/hobby/total/", HobbyTotal.as_view()),
    path("api/token/refresh/", RefreshTokenView.as_view()),
    path("api/auth/get_yandex_auth_url/", YandexAuthUrl.as_view()),
    path("auth/yandex/verification_code/", YandexAuth.as_view()),
    path("api/access/httponly/", GetAccessTokenHttponly.as_view()),
    path("admin-api/send/emails/", SendEmailApiView.as_view()),
    path("admin-api/create-pairs/", AdminApiViewCreatePairs.as_view()),
    # not api
    path("tg-btn-auth/", TemplateView.as_view(template_name="users/tg_auth.html")),
]

from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta
from .utils import str_to_bool

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "abcdef")

yandex_client_id = os.getenv("YANDEX_CLIENT_ID")
yandex_client_secret = os.getenv("YANDEX_CLIENT_SECRET")

frontend_host = os.getenv("FRONTEND_HOST")

DEBUG = str_to_bool(os.getenv("DEBUG", "True"))

TELEGRAM_BOT_TOKEN = os.getenv("TG_TOKEN")

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "users",
    "rest_framework",
    "djoser",
    "rest_framework.authtoken",
    "corsheaders",
    # 'oauth2_provider',
    # 'social_django',
    # 'drf_social_oauth2',
    "rest_framework_simplejwt.token_blacklist",
    "django_celery_results",  # для хранения результатов выполнения задач Celery в базе данных
    "django_celery_beat",  # для планирования задач Celery
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "users.middleware.SuppressBrowserAuthMiddleware",
]

ROOT_URLCONF = "djangoProject.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "social_django.context_processors.backends",
                "social_django.context_processors.login_redirect",
            ],
        },
    },
]

WSGI_APPLICATION = "djangoProject.wsgi.application"

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

if str_to_bool(os.getenv("DOCKER_PROJECT")):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "HOST": os.getenv("DB_HOST"),
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER"),
            "PASSWORD": os.getenv("DB_PASS"),
            "PORT": "5432",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "djangoProject.validators.CustomMinimumLengthValidator",
    },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    # },
]


AUTHENTICATION_BACKENDS = [
    "djangoProject.auth_backends.EmailAuthBackend",
    "django.contrib.auth.backends.AllowAllUsersModelBackend",
    # 'social_core.backends.telegram.TelegramAuth',
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "ru"

TIME_ZONE = "Asia/Yekaterinburg"
USE_TZ = True

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "/static/"
MEDIA_URL = "/media/"

if str_to_bool(os.getenv("DOCKER_PROJECT")):
    MEDIA_ROOT = "/vol/web/media"
    STATIC_ROOT = "/vol/web/static"
else:
    MEDIA_ROOT = BASE_DIR / "media_dev"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "users.CustomUser"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # 'drf_social_oauth2.authentication.SocialAuthentication',
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}


# SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin-allow-popups"

DJOSER = {
    "SERIALIZERS": {
        "user": "users.serializers.UserSerializer",
        "current_user": "users.serializers.UserSerializer",
        "token_create": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    },
    "EMAIL": {
        "password_reset": "users.views.CustomPasswordResetEmail",
    },
    "LOGIN_FIELD": "email",
    "TOKEN_MODEL": None,
    "PASSWORD_RESET_CONFIRM_URL": "password-reset/{uid}/{token}",
    "PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND": True,
    "DOMAIN": "unimatch.ru",
    "SITE_NAME": "unimatch.ru",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,  # выдается новый refresh-токен
    "BLACKLIST_AFTER_ROTATION": True,  # старый refresh-токен автоматически добавляется в blacklist и больше не работает
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",  # Какое поле модели юзера брать
    "USER_ID_CLAIM": "user_id",  # как оно будет называться в payload
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
    # "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_OBTAIN_SERIALIZER": "users.serializers.EmailTokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
    # "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
}


CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [frontend_host]

CORS_ALLOW_ALL_ORIGINS = True

# === CSRF ===
CSRF_TRUSTED_ORIGINS = [frontend_host]


if str_to_bool(os.getenv("DOCKER_PROJECT")):
    SECURE_HTTP_ONLY = True
else:
    SECURE_HTTP_ONLY = True
# === Куки (важно для кросс-домена) ===
# SESSION_COOKIE_SAMESITE = "None"
# SESSION_COOKIE_SECURE = True
#
# CSRF_COOKIE_SAMESITE = "None"
# CSRF_COOKIE_SECURE = True


# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.timeweb.ru"
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST_USER = "support@unimatch.ru"
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

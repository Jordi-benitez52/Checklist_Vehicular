from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-cambiar-esto-en-produccion')
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
    '192.168.0.248',
    '*.railway.app',
    '*.up.railway.app',
    'localhost:5173',
    'localhost:8000',
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'channels',

    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',

    'accounts',
    'platform_core',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8100',
    'https://localhost:8100',
    'http://127.0.0.1:8100',
    'https://127.0.0.1:8100',
    'http://localhost:5173',
    'https://localhost:5173',
    'http://127.0.0.1:5173',
    'https://127.0.0.1:5173',
    'https://df29-2806-250-430-cab1-00-1cf6.ngrok-free.app',
    'https://3fe9-2806-250-430-cab1-00-1cf6.ngrok-free.app',
    'http://df29-2806-250-430-cab1-00-1cf6.ngrok-free.app',
    'http://3fe9-2806-250-430-cab1-00-1cf6.ngrok-free.app',
    'https://*.ngrok-free.app',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8100',
    'https://localhost:8100',
    'http://127.0.0.1:8100',
    'https://127.0.0.1:8100',
    'http://localhost:8101',
    'https://localhost:8101',
    'http://127.0.0.1:8101',
    'https://127.0.0.1:8101',
    'http://localhost:5173',
    'https://localhost:5173',
    'http://127.0.0.1:5173',
    'https://127.0.0.1:5173',
    'http://192.168.0.248:5173',
    'https://192.168.0.248:5173',
    'http://192.168.0.248:8100',
    'https://192.168.0.248:8100',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'config.middleware_security.SecurityHeadersMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# =============================================================================
# SECURITY HEADERS (OWASP ZAP Recommendations)
# =============================================================================
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Cookie Security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG  # True in production with HTTPS
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = not DEBUG  # True in production with HTTPS
CSRF_COOKIE_SAMESITE = 'Lax'

# HSTS for HTTPS (disable for now since we're in HTTP)
# SECURE_HSTS_SECONDS = 31536000  # Already set above

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    }
}

import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default='postgres://postgres:slendy182@localhost:5432/checklist_vehicular_db',
        conn_max_age=600,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Merida'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8100',
    'https://localhost:8100',
    'http://127.0.0.1:8100',
    'https://127.0.0.1:8100',
    'http://localhost:5173',
    'https://localhost:5173',
    'http://127.0.0.1:5173',
    'https://127.0.0.1:5173',
]

# Restrict CORS to prevent cross-domain issues
CORS_ALLOW_ALL_ORIGINS = True  # TEMPORARY for Ngrok testing
CORS_EXPOSE_HEADERS = ['Content-Type', 'Authorization']

CORS_ALLOW_CREDENTIALS = True

# Frontend URL for password reset links
FRONTEND_URL = 'http://192.168.0.248:5173'

# =============================================================================
# EMAIL CONFIGURATION (Gmail SMTP)
# =============================================================================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'jordi.coronel80@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'hjsu hggt hqko tffw')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'LRA Checklist <jordi.coronel80@gmail.com>')

# =============================================================================
# EMAIL NOTIFICATIONS SETTINGS
# =============================================================================
LOGIN_NOTIFICATION_ENABLED = True
LOGIN_NOTIFICATION_INCLUDE_ADMINS = True

# =============================================================================
# GOOGLE OAUTH CONFIGURATION
# =============================================================================
SITE_ID = 100

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.environ.get('GOOGLE_OAUTH_CLIENT_ID', '333344526735-4giqfgo7enaq5fb79p0enpmrk2qipl4c.apps.googleusercontent.com'),
            'secret': os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET', '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'),
            'key': '',
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}
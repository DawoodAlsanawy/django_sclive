# ========================================
# Django Sick Leave Management System
# Production Settings for Namecheap Deployment
# نظام إدارة الإجازات المرضية - إعدادات الإنتاج
# ========================================

import os
from pathlib import Path
from decouple import config, Csv

# ========================================
# Base Configuration
# ========================================

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ========================================
# Security Settings
# ========================================

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='your-very-secure-secret-key-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

# Allowed hosts for production
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# SSL/HTTPS settings
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ========================================
# Application Definition
# ========================================

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'crispy_forms',
    'crispy_bootstrap4',
    'bootstrap4',
    'django_filters',
]

LOCAL_APPS = [
    'core',
    'accounts',
    'reports',
    'settings_app',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ========================================
# Middleware Configuration
# ========================================

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files serving
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sclive.urls'

# ========================================
# Templates Configuration
# ========================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sclive.wsgi.application'

# ========================================
# Database Configuration
# ========================================

# Production database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='sclive_db'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
            'autocommit': True,
        },
        'CONN_MAX_AGE': 60,  # Connection pooling
    }
}

# ========================================
# Password Validation
# ========================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ========================================
# Internationalization
# ========================================

LANGUAGE_CODE = 'ar'
TIME_ZONE = 'Asia/Riyadh'
USE_I18N = True
USE_TZ = True

# ========================================
# Static Files Configuration
# ========================================

STATIC_URL = '/static/'
STATIC_ROOT = config('STATIC_ROOT', default=BASE_DIR / 'staticfiles')

STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Static files storage for production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ========================================
# Media Files Configuration
# ========================================

MEDIA_URL = '/media/'
MEDIA_ROOT = config('MEDIA_ROOT', default=BASE_DIR / 'media')

# ========================================
# Default Primary Key Field Type
# ========================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========================================
# Crispy Forms Configuration
# ========================================

CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap4"
CRISPY_TEMPLATE_PACK = "bootstrap4"

# ========================================
# Logging Configuration
# ========================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django_errors.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# ========================================
# Email Configuration
# ========================================

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='localhost')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@yourdomain.com')

# ========================================
# Cache Configuration
# ========================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': BASE_DIR / 'cache',
        'TIMEOUT': 300,
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
        }
    }
}

# ========================================
# Session Configuration
# ========================================

SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_SAVE_EVERY_REQUEST = True

# ========================================
# File Upload Configuration
# ========================================

FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# ========================================
# Performance Settings
# ========================================

# Database connection pooling
CONN_MAX_AGE = 60

# Template caching
if not DEBUG:
    TEMPLATES[0]['OPTIONS']['loaders'] = [
        ('django.template.loaders.cached.Loader', [
            'django.template.loaders.filesystem.Loader',
            'django.template.loaders.app_directories.Loader',
        ]),
    ]

# ========================================
# Error Reporting
# ========================================

# Sentry configuration (optional)
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=True
    )

# ========================================
# Custom Settings
# ========================================

# Application specific settings
COMPANY_NAME = config('COMPANY_NAME', default='شركة الرعاية الطبية')
SYSTEM_VERSION = '1.0.0'
SUPPORT_EMAIL = config('SUPPORT_EMAIL', default='support@yourdomain.com')

# Pagination settings
ITEMS_PER_PAGE = 25

# Date format settings
DATE_FORMAT = 'Y-m-d'
DATETIME_FORMAT = 'Y-m-d H:i:s'

# ========================================
# Production Optimizations
# ========================================

# Disable migrations in production (if needed)
# MIGRATION_MODULES = {app: None for app in LOCAL_APPS}

# Optimize database queries
# DATABASES['default']['OPTIONS']['sql_mode'] = 'STRICT_TRANS_TABLES'

# Enable template caching
# TEMPLATES[0]['OPTIONS']['loaders'] = [
#     ('django.template.loaders.cached.Loader', [
#         'django.template.loaders.filesystem.Loader',
#         'django.template.loaders.app_directories.Loader',
#     ]),
# ]

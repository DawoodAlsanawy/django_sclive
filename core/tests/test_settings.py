"""
إعدادات الاختبارات
"""
import os
# استيراد الإعدادات الأساسية
import sys
from pathlib import Path

from sclive.settings import *

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# استخدام قاعدة بيانات SQLite للاختبارات
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',  # استخدام قاعدة بيانات في الذاكرة
    }
}

# تعطيل الهجرات أثناء الاختبارات
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations() if 'test' in sys.argv else {}

# تعطيل الكاش أثناء الاختبارات
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# تعطيل CSRF أثناء الاختبارات
MIDDLEWARE = [m for m in MIDDLEWARE if m != 'django.middleware.csrf.CsrfViewMiddleware']

# تعطيل التحقق من كلمة المرور أثناء الاختبارات
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# تعطيل الأمان أثناء الاختبارات
DEBUG = True
SECRET_KEY = 'test-key'

# تعطيل البريد الإلكتروني أثناء الاختبارات
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# تعطيل الوسائط أثناء الاختبارات
MEDIA_ROOT = os.path.join(BASE_DIR, 'test_media')
MEDIA_URL = '/test_media/'

# تعطيل الملفات الثابتة أثناء الاختبارات
STATIC_ROOT = os.path.join(BASE_DIR, 'test_static')
STATIC_URL = '/test_static/'

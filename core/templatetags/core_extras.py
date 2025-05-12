import os

from django import template
from django.conf import settings
from django.contrib.staticfiles import finders

register = template.Library()

@register.filter
def static_exists(path):
    """
    فلتر للتحقق من وجود ملف ثابت
    """
    # استخدام finders.find للبحث عن الملف في جميع أماكن الملفات الثابتة
    if finders.find(path):
        return True

    # التحقق من وجود الملف في STATIC_ROOT إذا كان محددًا
    if hasattr(settings, 'STATIC_ROOT') and settings.STATIC_ROOT:
        full_path = os.path.join(settings.STATIC_ROOT, path)
        if os.path.exists(full_path):
            return True

    # التحقق من وجود الملف في STATICFILES_DIRS
    if hasattr(settings, 'STATICFILES_DIRS'):
        for static_dir in settings.STATICFILES_DIRS:
            if isinstance(static_dir, (list, tuple)) and len(static_dir) == 2:
                prefix, static_dir = static_dir
            if os.path.exists(os.path.join(static_dir, path)):
                return True

    return False

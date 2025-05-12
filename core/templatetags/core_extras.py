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

@register.filter
def selectattr(items, args):
    """
    فلتر لتصفية قائمة العناصر بناءً على قيمة سمة معينة

    الاستخدام:
    {{ items|selectattr:"attribute_name", "operator", "value" }}

    المعلمات:
    - items: قائمة العناصر المراد تصفيتها
    - args: سلسلة تحتوي على اسم السمة والعملية والقيمة مفصولة بفواصل

    العمليات المدعومة:
    - equalto: تساوي
    - notequalto: لا تساوي
    - contains: تحتوي على
    - startswith: تبدأ بـ
    - endswith: تنتهي بـ

    مثال:
    {{ items|selectattr:"status", "equalto", "active" }}
    """
    if not items:
        return []

    # تقسيم المعلمات
    parts = args.split(',')
    if len(parts) < 3:
        return []

    attr_name = parts[0].strip()
    operator = parts[1].strip().strip('"\'')
    value = parts[2].strip().strip('"\'')

    result = []
    for item in items:
        # الحصول على قيمة السمة
        if not hasattr(item, attr_name):
            continue

        attr_value = getattr(item, attr_name)

        # تطبيق العملية المناسبة
        if operator == 'equalto' and attr_value == value:
            result.append(item)
        elif operator == 'notequalto' and attr_value != value:
            result.append(item)
        elif operator == 'contains' and value in attr_value:
            result.append(item)
        elif operator == 'startswith' and attr_value.startswith(value):
            result.append(item)
        elif operator == 'endswith' and attr_value.endswith(value):
            result.append(item)

    return result

@register.filter
def dictsortreversed(value, arg):
    """
    فلتر لترتيب قائمة القواميس أو كائنات النموذج بشكل عكسي حسب مفتاح أو سمة معينة

    الاستخدام:
    {{ items|dictsortreversed:"key" }}
    """
    def get_value(obj, key):
        """الحصول على قيمة المفتاح أو السمة من الكائن"""
        try:
            # محاولة الوصول كقاموس
            return obj[key]
        except (TypeError, KeyError):
            try:
                # محاولة الوصول كسمة
                return getattr(obj, key)
            except (AttributeError, TypeError):
                # إرجاع قيمة افتراضية إذا لم يتم العثور على المفتاح أو السمة
                return ""

    return sorted(value, key=lambda x: get_value(x, arg), reverse=True)

@register.filter
def add(value, arg):
    """
    فلتر لإضافة قيمة إلى قيمة أخرى

    الاستخدام:
    {{ value|add:arg }}

    مثال:
    {{ 5|add:3 }} -> 8
    {{ "Hello "|add:"World" }} -> "Hello World"
    """
    try:
        return value + arg
    except (ValueError, TypeError):
        try:
            return str(value) + str(arg)
        except Exception:
            return value

@register.filter(name='list')
def to_list(value):
    """
    فلتر لتحويل القيمة إلى قائمة

    الاستخدام:
    {{ value|list }}

    مثال:
    {{ queryset|list }} -> [obj1, obj2, ...]
    """
    if value is None:
        return []

    try:
        return list(value)
    except (ValueError, TypeError):
        return [value]

import base64
import datetime
import os
import re
from datetime import date
from io import BytesIO

import qrcode
from django import template
from django.conf import settings
from django.contrib.staticfiles import finders
from googletrans import Translator
from hijri_converter import Gregorian

# إنشاء كائن المترجم
translator = Translator()

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
def hijri_date(value):
    """
    فلتر لتحويل التاريخ الميلادي إلى تاريخ هجري

    الاستخدام:
    {{ date_value|hijri_date }}

    مثال:
    {{ "2023-01-01"|hijri_date }} -> "1444-06-08"
    """
    if not value:
        return ""

    try:
        if isinstance(value, str):
            # محاولة تحويل النص إلى تاريخ
            try:
                # تجربة تنسيق ISO
                value = datetime.datetime.strptime(value, "%Y-%m-%d").date()
            except ValueError:
                try:
                    # تجربة تنسيق آخر
                    value = datetime.datetime.strptime(value, "%d-%m-%Y").date()
                except ValueError:
                    return value  # إرجاع القيمة الأصلية إذا فشل التحويل

        # تحويل التاريخ الميلادي إلى هجري
        hijri = Gregorian(value.year, value.month, value.day).to_hijri()

        # إرجاع التاريخ الهجري بتنسيق "يوم-شهر-سنة"
        return f"{hijri.day:02d}-{hijri.month:02d}-{hijri.year}"
    except Exception:
        # إرجاع القيمة الأصلية في حالة حدوث أي خطأ
        return value

@register.filter
def translate_to_english(value):
    """
    فلتر لترجمة النص العربي إلى اللغة الإنجليزية

    الاستخدام:
    {{ arabic_text|translate_to_english }}

    مثال:
    {{ "مرحبا بالعالم"|translate_to_english }} -> "Hello World"
    """
    if not value:
        return ""

    try:
        # التحقق من أن النص يحتوي على أحرف عربية
        arabic_pattern = re.compile(r'[\u0600-\u06FF]+')
        if arabic_pattern.search(str(value)):
            # ترجمة النص من العربية إلى الإنجليزية
            translation = translator.translate(str(value), src='ar', dest='en')
            return translation.text
        return value
    except Exception:
        # إرجاع القيمة الأصلية في حالة حدوث أي خطأ
        return value

@register.filter
def to_uppercase(value):
    """
    فلتر لتحويل النص إلى أحرف كبيرة

    الاستخدام:
    {{ text|to_uppercase }}

    مثال:
    {{ "hello world"|to_uppercase }} -> "HELLO WORLD"
    """
    if not value:
        return ""

    try:
        return str(value).upper()
    except Exception:
        return value

@register.filter
def capitalize(value):
    """
    فلتر لتحويل النص إلى أحرف كبيرة

    الاستخدام:
    {{ text|to_uppercase }}

    مثال:
    {{ "hello world"|to_uppercase }} -> "HELLO WORLD"
    """
    if not value:
        return ""

    try:
        return str(value).title()
    except Exception:
        return value

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

@register.filter(name='first_word')
def first_word(value):
    """
    يستخرج أول كلمة من الجملة
    """
    if not value:
        return ''
    return value.split()[0] if value.split() else ''

@register.simple_tag
def generate_qrcode(url, size=200, border=4, fill_color="black", back_color="white"):
    """
    إنشاء QR code لرابط معين

    الاستخدام:
    {% generate_qrcode "https://example.com" %}

    المعلمات:
    - url: الرابط المراد تحويله إلى QR code
    - size: حجم الصورة (افتراضي: 200)
    - border: حجم الحدود (افتراضي: 4)
    - fill_color: لون QR code (افتراضي: أسود)
    - back_color: لون الخلفية (افتراضي: أبيض)

    يعيد:
    - صورة QR code بتنسيق base64 يمكن استخدامها في وسم img
    """
    # حساب حجم المربع بناءً على الحجم المطلوب
    box_size = max(1, int(size / 25))

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color=fill_color, back_color=back_color)

    # تحويل الصورة إلى base64
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{img_str}"
import datetime
import random
import re

from googletrans import Translator
from hijri_converter import Gregorian

from core.models import (CompanionLeave, LeaveInvoice, LeavePrice, Payment,
                         SickLeave)

# إنشاء كائن المترجم
translator = Translator()


def generate_unique_number(prefix, model=None):
    """
    توليد رقم فريد للإجازات والفواتير والمدفوعات

    المعلمات:
    - prefix: بادئة الرقم (PSL/GSL للإجازات المرضية، PSL/GSL لإجازات المرافقين، INV للفواتير، PAY للمدفوعات)
    - model: نموذج البيانات للتحقق من عدم وجود رقم مطابق

    يعيد:
    - رقم فريد بالتنسيق:
      - للإجازات: PREFIXYYYYMMDDXXXXX (مثل PSL20250518123456)
      - للفواتير والمدفوعات: PREFIX-YYYYMMDD-XXXXX
    """
    today = datetime.date.today()
    date_string = today.strftime('%Y')

    # تحديد ما إذا كانت البادئة خاصة بالإجازات (PSL أو GSL)
    is_leave_prefix = prefix in ['PSL', 'GSL']

    # استخدام نطاق أكبر من الأرقام العشوائية لتقليل احتمالية التكرار
    if is_leave_prefix:
        # للإجازات، نستخدم تنسيق PSL/GSL متبوعًا بـ 10 أرقام بدون فواصل
        # نستخدم تاريخ اليوم (YYYYMMDD) متبوعًا بـ 2 أرقام عشوائية
        date_part = today.strftime('%Y%m%d')
        random_num = str(random.randint(10, 99))
        unique_number = f'{prefix}{date_part}{random_num}'

        # التأكد من أن طول الرقم بعد البادئة هو 10 أرقام بالضبط
        digits_after_prefix = unique_number[len(prefix):]
        if len(digits_after_prefix) < 10:
            # إضافة أصفار للوصول إلى 10 أرقام
            unique_number = f'{prefix}{digits_after_prefix.zfill(10)}'
        elif len(digits_after_prefix) > 10:
            # اقتطاع الأرقام الزائدة للوصول إلى 10 أرقام
            unique_number = f'{prefix}{digits_after_prefix[:10]}'
    else:
        # للفواتير والمدفوعات، نستخدم التنسيق القديم
        random_num = str(random.randint(10000, 99999))
        unique_number = f'{prefix}-{date_string}-{random_num}'

    # التحقق من عدم وجود رقم مطابق
    if model:
        field_name = None
        if model == SickLeave or model == CompanionLeave:
            field_name = 'leave_id'
        elif model == LeaveInvoice:
            field_name = 'invoice_number'
        elif model == Payment:
            field_name = 'payment_number'

        if field_name:
            # استمر في توليد أرقام عشوائية حتى تجد رقمًا فريدًا
            attempts = 0
            max_attempts = 100  # تحديد عدد أقصى من المحاولات لتجنب الحلقات اللانهائية

            while model.objects.filter(**{field_name: unique_number}).exists() and attempts < max_attempts:
                # استخدام مزيج من الوقت الحالي والرقم العشوائي لزيادة الفرادة
                timestamp = datetime.datetime.now().strftime('%H%M%S')

                if is_leave_prefix:
                    # للإجازات، نستخدم تنسيق PSL/GSL متبوعًا بـ 10 أرقام بدون فواصل
                    date_part = today.strftime('%Y%m%d')
                    random_num = str(random.randint(10, 99))
                    unique_number = f'{prefix}{date_part}{random_num}'

                    # التأكد من أن طول الرقم بعد البادئة هو 10 أرقام بالضبط
                    digits_after_prefix = unique_number[len(prefix):]
                    if len(digits_after_prefix) < 10:
                        # إضافة أصفار للوصول إلى 10 أرقام
                        unique_number = f'{prefix}{digits_after_prefix.zfill(10)}'
                    elif len(digits_after_prefix) > 10:
                        # اقتطاع الأرقام الزائدة للوصول إلى 10 أرقام
                        unique_number = f'{prefix}{digits_after_prefix[:10]}'
                else:
                    # للفواتير والمدفوعات، نستخدم التنسيق القديم
                    random_num = str(random.randint(10000, 99999))
                    unique_number = f'{prefix}-{date_string}-{random_num}'

                attempts += 1

            # إذا وصلنا إلى الحد الأقصى من المحاولات، نضيف طابعًا زمنيًا كاملًا للتأكد من الفرادة
            if attempts >= max_attempts:
                timestamp = datetime.datetime.now().strftime('%H%M%S%f')

                if is_leave_prefix:
                    # للإجازات، نستخدم تنسيق بدون فواصل
                    unique_number = f'{prefix}{date_string}{timestamp[:10]}'
                else:
                    # للفواتير والمدفوعات، نستخدم التنسيق القديم
                    unique_number = f'{prefix}-{date_string}-{timestamp}'

    return unique_number


def calculate_leave_duration(start_date, end_date):
    """
    حساب مدة الإجازة بالأيام

    المعلمات:
    - start_date: تاريخ بداية الإجازة
    - end_date: تاريخ نهاية الإجازة

    يعيد:
    - عدد أيام الإجازة (بما في ذلك يوم البداية ويوم النهاية)
    """
    if end_date < start_date:
        return 0

    # حساب الفرق بين التاريخين بالأيام
    delta = (end_date - start_date).days

    # إضافة 1 لتضمين يوم البداية
    return delta + 1


def generate_sick_leave_id(prefix='PSL'):
    """
    توليد رقم فريد للإجازة المرضية

    المعلمات:
    - prefix: بادئة الرقم (PSL أو GSL)
    """
    # التأكد من أن البادئة هي PSL أو GSL
    if prefix not in ['PSL', 'GSL']:
        prefix = 'PSL'  # استخدام PSL كبادئة افتراضية

    return generate_unique_number(prefix, SickLeave)


def generate_companion_leave_id(prefix='PSL'):
    """
    توليد رقم فريد لإجازة المرافق

    المعلمات:
    - prefix: بادئة الرقم (PSL أو GSL)
    """
    # التأكد من أن البادئة هي PSL أو GSL
    if prefix not in ['PSL', 'GSL']:
        prefix = 'PSL'  # استخدام PSL كبادئة افتراضية

    return generate_unique_number(prefix, CompanionLeave)


def generate_invoice_number():
    """
    توليد رقم فريد للفاتورة
    """
    return generate_unique_number('INV', LeaveInvoice)


def generate_payment_number():
    """
    توليد رقم فريد للدفعة
    """
    return generate_unique_number('PAY', Payment)


def translate_text(text, src='ar', dest='en'):
    """
    ترجمة نص من لغة إلى أخرى

    المعلمات:
    - text: النص المراد ترجمته
    - src: لغة المصدر (افتراضيًا: العربية)
    - dest: لغة الهدف (افتراضيًا: الإنجليزية)

    يعيد:
    - النص المترجم
    """
    if not text:
        return ""

    try:
        # التحقق من أن النص يحتوي على أحرف من لغة المصدر
        if src == 'ar':
            # التحقق من وجود أحرف عربية
            arabic_pattern = re.compile(r'[\u0600-\u06FF]+')
            if not arabic_pattern.search(str(text)):
                return text

        # ترجمة النص
        translation = translator.translate(str(text), src=src, dest=dest)
        return translation.text
    except Exception as e:
        print(f"خطأ في الترجمة: {e}")
        return text


def convert_to_hijri(date_obj):
    """
    تحويل تاريخ ميلادي إلى تاريخ هجري

    المعلمات:
    - date_obj: كائن تاريخ ميلادي (datetime.date)

    يعيد:
    - سلسلة نصية تمثل التاريخ الهجري بتنسيق "YYYY-MM-DD"
    """
    if not date_obj:
        return ""

    try:
        g_date = Gregorian(date_obj.year, date_obj.month, date_obj.day)
        hijri_date = g_date.to_hijri()
        return f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"
    except Exception as e:
        print(f"خطأ في تحويل التاريخ إلى هجري: {e}")
        return ""


def get_leave_price(leave_type, duration, client=None):
    """
    الحصول على سعر الإجازة بناءً على نوعها ومدتها والعميل

    المعلمات:
    - leave_type: نوع الإجازة ('sick_leave' أو 'companion_leave')
    - duration: مدة الإجازة بالأيام
    - client: العميل (اختياري)

    يعيد:
    - سعر الإجازة
    """
    # استخدام دالة get_price من نموذج LeavePrice
    from core.models import LeavePrice
    return LeavePrice.get_price(leave_type, duration, client)

import datetime
import random

from core.models import (CompanionLeave, LeaveInvoice, LeavePrice, Payment,
                         SickLeave)


def generate_unique_number(prefix, model=None):
    """
    توليد رقم فريد للإجازات والفواتير والمدفوعات

    المعلمات:
    - prefix: بادئة الرقم (SL للإجازات المرضية، CL لإجازات المرافقين، INV للفواتير، PAY للمدفوعات)
    - model: نموذج البيانات للتحقق من عدم وجود رقم مطابق

    يعيد:
    - رقم فريد بالتنسيق: PREFIX-YYYYMMDD-XXXXX
    """
    today = datetime.date.today()
    date_string = today.strftime('%Y%m%d')

    # استخدام نطاق أكبر من الأرقام العشوائية (10000-99999) لتقليل احتمالية التكرار
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
                random_num = str(random.randint(10000, 99999))
                unique_number = f'{prefix}-{date_string}-{timestamp[:2]}{random_num}'
                attempts += 1

            # إذا وصلنا إلى الحد الأقصى من المحاولات، نضيف طابعًا زمنيًا كاملًا للتأكد من الفرادة
            if attempts >= max_attempts:
                timestamp = datetime.datetime.now().strftime('%H%M%S%f')
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


def generate_sick_leave_id():
    """
    توليد رقم فريد للإجازة المرضية
    """
    return generate_unique_number('SL', SickLeave)


def generate_companion_leave_id():
    """
    توليد رقم فريد لإجازة المرافق
    """
    return generate_unique_number('CL', CompanionLeave)


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
    from decimal import Decimal

    # البحث عن سعر ثابت خاص بالعميل
    if client:
        fixed_price = LeavePrice.objects.filter(
            leave_type=leave_type,
            pricing_type='fixed',
            client=client,
            is_active=True
        ).first()

        if fixed_price:
            return fixed_price.price

    # البحث عن سعر ثابت عام
    fixed_price = LeavePrice.objects.filter(
        leave_type=leave_type,
        pricing_type='fixed',
        client__isnull=True,
        is_active=True
    ).first()

    if fixed_price:
        return fixed_price.price

    # البحث عن سعر يومي خاص بالعميل
    if client:
        per_day_price = LeavePrice.objects.filter(
            leave_type=leave_type,
            pricing_type='per_day',
            client=client,
            is_active=True
        ).first()

        if per_day_price:
            return per_day_price.price * Decimal(duration)

    # البحث عن سعر يومي عام
    per_day_price = LeavePrice.objects.filter(
        leave_type=leave_type,
        pricing_type='per_day',
        client__isnull=True,
        is_active=True
    ).first()

    if per_day_price:
        return per_day_price.price * Decimal(duration)

    # إذا لم يتم العثور على أي سعر
    return Decimal('0')

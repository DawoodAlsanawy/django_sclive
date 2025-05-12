import datetime
import random

from core.models import CompanionLeave, LeaveInvoice, Payment, SickLeave


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

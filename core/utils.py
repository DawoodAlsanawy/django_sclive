import datetime
import random
from core.models import SickLeave, CompanionLeave, LeaveInvoice, Payment


def generate_unique_number(prefix, model=None):
    """
    توليد رقم فريد للإجازات والفواتير والمدفوعات
    
    المعلمات:
    - prefix: بادئة الرقم (SL للإجازات المرضية، CL لإجازات المرافقين، INV للفواتير، PAY للمدفوعات)
    - model: نموذج البيانات للتحقق من عدم وجود رقم مطابق
    
    يعيد:
    - رقم فريد بالتنسيق: PREFIX-YYYYMMDD-XXX
    """
    today = datetime.date.today()
    date_string = today.strftime('%Y%m%d')
    random_num = str(random.randint(100, 999))
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
            while model.objects.filter(**{field_name: unique_number}).exists():
                random_num = str(random.randint(100, 999))
                unique_number = f'{prefix}-{date_string}-{random_num}'
    
    return unique_number

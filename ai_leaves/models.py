from django.db import models
from django.utils import timezone

from core.models import CompanionLeave, Patient, SickLeave


class LeaveRequest(models.Model):
    """نموذج طلب الإجازة"""
    request_text = models.TextField(verbose_name='نص الطلب')
    processed = models.BooleanField(default=False, verbose_name='تمت المعالجة')
    leave_type = models.CharField(max_length=20, choices=[
        ('sick_leave', 'إجازة مرضية'),
        ('companion_leave', 'إجازة مرافق')
    ], null=True, blank=True, verbose_name='نوع الإجازة')
    leave_id = models.CharField(max_length=20, null=True, blank=True, verbose_name='رقم الإجازة')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'طلب إجازة'
        verbose_name_plural = 'طلبات الإجازات'

    def __str__(self):
        return f"طلب {self.id} - {self.get_leave_type_display() if self.leave_type else 'غير معالج'}"

    def extract_info(self):
        """استخراج المعلومات من نص الطلب باستخدام معالج BERT"""
        from ai_leaves.bert_processor import extract_info_with_bert
        return extract_info_with_bert(self.request_text)

    def process_request(self):
        """معالجة الطلب وإنشاء الإجازة والفاتورة باستخدام معالج BERT"""
        if self.processed:
            return False

        from ai_leaves.bert_processor import process_leave_request

        # استخدام معالج BERT لاستخراج المعلومات ومعالجتها
        leave_data = process_leave_request(self.request_text, self.leave_type)

        # البحث عن المريض أو إنشاء مريض جديد
        patient, _ = Patient.objects.get_or_create(
            national_id=leave_data['patient_info']['national_id'],
            defaults={
                'name': leave_data['patient_info']['name'],
                'nationality': leave_data['patient_info']['nationality'],
                'employer_name': leave_data['patient_info']['employer_name'],
                'address': leave_data['patient_info']['address']
            }
        )

        # إنشاء الإجازة المناسبة حسب النوع
        leave = None
        if self.leave_type == 'sick_leave':
            # إنشاء إجازة مرضية
            from core.utils import generate_unique_number
            leave_id = generate_unique_number('SL', SickLeave)

            # البحث عن الطبيب أو إنشاء طبيب جديد
            from core.models import Doctor, Hospital
            hospital, _ = Hospital.objects.get_or_create(
                name=leave_data['hospital_info']['name']
            )

            doctor, _ = Doctor.objects.get_or_create(
                national_id='1234567890',  # رقم افتراضي
                defaults={
                    'name': 'طبيب افتراضي',
                    'hospital': hospital
                }
            )

            leave = SickLeave.objects.create(
                leave_id=leave_id,
                patient=patient,
                doctor=doctor,
                start_date=leave_data['leave_info']['start_date'],
                end_date=leave_data['leave_info']['end_date'],
                issue_date=timezone.now().date()
            )

        elif self.leave_type == 'companion_leave':
            # إنشاء إجازة مرافق
            from core.utils import generate_unique_number
            leave_id = generate_unique_number('CL', CompanionLeave)

            # البحث عن الطبيب أو إنشاء طبيب جديد
            from core.models import Doctor, Hospital
            hospital, _ = Hospital.objects.get_or_create(
                name=leave_data['hospital_info']['name']
            )

            doctor, _ = Doctor.objects.get_or_create(
                national_id='1234567890',  # رقم افتراضي
                defaults={
                    'name': 'طبيب افتراضي',
                    'hospital': hospital
                }
            )

            # استخدام نفس المريض كمرافق (يمكن تعديل هذا لاحقًا)
            companion = patient

            leave = CompanionLeave.objects.create(
                leave_id=leave_id,
                patient=patient,
                companion=companion,
                doctor=doctor,
                start_date=leave_data['leave_info']['start_date'],
                end_date=leave_data['leave_info']['end_date'],
                issue_date=timezone.now().date()
            )

        # تحديث حالة الطلب
        if leave:
            self.processed = True
            self.leave_id = leave.id
            self.save()

        return leave

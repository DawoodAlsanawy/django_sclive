from datetime import date, timedelta
from decimal import Decimal

from django.test import Client as TestClient
from django.test import TestCase
from django.urls import reverse

from core.models import (Client, CompanionLeave, Doctor, Hospital,
                         LeaveInvoice, Patient, SickLeave, User)


class DataTransferTest(TestCase):
    """اختبارات نقل البيانات بين الواجهات"""

    def setUp(self):
        # إنشاء مستخدم للاختبار
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )

        # إنشاء مستشفى للاختبار
        self.hospital = Hospital.objects.create(
            name="مستشفى الاختبار",
            address="الرياض، المملكة العربية السعودية"
        )

        # إنشاء طبيب للاختبار
        self.doctor = Doctor.objects.create(
            national_id="1234567890",
            name="د. أحمد الاختبار",
            position="طبيب عام",
            hospital=self.hospital
        )

        # إنشاء مريض للاختبار
        self.patient = Patient.objects.create(
            national_id="0987654321",
            name="محمد الاختبار",
            employer_name="شركة الاختبار"
        )

        # إنشاء مرافق للاختبار
        self.companion = Patient.objects.create(
            national_id="1122334455",
            name="علي الاختبار",
            employer_name="شركة الاختبار"
        )

        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678",
            email="client@example.com"
        )

        # إنشاء إجازة مرضية للاختبار
        self.sick_leave = SickLeave.objects.create(
            leave_id="SL-20230101-001",
            patient=self.patient,
            doctor=self.doctor,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5),
            issue_date=date.today()
        )

        # إنشاء إجازة مرافق للاختبار
        self.companion_leave = CompanionLeave.objects.create(
            leave_id="CL-20230101-001",
            patient=self.patient,
            companion=self.companion,
            doctor=self.doctor,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=3),
            issue_date=date.today()
        )

        # إنشاء عميل اختبار للطلبات HTTP
        self.test_client = TestClient()
        self.test_client.login(username='testuser', password='testpassword')

    def test_patient_data_transfer_to_sick_leave(self):
        """اختبار نقل بيانات المريض إلى صفحة إنشاء الإجازة المرضية"""
        # الوصول إلى صفحة إنشاء إجازة مرضية مع تحديد المريض
        response = self.test_client.get(
            reverse('core:sick_leave_create') + f'?patient_id={self.patient.id}'
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من وجود بيانات المريض في السياق
        self.assertIn('patient', response.context)
        self.assertEqual(response.context['patient'], self.patient)

    def test_doctor_data_transfer_to_sick_leave(self):
        """اختبار نقل بيانات الطبيب إلى صفحة إنشاء الإجازة المرضية"""
        # الوصول إلى صفحة إنشاء إجازة مرضية مع تحديد الطبيب
        response = self.test_client.get(
            reverse('core:sick_leave_create') + f'?doctor_id={self.doctor.id}'
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من وجود بيانات الطبيب في السياق
        self.assertIn('doctor', response.context)
        self.assertEqual(response.context['doctor'], self.doctor)

    def test_patient_and_doctor_data_transfer_to_sick_leave(self):
        """اختبار نقل بيانات المريض والطبيب معًا إلى صفحة إنشاء الإجازة المرضية"""
        # الوصول إلى صفحة إنشاء إجازة مرضية مع تحديد المريض والطبيب
        response = self.test_client.get(
            reverse('core:sick_leave_create') + f'?patient_id={self.patient.id}&doctor_id={self.doctor.id}'
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من وجود بيانات المريض والطبيب في السياق
        self.assertIn('patient', response.context)
        self.assertEqual(response.context['patient'], self.patient)
        self.assertIn('doctor', response.context)
        self.assertEqual(response.context['doctor'], self.doctor)

    def test_patient_data_transfer_to_companion_leave(self):
        """اختبار نقل بيانات المريض إلى صفحة إنشاء إجازة المرافق"""
        # الوصول إلى صفحة إنشاء إجازة مرافق مع تحديد المريض
        response = self.test_client.get(
            reverse('core:companion_leave_create') + f'?patient_id={self.patient.id}'
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من وجود بيانات المريض في السياق
        self.assertIn('patient', response.context)
        self.assertEqual(response.context['patient'], self.patient)

    def test_companion_data_transfer_to_companion_leave(self):
        """اختبار نقل بيانات المرافق إلى صفحة إنشاء إجازة المرافق"""
        # الوصول إلى صفحة إنشاء إجازة مرافق مع تحديد المرافق
        response = self.test_client.get(
            reverse('core:companion_leave_create') + f'?companion_id={self.companion.id}'
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من وجود بيانات المرافق في السياق
        self.assertIn('companion', response.context)
        self.assertEqual(response.context['companion'], self.companion)

    def test_sick_leave_data_transfer_to_invoice(self):
        """اختبار نقل بيانات الإجازة المرضية إلى صفحة إنشاء الفاتورة"""
        # الوصول إلى صفحة إنشاء فاتورة مع تحديد الإجازة المرضية
        response = self.test_client.get(
            reverse('core:leave_invoice_create') + f'?leave_type=sick_leave&leave_id={self.sick_leave.leave_id}'
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من وجود بيانات الإجازة المرضية في السياق
        self.assertIn('leave_type', response.context)
        self.assertEqual(response.context['leave_type'], 'sick_leave')
        self.assertIn('leave_id', response.context)
        self.assertEqual(response.context['leave_id'], self.sick_leave.leave_id)

    def test_companion_leave_data_transfer_to_invoice(self):
        """اختبار نقل بيانات إجازة المرافق إلى صفحة إنشاء الفاتورة"""
        # الوصول إلى صفحة إنشاء فاتورة مع تحديد إجازة المرافق
        response = self.test_client.get(
            reverse('core:leave_invoice_create') + f'?leave_type=companion_leave&leave_id={self.companion_leave.leave_id}'
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من وجود بيانات إجازة المرافق في السياق
        self.assertIn('leave_type', response.context)
        self.assertEqual(response.context['leave_type'], 'companion_leave')
        self.assertIn('leave_id', response.context)
        self.assertEqual(response.context['leave_id'], self.companion_leave.leave_id)

    def test_client_data_transfer_to_payment(self):
        """اختبار نقل بيانات العميل إلى صفحة إنشاء الدفعة"""
        # الوصول إلى صفحة إنشاء دفعة مع تحديد العميل
        response = self.test_client.get(
            reverse('core:payment_create') + f'?client_id={self.client_obj.id}'
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من وجود بيانات العميل في السياق
        self.assertIn('client', response.context)
        self.assertEqual(response.context['client'], self.client_obj)

        # التحقق من وجود فواتير العميل في السياق
        self.assertIn('client_invoices', response.context)

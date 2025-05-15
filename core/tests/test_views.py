from datetime import date, timedelta
from decimal import Decimal

from django.test import Client as TestClient
from django.test import TestCase
from django.urls import reverse

from core.models import (Client, CompanionLeave, Doctor, Hospital,
                         LeaveInvoice, LeavePrice, Patient, Payment,
                         PaymentDetail, SickLeave, User)


class SickLeaveViewsTest(TestCase):
    """اختبارات وظائف عرض الإجازات المرضية"""

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

        # إنشاء سعر للإجازة المرضية
        self.leave_price = LeavePrice.objects.create(
            leave_type="sick_leave",
            duration_days=6,
            client=self.client_obj,
            price=Decimal("1000.00"),
            pricing_type="fixed",
            is_active=True
        )

        # إنشاء عميل اختبار للطلبات HTTP
        self.test_client = TestClient()
        self.test_client.login(username='testuser', password='testpassword')

    def test_sick_leave_list_view(self):
        """اختبار عرض قائمة الإجازات المرضية"""
        # الوصول إلى صفحة قائمة الإجازات المرضية
        response = self.test_client.get(reverse('core:sick_leave_list'))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/sick_leaves/list.html')

        # التحقق من وجود الإجازة المرضية في السياق
        self.assertIn('sick_leaves', response.context)
        self.assertEqual(len(response.context['sick_leaves']), 1)
        self.assertEqual(response.context['sick_leaves'][0], self.sick_leave)

    def test_sick_leave_detail_view(self):
        """اختبار عرض تفاصيل الإجازة المرضية"""
        # الوصول إلى صفحة تفاصيل الإجازة المرضية
        response = self.test_client.get(reverse('core:sick_leave_detail', args=[self.sick_leave.id]))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/sick_leaves/detail.html')

        # التحقق من وجود الإجازة المرضية في السياق
        self.assertIn('sick_leave', response.context)
        self.assertEqual(response.context['sick_leave'], self.sick_leave)

    def test_sick_leave_create_view(self):
        """اختبار إنشاء إجازة مرضية جديدة"""
        # بيانات الإجازة المرضية الجديدة
        data = {
            'leave_id': 'SL-20230101-002',
            'patient': self.patient.id,
            'doctor': self.doctor.id,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=3),
            'issue_date': date.today(),
            'status': 'active',
            'client': self.client_obj.id,  # إضافة العميل
            # حقول إضافية قد تكون مطلوبة
            'new_patient_national_id': '',
            'new_patient_name': '',
            'new_patient_phone': '',
            'new_patient_employer_name': '',
            'new_doctor_national_id': '',
            'new_doctor_name': '',
            'new_doctor_position': '',
            'new_doctor_hospital': '',
            'admission_date': '',
            'discharge_date': ''
        }

        # إرسال طلب POST لإنشاء إجازة مرضية جديدة
        response = self.test_client.post(reverse('core:sick_leave_create'), data, follow=True)

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من إنشاء الإجازة المرضية
        self.assertEqual(SickLeave.objects.count(), 2)
        new_sick_leave = SickLeave.objects.get(leave_id='SL-20230101-002')
        self.assertEqual(new_sick_leave.patient, self.patient)
        self.assertEqual(new_sick_leave.doctor, self.doctor)
        self.assertEqual(new_sick_leave.duration_days, 4)

    def test_sick_leave_edit_view(self):
        """اختبار تعديل إجازة مرضية"""
        # بيانات التعديل
        data = {
            'leave_id': self.sick_leave.leave_id,
            'patient': self.patient.id,
            'doctor': self.doctor.id,
            'start_date': self.sick_leave.start_date,
            'end_date': date.today() + timedelta(days=7),  # تغيير تاريخ النهاية
            'issue_date': self.sick_leave.issue_date,
            'status': self.sick_leave.status,
            'client': self.client_obj.id  # إضافة عميل
        }

        # إرسال طلب POST لتعديل الإجازة المرضية
        response = self.test_client.post(
            reverse('core:sick_leave_edit', args=[self.sick_leave.id]),
            data,
            follow=True
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # إعادة تحميل الإجازة المرضية من قاعدة البيانات
        self.sick_leave.refresh_from_db()

        # التحقق من تحديث الإجازة المرضية
        self.assertEqual(self.sick_leave.end_date, date.today() + timedelta(days=7))
        self.assertEqual(self.sick_leave.duration_days, 8)

        # التحقق من إنشاء فاتورة للإجازة المرضية
        invoices = LeaveInvoice.objects.filter(
            leave_type="sick_leave",
            leave_id=self.sick_leave.leave_id
        )
        self.assertEqual(invoices.count(), 1)

        # التحقق من بيانات الفاتورة
        invoice = invoices.first()
        self.assertEqual(invoice.client, self.client_obj)
        self.assertEqual(invoice.amount, Decimal("1000.00"))  # السعر المحدد في LeavePrice

    def test_sick_leave_delete_view(self):
        """اختبار حذف إجازة مرضية"""
        # إرسال طلب POST لحذف الإجازة المرضية
        response = self.test_client.post(
            reverse('core:sick_leave_delete', args=[self.sick_leave.id]),
            follow=True
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من حذف الإجازة المرضية
        self.assertEqual(SickLeave.objects.count(), 0)

    def test_sick_leave_print_view(self):
        """اختبار طباعة الإجازة المرضية"""
        # الوصول إلى صفحة طباعة الإجازة المرضية
        response = self.test_client.get(reverse('core:sick_leave_print', args=[self.sick_leave.id]))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/sick_leaves/print.html')

        # التحقق من وجود الإجازة المرضية في السياق
        self.assertIn('sick_leave', response.context)
        self.assertEqual(response.context['sick_leave'], self.sick_leave)


class CompanionLeaveViewsTest(TestCase):
    """اختبارات وظائف عرض إجازات المرافقين"""

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

        # إنشاء سعر لإجازة المرافق
        self.leave_price = LeavePrice.objects.create(
            leave_type="companion_leave",
            duration_days=4,
            client=self.client_obj,
            price=Decimal("800.00"),
            pricing_type="fixed",
            is_active=True
        )

        # إنشاء عميل اختبار للطلبات HTTP
        self.test_client = TestClient()
        self.test_client.login(username='testuser', password='testpassword')

    def test_companion_leave_list_view(self):
        """اختبار عرض قائمة إجازات المرافقين"""
        # الوصول إلى صفحة قائمة إجازات المرافقين
        response = self.test_client.get(reverse('core:companion_leave_list'))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/companion_leaves/list.html')

        # التحقق من وجود إجازة المرافق في السياق
        self.assertIn('companion_leaves', response.context)
        self.assertEqual(len(response.context['companion_leaves']), 1)
        self.assertEqual(response.context['companion_leaves'][0], self.companion_leave)

    def test_companion_leave_detail_view(self):
        """اختبار عرض تفاصيل إجازة المرافق"""
        # الوصول إلى صفحة تفاصيل إجازة المرافق
        response = self.test_client.get(reverse('core:companion_leave_detail', args=[self.companion_leave.id]))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/companion_leaves/detail.html')

        # التحقق من وجود إجازة المرافق في السياق
        self.assertIn('companion_leave', response.context)
        self.assertEqual(response.context['companion_leave'], self.companion_leave)

    def test_companion_leave_create_view(self):
        """اختبار إنشاء إجازة مرافق جديدة"""
        # بيانات إجازة المرافق الجديدة
        data = {
            'leave_id': 'CL-20230101-002',
            'patient': self.patient.id,
            'companion': self.companion.id,
            'doctor': self.doctor.id,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=5),
            'issue_date': date.today(),
            'status': 'active',
            'client': self.client_obj.id,  # إضافة العميل
            # حقول إضافية قد تكون مطلوبة
            'new_patient_national_id': '',
            'new_patient_name': '',
            'new_patient_phone': '',
            'new_patient_employer_name': '',
            'new_companion_national_id': '',
            'new_companion_name': '',
            'new_companion_phone': '',
            'new_companion_employer_name': '',
            'new_doctor_national_id': '',
            'new_doctor_name': '',
            'new_doctor_position': '',
            'new_doctor_hospital': '',
            'admission_date': '',
            'discharge_date': ''
        }

        # إرسال طلب POST لإنشاء إجازة مرافق جديدة
        response = self.test_client.post(reverse('core:companion_leave_create'), data, follow=True)

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من إنشاء إجازة المرافق
        self.assertEqual(CompanionLeave.objects.count(), 2)
        new_companion_leave = CompanionLeave.objects.get(leave_id='CL-20230101-002')
        self.assertEqual(new_companion_leave.patient, self.patient)
        self.assertEqual(new_companion_leave.companion, self.companion)
        self.assertEqual(new_companion_leave.doctor, self.doctor)
        self.assertEqual(new_companion_leave.duration_days, 6)

    def test_companion_leave_edit_view(self):
        """اختبار تعديل إجازة مرافق"""
        # بيانات التعديل
        data = {
            'leave_id': self.companion_leave.leave_id,
            'patient': self.patient.id,
            'companion': self.companion.id,
            'doctor': self.doctor.id,
            'start_date': self.companion_leave.start_date,
            'end_date': date.today() + timedelta(days=5),  # تغيير تاريخ النهاية
            'issue_date': self.companion_leave.issue_date,
            'status': self.companion_leave.status,
            'client': self.client_obj.id  # إضافة عميل
        }

        # إرسال طلب POST لتعديل إجازة المرافق
        response = self.test_client.post(
            reverse('core:companion_leave_edit', args=[self.companion_leave.id]),
            data,
            follow=True
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # إعادة تحميل إجازة المرافق من قاعدة البيانات
        self.companion_leave.refresh_from_db()

        # التحقق من تحديث إجازة المرافق
        self.assertEqual(self.companion_leave.end_date, date.today() + timedelta(days=5))
        self.assertEqual(self.companion_leave.duration_days, 6)

        # التحقق من إنشاء فاتورة لإجازة المرافق
        invoices = LeaveInvoice.objects.filter(
            leave_type="companion_leave",
            leave_id=self.companion_leave.leave_id
        )
        self.assertEqual(invoices.count(), 1)

        # التحقق من بيانات الفاتورة
        invoice = invoices.first()
        self.assertEqual(invoice.client, self.client_obj)
        self.assertEqual(invoice.amount, Decimal("800.00"))  # السعر المحدد في LeavePrice

    def test_companion_leave_delete_view(self):
        """اختبار حذف إجازة مرافق"""
        # إرسال طلب POST لحذف إجازة المرافق
        response = self.test_client.post(
            reverse('core:companion_leave_delete', args=[self.companion_leave.id]),
            follow=True
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من حذف إجازة المرافق
        self.assertEqual(CompanionLeave.objects.count(), 0)

    def test_companion_leave_print_view(self):
        """اختبار طباعة إجازة المرافق"""
        # الوصول إلى صفحة طباعة إجازة المرافق
        response = self.test_client.get(reverse('core:companion_leave_print', args=[self.companion_leave.id]))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/companion_leaves/print.html')

        # التحقق من وجود إجازة المرافق في السياق
        self.assertIn('companion_leave', response.context)
        self.assertEqual(response.context['companion_leave'], self.companion_leave)
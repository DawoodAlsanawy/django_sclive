from datetime import date, timedelta
from decimal import Decimal

from django.test import Client as TestClient
from django.test import TestCase
from django.urls import reverse

from core.models import (Client, CompanionLeave, Doctor, Hospital,
                         LeaveInvoice, LeavePrice, Patient, Payment,
                         PaymentDetail, SickLeave, User)


class LeaveInvoiceViewsTest(TestCase):
    """اختبارات وظائف عرض فواتير الإجازات"""

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

        # إنشاء فاتورة للاختبار
        self.invoice = LeaveInvoice.objects.create(
            invoice_number="INV-20230101-001",
            client=self.client_obj,
            leave_type="sick_leave",
            leave_id=self.sick_leave.leave_id,
            amount=Decimal("1000.00"),
            status="unpaid",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        # إنشاء عميل اختبار للطلبات HTTP
        self.test_client = TestClient()
        self.test_client.login(username='testuser', password='testpassword')

    def test_invoice_list_view(self):
        """اختبار عرض قائمة الفواتير"""
        # الوصول إلى صفحة قائمة الفواتير
        response = self.test_client.get(reverse('core:leave_invoice_list'))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/leave_invoices/list.html')

        # التحقق من وجود الفاتورة في السياق
        self.assertIn('leave_invoices', response.context)
        self.assertEqual(len(response.context['leave_invoices']), 1)

    def test_invoice_detail_view(self):
        """اختبار عرض تفاصيل الفاتورة"""
        # الوصول إلى صفحة تفاصيل الفاتورة
        response = self.test_client.get(reverse('core:leave_invoice_detail', args=[self.invoice.id]))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/leave_invoices/detail.html')

        # التحقق من وجود الفاتورة في السياق
        self.assertIn('leave_invoice', response.context)
        self.assertEqual(response.context['leave_invoice'], self.invoice)

    def test_invoice_create_view(self):
        """اختبار إنشاء فاتورة جديدة"""
        # بيانات الفاتورة الجديدة
        data = {
            'invoice_number': 'INV-20230101-002',
            'client': self.client_obj.id,
            'leave_type': 'sick_leave',
            'leave_id': self.sick_leave.leave_id,
            'amount': '1200.00',
            'status': 'unpaid',
            'issue_date': date.today(),
            'due_date': date.today() + timedelta(days=30)
        }

        # إرسال طلب POST لإنشاء فاتورة جديدة
        response = self.test_client.post(reverse('core:leave_invoice_create'), data, follow=True)

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من إنشاء الفاتورة
        self.assertEqual(LeaveInvoice.objects.count(), 2)
        new_invoice = LeaveInvoice.objects.get(invoice_number='INV-20230101-002')
        self.assertEqual(new_invoice.client, self.client_obj)
        self.assertEqual(new_invoice.leave_type, 'sick_leave')
        self.assertEqual(new_invoice.leave_id, self.sick_leave.leave_id)
        self.assertEqual(new_invoice.amount, Decimal('1200.00'))

    def test_invoice_edit_view(self):
        """اختبار تعديل الفاتورة"""
        # بيانات التعديل
        data = {
            'invoice_number': self.invoice.invoice_number,
            'client': self.client_obj.id,
            'leave_type': self.invoice.leave_type,
            'leave_id': self.invoice.leave_id,
            'amount': '1500.00',  # تغيير المبلغ
            'status': 'unpaid',  # الحالة تبقى كما هي
            'issue_date': self.invoice.issue_date,
            'due_date': self.invoice.due_date
        }

        # إرسال طلب POST لتعديل الفاتورة
        response = self.test_client.post(
            reverse('core:leave_invoice_edit', args=[self.invoice.id]),
            data,
            follow=True
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # إعادة تحميل الفاتورة من قاعدة البيانات
        self.invoice.refresh_from_db()

        # التحقق من تحديث الفاتورة
        self.assertEqual(self.invoice.amount, Decimal('1500.00'))
        self.assertEqual(self.invoice.status, 'unpaid')

    def test_invoice_delete_view(self):
        """اختبار حذف الفاتورة"""
        # إرسال طلب POST لحذف الفاتورة
        response = self.test_client.post(
            reverse('core:leave_invoice_delete', args=[self.invoice.id]),
            follow=True
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من حذف الفاتورة
        self.assertEqual(LeaveInvoice.objects.count(), 0)

    def test_invoice_print_view(self):
        """اختبار طباعة الفاتورة"""
        # الوصول إلى صفحة طباعة الفاتورة
        response = self.test_client.get(reverse('core:leave_invoice_print', args=[self.invoice.id]))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/leave_invoices/print.html')

        # التحقق من وجود الفاتورة في السياق
        self.assertIn('invoice', response.context)
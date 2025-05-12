from datetime import date, timedelta
from decimal import Decimal

from django.test import Client as TestClient
from django.test import TestCase
from django.urls import reverse

from core.models import (Client, CompanionLeave, Doctor, Employer, Hospital,
                         LeaveInvoice, LeavePrice, Patient, Payment,
                         PaymentDetail, SickLeave, User)


class ClientViewsTest(TestCase):
    """اختبارات وظائف العميل"""

    def setUp(self):
        # إنشاء مستخدم للاختبار
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword'
        )

        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678",
            email="test@example.com",
            address="الرياض، المملكة العربية السعودية"
        )

        # إنشاء عميل اختبار للطلبات HTTP
        self.test_client = TestClient()
        self.test_client.login(username='testuser', password='testpassword')

    def test_client_list_view(self):
        """اختبار عرض قائمة العملاء"""
        # إنشاء عملاء إضافيين
        Client.objects.create(name="شركة الاختبار 2", phone="0512345679")
        Client.objects.create(name="شركة الاختبار 3", phone="0512345680")

        # الوصول إلى صفحة قائمة العملاء
        response = self.test_client.get(reverse('core:client_list'))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/client_list.html')

        # التحقق من أن جميع العملاء موجودون في السياق
        self.assertEqual(len(response.context['clients']), 3)

    def test_client_detail_view(self):
        """اختبار عرض تفاصيل العميل"""
        # إنشاء فاتورة للعميل
        LeaveInvoice.objects.create(
            invoice_number="INV-20230101-001",
            client=self.client_obj,
            leave_type="sick_leave",
            leave_id="SL-20230101-001",
            amount=Decimal("1000.00"),
            status="unpaid",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        # إنشاء دفعة للعميل
        Payment.objects.create(
            payment_number="PAY-20230101-001",
            client=self.client_obj,
            amount=Decimal("500.00"),
            payment_method="cash",
            payment_date=date.today()
        )

        # الوصول إلى صفحة تفاصيل العميل
        response = self.test_client.get(
            reverse('core:client_detail', args=[self.client_obj.id])
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/client_detail.html')

        # التحقق من أن العميل الصحيح موجود في السياق
        self.assertEqual(response.context['client'], self.client_obj)

        # التحقق من أن الفواتير والمدفوعات موجودة في السياق
        self.assertEqual(len(response.context['invoices']), 1)
        self.assertEqual(len(response.context['payments']), 1)

    def test_client_create_view(self):
        """اختبار إنشاء عميل جديد"""
        # بيانات العميل الجديد
        new_client_data = {
            'name': 'شركة جديدة',
            'phone': '0512345681',
            'email': 'new@example.com',
            'address': 'جدة، المملكة العربية السعودية'
        }

        # إرسال طلب POST لإنشاء عميل جديد
        response = self.test_client.post(
            reverse('core:client_create'),
            new_client_data,
            follow=True
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن العميل تم إنشاؤه في قاعدة البيانات
        self.assertTrue(Client.objects.filter(name='شركة جديدة').exists())

        # التحقق من أن المستخدم تم توجيهه إلى صفحة قائمة العملاء
        self.assertRedirects(response, reverse('core:client_list'))


class InvoiceViewsTest(TestCase):
    """اختبارات وظائف الفواتير"""

    def setUp(self):
        # إنشاء مستخدم للاختبار
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword'
        )

        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678",
            email="test@example.com"
        )

        # إنشاء فاتورة للعميل
        self.invoice = LeaveInvoice.objects.create(
            invoice_number="INV-20230101-001",
            client=self.client_obj,
            leave_type="sick_leave",
            leave_id="SL-20230101-001",
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
        # إنشاء فواتير إضافية
        LeaveInvoice.objects.create(
            invoice_number="INV-20230101-002",
            client=self.client_obj,
            leave_type="companion_leave",
            leave_id="CL-20230101-001",
            amount=Decimal("1500.00"),
            status="unpaid",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        # الوصول إلى صفحة قائمة الفواتير
        response = self.test_client.get(reverse('core:leave_invoice_list'))

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/leave_invoice_list.html')

        # التحقق من أن جميع الفواتير موجودة في السياق
        self.assertEqual(len(response.context['leave_invoices']), 2)

    def test_invoice_detail_view(self):
        """اختبار عرض تفاصيل الفاتورة"""
        # الوصول إلى صفحة تفاصيل الفاتورة
        response = self.test_client.get(
            reverse('core:leave_invoice_detail', args=[self.invoice.id])
        )

        # التحقق من أن الاستجابة ناجحة
        self.assertEqual(response.status_code, 200)

        # التحقق من أن القالب الصحيح تم استخدامه
        self.assertTemplateUsed(response, 'core/leave_invoice_detail.html')

        # التحقق من أن الفاتورة الصحيحة موجودة في السياق
        self.assertEqual(response.context['leave_invoice'], self.invoice)

    def test_invoice_update_status(self):
        """اختبار تحديث حالة الفاتورة"""
        # إنشاء دفعة
        payment = Payment.objects.create(
            payment_number="PAY-20230101-001",
            client=self.client_obj,
            amount=Decimal("600.00"),
            payment_method="cash",
            payment_date=date.today()
        )

        # إنشاء تفاصيل الدفعة
        PaymentDetail.objects.create(
            payment=payment,
            invoice=self.invoice,
            amount=Decimal("600.00")
        )

        # الوصول إلى صفحة تحديث حالة الفاتورة
        response = self.test_client.get(
            reverse('core:leave_invoice_update_status', args=[self.invoice.id])
        )

        # التحقق من أن المستخدم تم توجيهه إلى صفحة تفاصيل الفاتورة
        self.assertRedirects(
            response,
            reverse('core:leave_invoice_detail', args=[self.invoice.id])
        )

        # إعادة تحميل الفاتورة من قاعدة البيانات
        self.invoice.refresh_from_db()

        # التحقق من أن حالة الفاتورة تم تحديثها إلى "مدفوعة جزئيًا"
        self.assertEqual(self.invoice.status, "partially_paid")

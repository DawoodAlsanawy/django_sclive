from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from core.models import (Client, CompanionLeave, Doctor, Employer, Hospital,
                         LeaveInvoice, LeavePrice, Patient, Payment,
                         PaymentDetail, SickLeave, User)


class ClientModelTest(TestCase):
    """اختبارات نموذج العميل"""

    def setUp(self):
        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678",
            email="test@example.com",
            address="الرياض، المملكة العربية السعودية"
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

        # إنشاء دفعة للعميل
        self.payment = Payment.objects.create(
            payment_number="PAY-20230101-001",
            client=self.client_obj,
            amount=Decimal("500.00"),
            payment_method="cash",
            payment_date=date.today()
        )

    def test_client_creation(self):
        """اختبار إنشاء العميل"""
        self.assertEqual(self.client_obj.name, "شركة الاختبار")
        self.assertEqual(self.client_obj.phone, "0512345678")
        self.assertEqual(self.client_obj.email, "test@example.com")
        self.assertEqual(self.client_obj.address, "الرياض، المملكة العربية السعودية")

    def test_get_balance(self):
        """اختبار حساب رصيد العميل"""
        # الرصيد يجب أن يكون 1000 (الفاتورة) - 500 (الدفعة) = 500
        self.assertEqual(self.client_obj.get_balance(), Decimal("500.00"))

        # إضافة فاتورة أخرى
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

        # الرصيد يجب أن يكون 1000 + 1500 (الفواتير) - 500 (الدفعة) = 2000
        self.assertEqual(self.client_obj.get_balance(), Decimal("2000.00"))

        # إضافة دفعة أخرى
        Payment.objects.create(
            payment_number="PAY-20230101-002",
            client=self.client_obj,
            amount=Decimal("1000.00"),
            payment_method="bank_transfer",
            payment_date=date.today()
        )

        # الرصيد يجب أن يكون 2500 (الفواتير) - 1500 (الدفعات) = 1000
        self.assertEqual(self.client_obj.get_balance(), Decimal("1000.00"))

    def test_cancelled_invoice_not_in_balance(self):
        """اختبار أن الفواتير الملغاة لا تدخل في حساب الرصيد"""
        # إضافة فاتورة ملغاة
        LeaveInvoice.objects.create(
            invoice_number="INV-20230101-003",
            client=self.client_obj,
            leave_type="sick_leave",
            leave_id="SL-20230101-002",
            amount=Decimal("2000.00"),
            status="cancelled",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        # الرصيد يجب أن يبقى 500 (الفاتورة الملغاة لا تدخل في الحساب)
        self.assertEqual(self.client_obj.get_balance(), Decimal("500.00"))


class LeaveInvoiceModelTest(TestCase):
    """اختبارات نموذج فاتورة الإجازة"""

    def setUp(self):
        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678"
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

    def test_invoice_creation(self):
        """اختبار إنشاء الفاتورة"""
        self.assertEqual(self.invoice.invoice_number, "INV-20230101-001")
        self.assertEqual(self.invoice.client, self.client_obj)
        self.assertEqual(self.invoice.leave_type, "sick_leave")
        self.assertEqual(self.invoice.leave_id, "SL-20230101-001")
        self.assertEqual(self.invoice.amount, Decimal("1000.00"))
        self.assertEqual(self.invoice.status, "unpaid")

    def test_get_total_paid(self):
        """اختبار حساب إجمالي المبلغ المدفوع للفاتورة"""
        # في البداية، لا توجد مدفوعات
        self.assertEqual(self.invoice.get_total_paid(), Decimal("0"))

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
            amount=Decimal("400.00")
        )

        # إجمالي المدفوع يجب أن يكون 400
        self.assertEqual(self.invoice.get_total_paid(), Decimal("400.00"))

        # إضافة دفعة أخرى
        payment2 = Payment.objects.create(
            payment_number="PAY-20230101-002",
            client=self.client_obj,
            amount=Decimal("700.00"),
            payment_method="bank_transfer",
            payment_date=date.today()
        )

        # إضافة تفاصيل الدفعة الثانية
        PaymentDetail.objects.create(
            payment=payment2,
            invoice=self.invoice,
            amount=Decimal("300.00")
        )

        # إجمالي المدفوع يجب أن يكون 400 + 300 = 700
        self.assertEqual(self.invoice.get_total_paid(), Decimal("700.00"))

    def test_get_remaining(self):
        """اختبار حساب المبلغ المتبقي للفاتورة"""
        # في البداية، المبلغ المتبقي هو كامل المبلغ
        self.assertEqual(self.invoice.get_remaining(), Decimal("1000.00"))

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
            amount=Decimal("400.00")
        )

        # المبلغ المتبقي يجب أن يكون 1000 - 400 = 600
        self.assertEqual(self.invoice.get_remaining(), Decimal("600.00"))

    def test_update_status(self):
        """اختبار تحديث حالة الفاتورة"""
        # في البداية، الحالة هي "غير مدفوعة"
        self.assertEqual(self.invoice.status, "unpaid")

        # إنشاء دفعة جزئية
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
            amount=Decimal("400.00")
        )

        # تحديث حالة الفاتورة
        self.invoice.update_status()

        # الحالة يجب أن تكون "مدفوعة جزئيًا"
        self.assertEqual(self.invoice.status, "partially_paid")

        # إضافة دفعة أخرى لتغطية المبلغ المتبقي
        payment2 = Payment.objects.create(
            payment_number="PAY-20230101-002",
            client=self.client_obj,
            amount=Decimal("700.00"),
            payment_method="bank_transfer",
            payment_date=date.today()
        )

        # إضافة تفاصيل الدفعة الثانية
        PaymentDetail.objects.create(
            payment=payment2,
            invoice=self.invoice,
            amount=Decimal("600.00")
        )

        # تحديث حالة الفاتورة
        self.invoice.update_status()

        # الحالة يجب أن تكون "مدفوعة"
        self.assertEqual(self.invoice.status, "paid")

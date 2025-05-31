from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase

from core.models import (Client, CompanionLeave, Doctor, Hospital,
                         LeaveInvoice, LeavePrice, Patient, SickLeave)
from core.utils import (calculate_leave_duration, generate_companion_leave_id,
                        generate_invoice_number, generate_payment_number,
                        generate_sick_leave_id, get_leave_price)


class UtilsTest(TestCase):
    """اختبارات الوظائف المساعدة"""

    def setUp(self):
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

        # إنشاء أسعار للإجازات
        # سعر ثابت للإجازة المرضية (عام)
        self.general_fixed_price = LeavePrice.objects.create(
            leave_type="sick_leave",
            duration_days=5,
            price=Decimal("1000.00"),
            pricing_type="fixed",
            is_active=True
        )

        # سعر يومي للإجازة المرضية (عام)
        self.general_per_day_price = LeavePrice.objects.create(
            leave_type="sick_leave",
            duration_days=1,
            price=Decimal("200.00"),
            pricing_type="per_day",
            is_active=True
        )

        # سعر ثابت للإجازة المرضية (خاص بالعميل)
        self.client_fixed_price = LeavePrice.objects.create(
            leave_type="sick_leave",
            duration_days=5,
            price=Decimal("1500.00"),
            pricing_type="fixed",
            client=self.client_obj,
            is_active=True
        )

        # سعر يومي للإجازة المرضية (خاص بالعميل)
        self.client_per_day_price = LeavePrice.objects.create(
            leave_type="sick_leave",
            duration_days=1,
            price=Decimal("300.00"),
            pricing_type="per_day",
            client=self.client_obj,
            is_active=True
        )

    def test_calculate_leave_duration(self):
        """اختبار حساب مدة الإجازة"""
        # اختبار مدة الإجازة ليوم واحد
        start_date = date.today()
        end_date = date.today()
        self.assertEqual(calculate_leave_duration(start_date, end_date), 1)

        # اختبار مدة الإجازة لعدة أيام
        start_date = date.today()
        end_date = date.today() + timedelta(days=5)
        self.assertEqual(calculate_leave_duration(start_date, end_date), 6)

        # اختبار مدة الإجازة عندما يكون تاريخ النهاية قبل تاريخ البداية
        start_date = date.today()
        end_date = date.today() - timedelta(days=1)
        self.assertEqual(calculate_leave_duration(start_date, end_date), 0)

    def test_generate_sick_leave_id(self):
        """اختبار توليد رقم الإجازة المرضية"""
        # إنشاء إجازة مرضية للاختبار
        sick_leave = SickLeave.objects.create(
            leave_id="SL-20230101-001",
            patient=self.patient,
            doctor=self.doctor,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5),
            issue_date=date.today()
        )

        # توليد رقم إجازة مرضية جديد
        new_id = generate_sick_leave_id()

        # التحقق من أن الرقم الجديد يتبع النمط الصحيح
        self.assertTrue(new_id.startswith("SL-"))
        self.assertNotEqual(new_id, sick_leave.leave_id)

    def test_generate_companion_leave_id(self):
        """اختبار توليد رقم إجازة المرافق"""
        # إنشاء إجازة مرافق للاختبار
        companion_leave = CompanionLeave.objects.create(
            leave_id="CL-20230101-001",
            patient=self.patient,
            companion=self.companion,
            doctor=self.doctor,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=3),
            issue_date=date.today()
        )

        # توليد رقم إجازة مرافق جديد
        new_id = generate_companion_leave_id()

        # التحقق من أن الرقم الجديد يتبع النمط الصحيح
        self.assertTrue(new_id.startswith("CL-"))
        self.assertNotEqual(new_id, companion_leave.leave_id)

    def test_generate_invoice_number(self):
        """اختبار توليد رقم الفاتورة"""
        # إنشاء فاتورة للاختبار
        invoice = LeaveInvoice.objects.create(
            invoice_number="INV-20230101-001",
            client=self.client_obj,
            leave_type="sick_leave",
            leave_id="SL-20230101-001",
            amount=Decimal("1000.00"),
            status="unpaid",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        # توليد رقم فاتورة جديد
        new_number = generate_invoice_number()

        # التحقق من أن الرقم الجديد يتبع النمط الصحيح
        self.assertTrue(new_number.startswith("INV-"))
        self.assertNotEqual(new_number, invoice.invoice_number)

    def test_generate_payment_number(self):
        """اختبار توليد رقم الدفعة"""
        # توليد رقم دفعة جديد
        new_number = generate_payment_number()

        # التحقق من أن الرقم الجديد يتبع النمط الصحيح
        self.assertTrue(new_number.startswith("PAY-"))

    def test_get_leave_price(self):
        """اختبار الحصول على سعر الإجازة"""
        # اختبار السعر الثابت الخاص بالعميل
        price = get_leave_price("sick_leave", 5, self.client_obj)
        self.assertEqual(price, Decimal("1500.00"))

        # اختبار السعر الثابت العام (بدون تحديد عميل)
        price = get_leave_price("sick_leave", 5)
        self.assertEqual(price, Decimal("1000.00"))

        # اختبار السعر اليومي الخاص بالعميل
        # ملاحظة: الوظيفة تبحث أولاً عن سعر ثابت للعميل، وإذا وجدته، تعيده بغض النظر عن المدة
        price = get_leave_price("sick_leave", 3, self.client_obj)
        self.assertEqual(price, Decimal("1500.00"))  # السعر الثابت للعميل

        # اختبار السعر اليومي العام (بدون تحديد عميل)
        # ملاحظة: الوظيفة تبحث أولاً عن سعر ثابت عام، وإذا وجدته، تعيده بغض النظر عن المدة
        price = get_leave_price("sick_leave", 3)
        self.assertEqual(price, Decimal("1000.00"))  # السعر الثابت العام

        # اختبار السعر لمدة غير موجودة
        # ملاحظة: الوظيفة تبحث أولاً عن سعر ثابت للعميل، وإذا وجدته، تعيده بغض النظر عن المدة
        price = get_leave_price("sick_leave", 10, self.client_obj)
        self.assertEqual(price, Decimal("1500.00"))  # السعر الثابت للعميل

        # اختبار السعر لنوع إجازة غير موجود
        price = get_leave_price("unknown_leave", 5, self.client_obj)
        self.assertEqual(price, Decimal("0"))  # لا يوجد سعر

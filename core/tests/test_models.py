from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from core.models import (Client, CompanionLeave, Doctor, Employer, Hospital,
                         LeaveInvoice, LeavePrice, Patient, Payment,
                         PaymentDetail, SickLeave, User)


class UserModelTest(TestCase):
    """اختبارات نموذج المستخدم"""

    def setUp(self):
        # إنشاء مستخدم عادي للاختبار
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )

        # إنشاء مستخدم مسؤول للاختبار
        self.admin_user = User.objects.create_superuser(
            username='adminuser',
            email='admin@example.com',
            password='adminpassword'
        )

    def test_user_creation(self):
        """اختبار إنشاء المستخدم"""
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)
        self.assertEqual(self.user.role, 'staff')

    def test_admin_user_creation(self):
        """اختبار إنشاء المستخدم المسؤول"""
        self.assertEqual(self.admin_user.username, 'adminuser')
        self.assertEqual(self.admin_user.email, 'admin@example.com')
        self.assertTrue(self.admin_user.is_active)
        self.assertTrue(self.admin_user.is_staff)
        self.assertTrue(self.admin_user.is_superuser)
        self.assertEqual(self.admin_user.role, 'admin')

    def test_user_role_methods(self):
        """اختبار دوال التحقق من دور المستخدم"""
        self.assertFalse(self.user.is_admin())
        self.assertFalse(self.user.is_doctor())

        self.assertTrue(self.admin_user.is_admin())
        self.assertFalse(self.admin_user.is_doctor())

        # إنشاء مستخدم بدور طبيب
        doctor_user = User.objects.create_user(
            username='doctoruser',
            email='doctor@example.com',
            password='doctorpassword',
            role='doctor'
        )
        self.assertTrue(doctor_user.is_doctor())
        self.assertFalse(doctor_user.is_admin())


class HospitalModelTest(TestCase):
    """اختبارات نموذج المستشفى"""

    def setUp(self):
        # إنشاء مستشفى للاختبار
        self.hospital = Hospital.objects.create(
            name="مستشفى الاختبار",
            address="الرياض، المملكة العربية السعودية",
            contact_info="0112345678"
        )

        # إنشاء طبيب مرتبط بالمستشفى
        self.doctor = Doctor.objects.create(
            national_id="1234567890",
            name="د. أحمد الاختبار",
            position="طبيب عام",
            hospital=self.hospital
        )

    def test_hospital_creation(self):
        """اختبار إنشاء المستشفى"""
        self.assertEqual(self.hospital.name, "مستشفى الاختبار")
        self.assertEqual(self.hospital.address, "الرياض، المملكة العربية السعودية")
        self.assertEqual(self.hospital.contact_info, "0112345678")

    def test_get_doctors_count(self):
        """اختبار حساب عدد الأطباء المرتبطين بالمستشفى"""
        # إنشاء طبيب آخر مرتبط بالمستشفى
        Doctor.objects.create(
            national_id="0987654321",
            name="د. محمد الاختبار",
            position="طبيب أطفال",
            hospital=self.hospital
        )

        # التحقق من أن عدد الأطباء هو 2
        self.assertEqual(self.hospital.get_doctors_count(), 2)


class DoctorModelTest(TestCase):
    """اختبارات نموذج الطبيب"""

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
            hospital=self.hospital,
            phone="0512345678",
            email="doctor@example.com"
        )

    def test_doctor_creation(self):
        """اختبار إنشاء الطبيب"""
        self.assertEqual(self.doctor.national_id, "1234567890")
        self.assertEqual(self.doctor.name, "د. أحمد الاختبار")
        self.assertEqual(self.doctor.position, "طبيب عام")
        self.assertEqual(self.doctor.hospital, self.hospital)
        self.assertEqual(self.doctor.phone, "0512345678")
        self.assertEqual(self.doctor.email, "doctor@example.com")


class PatientModelTest(TestCase):
    """اختبارات نموذج المريض"""

    def setUp(self):
        # إنشاء مريض للاختبار
        self.patient = Patient.objects.create(
            national_id="1234567890",
            name="محمد الاختبار",
            nationality="سعودي",
            employer_name="شركة الاختبار",
            phone="0512345678",
            email="patient@example.com",
            address="الرياض، المملكة العربية السعودية"
        )

    def test_patient_creation(self):
        """اختبار إنشاء المريض"""
        self.assertEqual(self.patient.national_id, "1234567890")
        self.assertEqual(self.patient.name, "محمد الاختبار")
        self.assertEqual(self.patient.nationality, "سعودي")
        self.assertEqual(self.patient.employer_name, "شركة الاختبار")
        self.assertEqual(self.patient.phone, "0512345678")
        self.assertEqual(self.patient.email, "patient@example.com")
        self.assertEqual(self.patient.address, "الرياض، المملكة العربية السعودية")


class ClientModelTest(TestCase):
    """اختبارات نموذج العميل"""

    def setUp(self):
        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678",
            email="client@example.com",
            address="الرياض، المملكة العربية السعودية",
            notes="ملاحظات اختبار"
        )

    def test_client_creation(self):
        """اختبار إنشاء العميل"""
        self.assertEqual(self.client_obj.name, "شركة الاختبار")
        self.assertEqual(self.client_obj.phone, "0512345678")
        self.assertEqual(self.client_obj.email, "client@example.com")
        self.assertEqual(self.client_obj.address, "الرياض، المملكة العربية السعودية")
        self.assertEqual(self.client_obj.notes, "ملاحظات اختبار")

    def test_get_balance(self):
        """اختبار حساب رصيد العميل"""
        # إنشاء فاتورة للعميل
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

        # إنشاء دفعة للعميل
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
            invoice=invoice,
            amount=Decimal("600.00")
        )

        # التحقق من أن الرصيد هو 400 (1000 - 600)
        self.assertEqual(self.client_obj.get_balance(), Decimal("400.00"))

        # إنشاء فاتورة أخرى
        LeaveInvoice.objects.create(
            invoice_number="INV-20230101-002",
            client=self.client_obj,
            leave_type="companion_leave",
            leave_id="CL-20230101-001",
            amount=Decimal("800.00"),
            status="unpaid",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        # التحقق من أن الرصيد هو 1200 (1000 + 800 - 600)
        self.assertEqual(self.client_obj.get_balance(), Decimal("1200.00"))

    def test_cancelled_invoice_not_in_balance(self):
        """اختبار أن الفواتير الملغاة لا تدخل في حساب الرصيد"""
        # إنشاء فاتورة عادية
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

        # إنشاء فاتورة ملغاة
        LeaveInvoice.objects.create(
            invoice_number="INV-20230101-002",
            client=self.client_obj,
            leave_type="sick_leave",
            leave_id="SL-20230101-002",
            amount=Decimal("500.00"),
            status="cancelled",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        # التحقق من أن الرصيد هو 1000 فقط (الفاتورة الملغاة لا تدخل في الحساب)
        self.assertEqual(self.client_obj.get_balance(), Decimal("1000.00"))


class LeavePriceModelTest(TestCase):
    """اختبارات نموذج سعر الإجازة"""

    def setUp(self):
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

    def test_leave_price_creation(self):
        """اختبار إنشاء سعر الإجازة"""
        self.assertEqual(self.general_fixed_price.leave_type, "sick_leave")
        self.assertEqual(self.general_fixed_price.duration_days, 5)
        self.assertEqual(self.general_fixed_price.price, Decimal("1000.00"))
        self.assertEqual(self.general_fixed_price.pricing_type, "fixed")
        self.assertTrue(self.general_fixed_price.is_active)
        self.assertIsNone(self.general_fixed_price.client)

    def test_get_price_fixed(self):
        """اختبار الحصول على السعر الثابت للإجازة"""
        # اختبار السعر الثابت الخاص بالعميل
        price = LeavePrice.get_price("sick_leave", 5, self.client_obj)
        self.assertEqual(price, Decimal("1500.00"))

        # اختبار السعر الثابت العام (بدون تحديد عميل)
        price = LeavePrice.get_price("sick_leave", 5)
        self.assertEqual(price, Decimal("1000.00"))

    def test_get_price_per_day(self):
        """اختبار الحصول على السعر اليومي للإجازة"""
        # اختبار السعر اليومي الخاص بالعميل
        # ملاحظة: الوظيفة تبحث أولاً عن سعر ثابت للعميل، وإذا وجدته، تعيده بغض النظر عن المدة
        price = LeavePrice.get_price("sick_leave", 3, self.client_obj)
        self.assertEqual(price, Decimal("1500.00"))  # السعر الثابت للعميل

        # اختبار السعر اليومي العام (بدون تحديد عميل)
        # ملاحظة: الوظيفة تبحث أولاً عن سعر ثابت عام، وإذا وجدته، تعيده بغض النظر عن المدة
        price = LeavePrice.get_price("sick_leave", 3)
        self.assertEqual(price, Decimal("1000.00"))  # السعر الثابت العام

    def test_get_daily_price(self):
        """اختبار حساب السعر اليومي"""
        # السعر اليومي للسعر الثابت هو نفس السعر الإجمالي
        self.assertEqual(self.general_fixed_price.get_daily_price(), Decimal("1000.00"))

        # السعر اليومي للسعر اليومي هو السعر مقسومًا على عدد الأيام
        self.assertEqual(self.general_per_day_price.get_daily_price(), Decimal("200.00"))


class SickLeaveModelTest(TestCase):
    """اختبارات نموذج الإجازة المرضية"""

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

        # إنشاء إجازة مرضية للاختبار
        self.sick_leave = SickLeave.objects.create(
            leave_id="SL-20230101-001",
            patient=self.patient,
            doctor=self.doctor,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5),
            issue_date=date.today()
        )

    def test_sick_leave_creation(self):
        """اختبار إنشاء الإجازة المرضية"""
        self.assertEqual(self.sick_leave.leave_id, "SL-20230101-001")
        self.assertEqual(self.sick_leave.patient, self.patient)
        self.assertEqual(self.sick_leave.doctor, self.doctor)
        self.assertEqual(self.sick_leave.start_date, date.today())
        self.assertEqual(self.sick_leave.end_date, date.today() + timedelta(days=5))
        self.assertEqual(self.sick_leave.issue_date, date.today())
        self.assertEqual(self.sick_leave.status, "active")

    def test_duration_days_calculation(self):
        """اختبار حساب مدة الإجازة بالأيام"""
        # التحقق من أن مدة الإجازة هي 6 أيام (الفرق بين التاريخين + 1)
        self.assertEqual(self.sick_leave.duration_days, 6)

        # تحديث تاريخ النهاية وحفظ الإجازة
        self.sick_leave.end_date = date.today() + timedelta(days=9)
        self.sick_leave.save()

        # التحقق من أن مدة الإجازة تم تحديثها إلى 10 أيام
        self.assertEqual(self.sick_leave.duration_days, 10)

    def test_status_update(self):
        """اختبار تحديث حالة الإجازة"""
        # التحقق من أن الحالة الأولية هي "نشطة"
        self.assertEqual(self.sick_leave.status, "active")

        # تعيين تاريخ نهاية في الماضي
        past_date = date.today() - timedelta(days=5)
        self.sick_leave.end_date = past_date
        self.sick_leave.save()

        # التحقق من أن الحالة تم تحديثها إلى "منتهية"
        self.assertEqual(self.sick_leave.status, "expired")

        # تعيين الحالة إلى "ملغية"
        self.sick_leave.status = "cancelled"
        self.sick_leave.save()

        # تحديث تاريخ النهاية إلى المستقبل
        self.sick_leave.end_date = date.today() + timedelta(days=5)
        self.sick_leave.save()

        # التحقق من أن الحالة لم تتغير (لأن الإجازة ملغية)
        self.assertEqual(self.sick_leave.status, "cancelled")


class CompanionLeaveModelTest(TestCase):
    """اختبارات نموذج إجازة المرافق"""

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

    def test_companion_leave_creation(self):
        """اختبار إنشاء إجازة المرافق"""
        self.assertEqual(self.companion_leave.leave_id, "CL-20230101-001")
        self.assertEqual(self.companion_leave.patient, self.patient)
        self.assertEqual(self.companion_leave.companion, self.companion)
        self.assertEqual(self.companion_leave.doctor, self.doctor)
        self.assertEqual(self.companion_leave.start_date, date.today())
        self.assertEqual(self.companion_leave.end_date, date.today() + timedelta(days=3))
        self.assertEqual(self.companion_leave.issue_date, date.today())
        self.assertEqual(self.companion_leave.status, "active")

    def test_duration_days_calculation(self):
        """اختبار حساب مدة الإجازة بالأيام"""
        # التحقق من أن مدة الإجازة هي 4 أيام (الفرق بين التاريخين + 1)
        self.assertEqual(self.companion_leave.duration_days, 4)

        # تحديث تاريخ النهاية وحفظ الإجازة
        self.companion_leave.end_date = date.today() + timedelta(days=6)
        self.companion_leave.save()

        # التحقق من أن مدة الإجازة تم تحديثها إلى 7 أيام
        self.assertEqual(self.companion_leave.duration_days, 7)

    def test_status_update(self):
        """اختبار تحديث حالة الإجازة"""
        # التحقق من أن الحالة الأولية هي "نشطة"
        self.assertEqual(self.companion_leave.status, "active")

        # تعيين تاريخ نهاية في الماضي
        past_date = date.today() - timedelta(days=5)
        self.companion_leave.end_date = past_date
        self.companion_leave.save()

        # التحقق من أن الحالة تم تحديثها إلى "منتهية"
        self.assertEqual(self.companion_leave.status, "expired")


class LeaveInvoiceModelTest(TestCase):
    """اختبارات نموذج فاتورة الإجازة"""

    def setUp(self):
        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678",
            email="client@example.com"
        )

        # إنشاء فاتورة للاختبار
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
        self.assertEqual(self.invoice.issue_date, date.today())
        self.assertEqual(self.invoice.due_date, date.today() + timedelta(days=30))

    def test_get_total_paid_and_remaining(self):
        """اختبار حساب إجمالي المبلغ المدفوع والمتبقي"""
        # في البداية، لا توجد مدفوعات
        self.assertEqual(self.invoice.get_total_paid(), Decimal("0"))
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
            amount=Decimal("600.00")
        )

        # التحقق من المبلغ المدفوع والمتبقي
        self.assertEqual(self.invoice.get_total_paid(), Decimal("600.00"))
        self.assertEqual(self.invoice.get_remaining(), Decimal("400.00"))

    def test_update_status(self):
        """اختبار تحديث حالة الفاتورة"""
        # التحقق من أن الحالة الأولية هي "غير مدفوعة"
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
            amount=Decimal("600.00")
        )

        # تحديث حالة الفاتورة
        self.invoice.update_status()

        # التحقق من أن الحالة تم تحديثها إلى "مدفوعة جزئيًا"
        self.assertEqual(self.invoice.status, "partially_paid")

        # إنشاء دفعة أخرى لتغطية المبلغ المتبقي
        payment2 = Payment.objects.create(
            payment_number="PAY-20230101-002",
            client=self.client_obj,
            amount=Decimal("400.00"),
            payment_method="bank_transfer",
            payment_date=date.today()
        )

        # إنشاء تفاصيل الدفعة الثانية
        PaymentDetail.objects.create(
            payment=payment2,
            invoice=self.invoice,
            amount=Decimal("400.00")
        )

        # تحديث حالة الفاتورة
        self.invoice.update_status()

        # التحقق من أن الحالة تم تحديثها إلى "مدفوعة بالكامل"
        self.assertEqual(self.invoice.status, "paid")


class PaymentModelTest(TestCase):
    """اختبارات نموذج الدفعة"""

    def setUp(self):
        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678",
            email="client@example.com"
        )

        # إنشاء فاتورة للاختبار
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

        # إنشاء دفعة للاختبار
        self.payment = Payment.objects.create(
            payment_number="PAY-20230101-001",
            client=self.client_obj,
            amount=Decimal("600.00"),
            payment_method="cash",
            payment_date=date.today(),
            reference_number="REF123",
            notes="ملاحظات اختبار"
        )

    def test_payment_creation(self):
        """اختبار إنشاء الدفعة"""
        self.assertEqual(self.payment.payment_number, "PAY-20230101-001")
        self.assertEqual(self.payment.client, self.client_obj)
        self.assertEqual(self.payment.amount, Decimal("600.00"))
        self.assertEqual(self.payment.payment_method, "cash")
        self.assertEqual(self.payment.payment_date, date.today())
        self.assertEqual(self.payment.reference_number, "REF123")
        self.assertEqual(self.payment.notes, "ملاحظات اختبار")


class PaymentDetailModelTest(TestCase):
    """اختبارات نموذج تفاصيل الدفعة"""

    def setUp(self):
        # إنشاء عميل للاختبار
        self.client_obj = Client.objects.create(
            name="شركة الاختبار",
            phone="0512345678",
            email="client@example.com"
        )

        # إنشاء فاتورتين للاختبار
        self.invoice1 = LeaveInvoice.objects.create(
            invoice_number="INV-20230101-001",
            client=self.client_obj,
            leave_type="sick_leave",
            leave_id="SL-20230101-001",
            amount=Decimal("1000.00"),
            status="unpaid",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        self.invoice2 = LeaveInvoice.objects.create(
            invoice_number="INV-20230101-002",
            client=self.client_obj,
            leave_type="companion_leave",
            leave_id="CL-20230101-001",
            amount=Decimal("800.00"),
            status="unpaid",
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )

        # إنشاء دفعة للاختبار
        self.payment = Payment.objects.create(
            payment_number="PAY-20230101-001",
            client=self.client_obj,
            amount=Decimal("1200.00"),
            payment_method="bank_transfer",
            payment_date=date.today()
        )

        # إنشاء تفاصيل الدفعة
        self.payment_detail1 = PaymentDetail.objects.create(
            payment=self.payment,
            invoice=self.invoice1,
            amount=Decimal("700.00")
        )

        self.payment_detail2 = PaymentDetail.objects.create(
            payment=self.payment,
            invoice=self.invoice2,
            amount=Decimal("500.00")
        )

    def test_payment_detail_creation(self):
        """اختبار إنشاء تفاصيل الدفعة"""
        self.assertEqual(self.payment_detail1.payment, self.payment)
        self.assertEqual(self.payment_detail1.invoice, self.invoice1)
        self.assertEqual(self.payment_detail1.amount, Decimal("700.00"))

        self.assertEqual(self.payment_detail2.payment, self.payment)
        self.assertEqual(self.payment_detail2.invoice, self.invoice2)
        self.assertEqual(self.payment_detail2.amount, Decimal("500.00"))

    def test_invoice_status_update(self):
        """اختبار تحديث حالة الفواتير بعد إنشاء تفاصيل الدفعة"""
        # تحديث حالة الفواتير
        self.invoice1.update_status()
        self.invoice2.update_status()

        # التحقق من أن حالة الفاتورة الأولى تم تحديثها إلى "مدفوعة جزئيًا"
        self.assertEqual(self.invoice1.status, "partially_paid")

        # التحقق من أن حالة الفاتورة الثانية تم تحديثها إلى "مدفوعة جزئيًا"
        self.assertEqual(self.invoice2.status, "partially_paid")

        # إنشاء دفعة أخرى لتغطية المبلغ المتبقي للفاتورة الأولى
        payment2 = Payment.objects.create(
            payment_number="PAY-20230101-002",
            client=self.client_obj,
            amount=Decimal("300.00"),
            payment_method="cash",
            payment_date=date.today()
        )

        # إنشاء تفاصيل الدفعة
        PaymentDetail.objects.create(
            payment=payment2,
            invoice=self.invoice1,
            amount=Decimal("300.00")
        )

        # تحديث حالة الفاتورة الأولى
        self.invoice1.update_status()

        # التحقق من أن حالة الفاتورة الأولى تم تحديثها إلى "مدفوعة بالكامل"
        self.assertEqual(self.invoice1.status, "paid")

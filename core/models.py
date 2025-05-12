from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager,
                                        PermissionsMixin)
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        """إنشاء مستخدم جديد"""
        if not email:
            raise ValueError('يجب توفير عنوان بريد إلكتروني')
        if not username:
            raise ValueError('يجب توفير اسم مستخدم')

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """إنشاء مستخدم مسؤول جديد"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """نموذج المستخدم في النظام"""
    username = models.CharField(max_length=64, unique=True, verbose_name='اسم المستخدم')
    email = models.EmailField(max_length=120, unique=True, verbose_name='البريد الإلكتروني')
    role = models.CharField(max_length=20, default='staff', verbose_name='الدور')  # admin, doctor, staff
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    is_staff = models.BooleanField(default=False, verbose_name='مسؤول')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمين'

    def is_admin(self):
        """التحقق مما إذا كان المستخدم مسؤولاً"""
        return self.role == 'admin'

    def is_doctor(self):
        """التحقق مما إذا كان المستخدم طبيباً"""
        return self.role == 'doctor'

    def __str__(self):
        return self.username


class Hospital(models.Model):
    """نموذج المستشفى"""
    name = models.CharField(max_length=100, verbose_name='اسم المستشفى')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    contact_info = models.CharField(max_length=100, blank=True, null=True, verbose_name='معلومات الاتصال')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'مستشفى'
        verbose_name_plural = 'المستشفيات'

    def __str__(self):
        return self.name


class Employer(models.Model):
    """نموذج جهة العمل"""
    name = models.CharField(max_length=100, verbose_name='اسم جهة العمل')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    contact_info = models.CharField(max_length=100, blank=True, null=True, verbose_name='معلومات الاتصال')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'جهة عمل'
        verbose_name_plural = 'جهات العمل'

    def __str__(self):
        return self.name


class Doctor(models.Model):
    """نموذج الطبيب"""
    national_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الهوية')
    name = models.CharField(max_length=100, verbose_name='اسم الطبيب')
    position = models.CharField(max_length=100, verbose_name='المنصب')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctors', verbose_name='المستشفى')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'طبيب'
        verbose_name_plural = 'الأطباء'

    def __str__(self):
        return self.name


class Patient(models.Model):
    """نموذج المريض"""
    national_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الهوية')
    name = models.CharField(max_length=100, verbose_name='اسم المريض')
    nationality = models.CharField(max_length=50, verbose_name='الجنسية')
    employer = models.ForeignKey(Employer, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients', verbose_name='جهة العمل')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'مريض'
        verbose_name_plural = 'المرضى'

    def __str__(self):
        return self.name


class Client(models.Model):
    """نموذج العميل"""
    name = models.CharField(max_length=100, verbose_name='اسم العميل')
    phone = models.CharField(max_length=20, unique=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'عميل'
        verbose_name_plural = 'العملاء'

    def __str__(self):
        return self.name

    def get_balance(self):
        """حساب رصيد العميل"""
        from django.db.models import Sum

        # إجمالي الفواتير
        total_invoices = self.leave_invoices.aggregate(Sum('amount'))['amount__sum'] or 0

        # إجمالي المدفوعات
        total_payments = self.payments.aggregate(Sum('amount'))['amount__sum'] or 0

        # الرصيد = إجمالي الفواتير - إجمالي المدفوعات
        return total_invoices - total_payments


class LeavePrice(models.Model):
    """نموذج سعر الإجازة"""
    leave_type = models.CharField(max_length=20, choices=[('sick_leave', 'إجازة مرضية'), ('companion_leave', 'إجازة مرافق')], verbose_name='نوع الإجازة')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='السعر')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'سعر الإجازة'
        verbose_name_plural = 'أسعار الإجازات'
        unique_together = ['leave_type', 'duration_days']

    def __str__(self):
        leave_type_display = dict([('sick_leave', 'إجازة مرضية'), ('companion_leave', 'إجازة مرافق')])
        return f"{leave_type_display[self.leave_type]} - {self.duration_days} يوم - {self.price} ريال"

    def get_daily_price(self):
        """حساب السعر اليومي"""
        if self.duration_days > 0:
            return self.price / self.duration_days
        return 0

    @classmethod
    def get_price(cls, leave_type, duration_days):
        """الحصول على سعر الإجازة بناءً على النوع والمدة"""
        # البحث عن سعر مطابق تمامًا
        price = cls.objects.filter(leave_type=leave_type, duration_days=duration_days, is_active=True).first()
        if price:
            return price.price

        # البحث عن أقرب سعر (أقل مدة أكبر من المدة المطلوبة)
        price = cls.objects.filter(leave_type=leave_type, duration_days__lt=duration_days, is_active=True).order_by('-duration_days').first()
        if price:
            # حساب السعر بناءً على السعر اليومي
            daily_price = price.price / price.duration_days
            return daily_price * duration_days

        # البحث عن أقرب سعر (أكبر مدة أقل من المدة المطلوبة)
        price = cls.objects.filter(leave_type=leave_type, duration_days__gt=duration_days, is_active=True).order_by('duration_days').first()
        if price:
            return price.price

        return 0  # لا يوجد سعر مناسب


class SickLeave(models.Model):
    """نموذج الإجازة المرضية"""
    leave_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الإجازة')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='المريض')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='الطبيب')
    start_date = models.DateField(verbose_name='تاريخ البداية')
    end_date = models.DateField(verbose_name='تاريخ النهاية')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    admission_date = models.DateField(verbose_name='تاريخ الدخول')
    discharge_date = models.DateField(verbose_name='تاريخ الخروج')
    issue_date = models.DateField(verbose_name='تاريخ الإصدار')
    status = models.CharField(max_length=20, choices=[
        ('active', 'نشطة'),
        ('cancelled', 'ملغية'),
        ('expired', 'منتهية')
    ], default='active', verbose_name='الحالة')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'إجازة مرضية'
        verbose_name_plural = 'الإجازات المرضية'

    def __str__(self):
        return f"{self.leave_id} - {self.patient.name}"

    def save(self, *args, **kwargs):
        # حساب مدة الإجازة
        if self.start_date and self.end_date:
            self.duration_days = (self.end_date - self.start_date).days + 1

        # تحديث حالة الإجازة بناءً على التواريخ
        if self.status != 'cancelled':  # لا نقوم بتحديث الحالة إذا كانت الإجازة ملغية
            today = timezone.now().date()
            if self.end_date < today:
                self.status = 'expired'
            else:
                self.status = 'active'

        super().save(*args, **kwargs)

    def update_status(self):
        """تحديث حالة الإجازة بناءً على التواريخ"""
        if self.status != 'cancelled':  # لا نقوم بتحديث الحالة إذا كانت الإجازة ملغية
            today = timezone.now().date()
            old_status = self.status

            if self.end_date < today:
                self.status = 'expired'
            else:
                self.status = 'active'

            if old_status != self.status:
                self.save()


class CompanionLeave(models.Model):
    """نموذج إجازة المرافق"""
    leave_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الإجازة')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='companion_leaves_as_patient', verbose_name='المريض')
    companion = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='companion_leaves_as_companion', verbose_name='المرافق')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='companion_leaves', verbose_name='الطبيب')
    start_date = models.DateField(verbose_name='تاريخ البداية')
    end_date = models.DateField(verbose_name='تاريخ النهاية')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    admission_date = models.DateField(verbose_name='تاريخ الدخول')
    discharge_date = models.DateField(verbose_name='تاريخ الخروج')
    issue_date = models.DateField(verbose_name='تاريخ الإصدار')
    status = models.CharField(max_length=20, choices=[
        ('active', 'نشطة'),
        ('cancelled', 'ملغية'),
        ('expired', 'منتهية')
    ], default='active', verbose_name='الحالة')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'إجازة مرافق'
        verbose_name_plural = 'إجازات المرافقين'

    def __str__(self):
        return f"{self.leave_id} - {self.patient.name} - {self.companion.name}"

    def save(self, *args, **kwargs):
        # حساب مدة الإجازة
        if self.start_date and self.end_date:
            self.duration_days = (self.end_date - self.start_date).days + 1

        # تحديث حالة الإجازة بناءً على التواريخ
        if self.status != 'cancelled':  # لا نقوم بتحديث الحالة إذا كانت الإجازة ملغية
            today = timezone.now().date()
            if self.end_date < today:
                self.status = 'expired'
            else:
                self.status = 'active'

        super().save(*args, **kwargs)

    def update_status(self):
        """تحديث حالة الإجازة بناءً على التواريخ"""
        if self.status != 'cancelled':  # لا نقوم بتحديث الحالة إذا كانت الإجازة ملغية
            today = timezone.now().date()
            old_status = self.status

            if self.end_date < today:
                self.status = 'expired'
            else:
                self.status = 'active'

            if old_status != self.status:
                self.save()


class LeaveInvoice(models.Model):
    """نموذج فاتورة الإجازة"""
    invoice_number = models.CharField(max_length=20, unique=True, verbose_name='رقم الفاتورة')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='leave_invoices', verbose_name='العميل')
    leave_type = models.CharField(max_length=20, choices=[
        ('sick_leave', 'إجازة مرضية'),
        ('companion_leave', 'إجازة مرافق')
    ], verbose_name='نوع الإجازة')
    leave_id = models.CharField(max_length=20, verbose_name='رقم الإجازة')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='المبلغ')
    status = models.CharField(max_length=20, choices=[
        ('unpaid', 'غير مدفوعة'),
        ('partially_paid', 'مدفوعة جزئيًا'),
        ('paid', 'مدفوعة بالكامل'),
        ('cancelled', 'ملغية')
    ], default='unpaid', verbose_name='الحالة')
    issue_date = models.DateField(default=timezone.now, verbose_name='تاريخ الإصدار')
    due_date = models.DateField(null=True, blank=True, verbose_name='تاريخ الاستحقاق')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'فاتورة إجازة'
        verbose_name_plural = 'فواتير الإجازات'

    def __str__(self):
        return f"{self.invoice_number} - {self.client.name} - {self.amount}"

    def get_total_paid(self):
        """إجمالي المبلغ المدفوع للفاتورة"""
        from django.db.models import Sum
        return self.payment_details.aggregate(Sum('amount'))['amount__sum'] or 0

    def get_remaining(self):
        """المبلغ المتبقي للفاتورة"""
        return self.amount - self.get_total_paid()

    def update_status(self):
        """تحديث حالة الفاتورة بناءً على المدفوعات"""
        # لا نقوم بتحديث الحالة إذا كانت الفاتورة ملغية
        if self.status == 'cancelled':
            return self.status

        total_paid = self.get_total_paid()
        old_status = self.status

        if total_paid <= 0:
            new_status = 'unpaid'
        elif total_paid < self.amount:
            new_status = 'partially_paid'
        else:
            new_status = 'paid'

        # تحديث الحالة فقط إذا تغيرت
        if old_status != new_status:
            self.status = new_status

        return self.status


class Payment(models.Model):
    """نموذج الدفعة"""
    payment_number = models.CharField(max_length=20, unique=True, verbose_name='رقم الدفعة')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments', verbose_name='العميل')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='المبلغ')
    payment_method = models.CharField(max_length=20, choices=[
        ('cash', 'نقدًا'),
        ('bank_transfer', 'تحويل بنكي'),
        ('check', 'شيك'),
        ('credit_card', 'بطاقة ائتمان')
    ], verbose_name='طريقة الدفع')
    payment_date = models.DateField(default=timezone.now, verbose_name='تاريخ الدفع')
    reference_number = models.CharField(max_length=50, blank=True, null=True, verbose_name='رقم المرجع')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'دفعة'
        verbose_name_plural = 'الدفعات'

    def __str__(self):
        return f"{self.payment_number} - {self.client.name} - {self.amount}"


class PaymentDetail(models.Model):
    """نموذج تفاصيل الدفعة"""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payment_details', verbose_name='الدفعة')
    invoice = models.ForeignKey(LeaveInvoice, on_delete=models.CASCADE, related_name='payment_details', verbose_name='الفاتورة')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='المبلغ')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')

    class Meta:
        verbose_name = 'تفاصيل الدفعة'
        verbose_name_plural = 'تفاصيل الدفعات'

    def __str__(self):
        return f"{self.payment.payment_number} - {self.invoice.invoice_number} - {self.amount}"

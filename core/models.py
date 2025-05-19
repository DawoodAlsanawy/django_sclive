import json
import re
from datetime import datetime, timedelta

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
    role = models.CharField(max_length=20, default='staff', blank=True, null=True, verbose_name='الدور')  # admin, doctor, staff
    is_active = models.BooleanField(default=True, blank=True, null=True, verbose_name='نشط')
    is_staff = models.BooleanField(default=False, blank=True, null=True, verbose_name='مسؤول')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

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
    name_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='اسم المستشفى (بالإنجليزية)')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    address_en = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان (بالإنجليزية)')
    contact_info = models.CharField(max_length=100, blank=True, null=True, verbose_name='معلومات الاتصال')
    logo = models.ImageField(upload_to='hospitals/logos/', blank=True, null=True, verbose_name='شعار المستشفى')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'مستشفى'
        verbose_name_plural = 'المستشفيات'

    def __str__(self):
        return self.name

    def get_doctors_count(self):
        """الحصول على عدد الأطباء المرتبطين بالمستشفى"""
        return self.doctors.count()

    def save(self, *args, **kwargs):
        """حفظ المستشفى مع ترجمة البيانات تلقائيًا"""
        # ترجمة الاسم والعنوان إلى الإنجليزية إذا كانت فارغة
        if self.name and not self.name_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.name, src='ar', dest='en')
                self.name_en = translation.text
            except Exception:
                pass

        if self.address and not self.address_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.address, src='ar', dest='en')
                self.address_en = translation.text
            except Exception:
                pass

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """حذف المستشفى وملف الشعار المرتبط به"""
        # حذف ملف الشعار إذا كان موجودًا
        if self.logo:
            if self.logo.storage.exists(self.logo.name):
                self.logo.delete()

        # حذف المستشفى
        super().delete(*args, **kwargs)


class Employer(models.Model):
    """
    نموذج جهة العمل
    ملاحظة: تم الاستغناء عن استخدام هذا النموذج واستبداله بحقول في نموذج المريض والمرافق
    تم الاحتفاظ به لتجنب مشاكل الترحيل
    """
    name = models.CharField(max_length=100, verbose_name='اسم جهة العمل')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    contact_info = models.CharField(max_length=100, blank=True, null=True, verbose_name='معلومات الاتصال')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'جهة عمل'
        verbose_name_plural = 'جهات العمل'

    def __str__(self):
        return self.name


class Doctor(models.Model):
    """نموذج الطبيب"""
    national_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الهوية')
    name = models.CharField(max_length=100, verbose_name='اسم الطبيب')
    name_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='اسم الطبيب (بالإنجليزية)')
    position = models.CharField(max_length=100, blank=True, null=True, verbose_name='المنصب')
    position_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='المنصب (بالإنجليزية)')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctors', verbose_name='المستشفى')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'طبيب'
        verbose_name_plural = 'الأطباء'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """حفظ الطبيب مع ترجمة البيانات تلقائيًا"""
        # ترجمة الاسم والمنصب إلى الإنجليزية إذا كانت فارغة
        if self.name and not self.name_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.name, src='ar', dest='en')
                self.name_en = translation.text
            except Exception:
                pass

        if self.position and not self.position_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.position, src='ar', dest='en')
                self.position_en = translation.text
            except Exception:
                pass

        super().save(*args, **kwargs)


class Patient(models.Model):
    """نموذج المريض"""
    national_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الهوية')
    name = models.CharField(max_length=100, verbose_name='اسم المريض')
    name_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='اسم المريض (بالإنجليزية)')
    nationality = models.CharField(max_length=50, blank=True, null=True, verbose_name='الجنسية')
    nationality_en = models.CharField(max_length=50, blank=True, null=True, verbose_name='الجنسية (بالإنجليزية)')
    employer_name = models.CharField(max_length=100, blank=True, null=True, verbose_name='جهة العمل')
    employer_name_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='جهة العمل (بالإنجليزية)')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    address_en = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان (بالإنجليزية)')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'مريض'
        verbose_name_plural = 'المرضى'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """حفظ المريض مع ترجمة البيانات تلقائيًا"""
        # ترجمة الاسم والجنسية وجهة العمل والعنوان إلى الإنجليزية إذا كانت فارغة
        if self.name and not self.name_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.name, src='ar', dest='en')
                self.name_en = translation.text
            except Exception:
                pass

        if self.nationality and not self.nationality_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.nationality, src='ar', dest='en')
                self.nationality_en = translation.text
            except Exception:
                pass

        if self.employer_name and not self.employer_name_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.employer_name, src='ar', dest='en')
                self.employer_name_en = translation.text
            except Exception:
                pass

        if self.address and not self.address_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.address, src='ar', dest='en')
                self.address_en = translation.text
            except Exception:
                pass

        super().save(*args, **kwargs)


class Client(models.Model):
    """نموذج العميل"""
    name = models.CharField(max_length=100, verbose_name='اسم العميل')
    name_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='اسم العميل (بالإنجليزية)')
    phone = models.CharField(max_length=20, unique=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    address_en = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان (بالإنجليزية)')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
    notes_en = models.TextField(blank=True, null=True, verbose_name='ملاحظات (بالإنجليزية)')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'عميل'
        verbose_name_plural = 'العملاء'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """حفظ العميل مع ترجمة البيانات تلقائيًا"""
        # ترجمة الاسم والعنوان والملاحظات إلى الإنجليزية إذا كانت فارغة
        if self.name and not self.name_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.name, src='ar', dest='en')
                self.name_en = translation.text
            except Exception:
                pass

        if self.address and not self.address_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.address, src='ar', dest='en')
                self.address_en = translation.text
            except Exception:
                pass

        if self.notes and not self.notes_en:
            try:
                from googletrans import Translator
                translator = Translator()
                translation = translator.translate(self.notes, src='ar', dest='en')
                self.notes_en = translation.text
            except Exception:
                pass

        super().save(*args, **kwargs)

    def get_balance(self):
        """حساب رصيد العميل"""
        from django.db.models import Sum

        # إجمالي الفواتير (استثناء الفواتير الملغية)
        total_invoices = self.leave_invoices.filter(status__in=['unpaid', 'partially_paid', 'paid']).aggregate(Sum('amount'))['amount__sum'] or 0

        # إجمالي المدفوعات
        total_payments = self.payments.aggregate(Sum('amount'))['amount__sum'] or 0

        # الرصيد = إجمالي الفواتير - إجمالي المدفوعات
        return total_invoices - total_payments


class LeavePrice(models.Model):
    """نموذج سعر الإجازة"""
    PRICING_TYPE_CHOICES = [
        ('per_day', 'سعر يومي'),
        ('fixed', 'سعر ثابت للإجازة')
    ]
    leave_type = models.CharField(max_length=20, choices=[('sick_leave', 'إجازة مرضية'), ('companion_leave', 'إجازة مرافق')], verbose_name='نوع الإجازة')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='السعر')
    pricing_type = models.CharField(max_length=10, choices=PRICING_TYPE_CHOICES, default='per_day', blank=True, null=True, verbose_name='طريقة التسعير')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='leave_prices', null=True, blank=True, verbose_name='العميل')
    is_active = models.BooleanField(default=True, blank=True, null=True, verbose_name='نشط')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

    # تم حذف الدالة الثابتة get_price لتجنب التضارب مع الدالة الأخرى

    class Meta:
        verbose_name = 'سعر الإجازة'
        verbose_name_plural = 'أسعار الإجازات'
        unique_together = ['leave_type', 'duration_days', 'client', 'pricing_type']

    def __str__(self):
        leave_type_display = dict([('sick_leave', 'إجازة مرضية'), ('companion_leave', 'إجازة مرافق')])
        pricing_type_display = dict([('per_day', 'سعر يومي'), ('fixed', 'سعر ثابت')])
        client_name = f" - {self.client.name}" if self.client else " - سعر عام"
        return f"{leave_type_display[self.leave_type]} - {self.duration_days} يوم - {pricing_type_display[self.pricing_type]}{client_name} - {self.price} ريال"

    def get_daily_price(self):
        """حساب السعر اليومي"""
        if self.pricing_type == 'fixed':
            return self.price  # للسعر الثابت، السعر اليومي هو نفس السعر الإجمالي
        elif self.duration_days > 0:
            return self.price / self.duration_days
        return 0

    @classmethod
    def get_price(cls, leave_type, duration_days, client=None):
        """
        الحصول على سعر الإجازة بناءً على النوع والمدة والعميل

        المعلمات:
        - leave_type: نوع الإجازة (sick_leave أو companion_leave)
        - duration_days: مدة الإجازة بالأيام
        - client: العميل (اختياري)

        يعيد:
        - سعر الإجازة
        """
        # 1. البحث عن سعر ثابت مخصص للعميل
        if client:
            # البحث عن سعر ثابت للإجازة مخصص للعميل
            fixed_price = cls.objects.filter(
                leave_type=leave_type,
                client=client,
                pricing_type='fixed',
                is_active=True
            ).first()
            if fixed_price:
                return fixed_price.price

            # 2. البحث عن سعر يومي مخصص للعميل بمدة مطابقة تمامًا
            price = cls.objects.filter(
                leave_type=leave_type,
                duration_days=duration_days,
                client=client,
                pricing_type='per_day',
                is_active=True
            ).first()
            if price:
                return price.price

            # 3. البحث عن أقرب سعر يومي مخصص للعميل (أقل مدة أكبر من المدة المطلوبة)
            price = cls.objects.filter(
                leave_type=leave_type,
                duration_days__lt=duration_days,
                client=client,
                pricing_type='per_day',
                is_active=True
            ).order_by('-duration_days').first()
            if price:
                # حساب السعر بناءً على السعر اليومي
                daily_price = price.price / price.duration_days
                return daily_price * duration_days

            # 4. البحث عن أقرب سعر يومي مخصص للعميل (أكبر مدة أقل من المدة المطلوبة)
            price = cls.objects.filter(
                leave_type=leave_type,
                duration_days__gt=duration_days,
                client=client,
                pricing_type='per_day',
                is_active=True
            ).order_by('duration_days').first()
            if price:
                return price.price

        # 5. البحث عن سعر ثابت عام
        fixed_price = cls.objects.filter(
            leave_type=leave_type,
            client__isnull=True,
            pricing_type='fixed',
            is_active=True
        ).first()
        if fixed_price:
            return fixed_price.price

        # 6. البحث عن سعر يومي عام بمدة مطابقة تمامًا
        price = cls.objects.filter(
            leave_type=leave_type,
            duration_days=duration_days,
            client__isnull=True,
            pricing_type='per_day',
            is_active=True
        ).first()
        if price:
            return price.price

        # 7. البحث عن أقرب سعر يومي عام (أقل مدة أكبر من المدة المطلوبة)
        price = cls.objects.filter(
            leave_type=leave_type,
            duration_days__lt=duration_days,
            client__isnull=True,
            pricing_type='per_day',
            is_active=True
        ).order_by('-duration_days').first()
        if price:
            # حساب السعر بناءً على السعر اليومي
            daily_price = price.price / price.duration_days
            return daily_price * duration_days

        # 8. البحث عن أقرب سعر يومي عام (أكبر مدة أقل من المدة المطلوبة)
        price = cls.objects.filter(
            leave_type=leave_type,
            duration_days__gt=duration_days,
            client__isnull=True,
            pricing_type='per_day',
            is_active=True
        ).order_by('duration_days').first()
        if price:
            return price.price

        return 0  # لا يوجد سعر مناسب


class SickLeave(models.Model):
    """نموذج الإجازة المرضية"""
    leave_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الإجازة')
    prefix = models.CharField(max_length=3, choices=[('PSL', 'PSL'), ('GSL', 'GSL')], default='PSL', verbose_name='بادئة الإجازة')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='المريض')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='الطبيب')
    start_date = models.DateField(verbose_name='تاريخ البداية')
    start_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ البداية (هجري)')
    end_date = models.DateField(verbose_name='تاريخ النهاية')
    end_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ النهاية (هجري)')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    admission_date = models.DateField(blank=True, null=True, verbose_name='تاريخ الدخول')
    admission_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الدخول (هجري)')
    discharge_date = models.DateField(blank=True, null=True, verbose_name='تاريخ الخروج')
    discharge_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الخروج (هجري)')
    issue_date = models.DateField(verbose_name='تاريخ الإصدار')
    issue_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الإصدار (هجري)')
    status = models.CharField(max_length=20, choices=[
        ('active', 'نشطة'),
        ('cancelled', 'ملغية'),
        ('expired', 'منتهية')
    ], default='active', blank=True, null=True, verbose_name='الحالة')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'إجازة مرضية'
        verbose_name_plural = 'الإجازات المرضية'

    def __str__(self):
        return f"{self.leave_id} - {self.patient.name}"

    def save(self, *args, **kwargs):
        # حساب مدة الإجازة
        # إذا كان تاريخ البداية والنهاية في نفس اليوم، فالإجازة تعتبر ليوم واحد
        # إذا كان تاريخ النهاية بعد تاريخ البداية بيوم واحد، فالإجازة تعتبر ليومين
        # وهكذا، كل فرق بين التاريخين يضيف يومًا إضافيًا للإجازة
        if self.start_date and self.end_date:
            self.duration_days = (self.end_date - self.start_date).days + 1

        # تحديث حالة الإجازة بناءً على التواريخ
        if self.status != 'cancelled':  # لا نقوم بتحديث الحالة إذا كانت الإجازة ملغية
            today = timezone.now().date()
            if self.end_date < today:
                self.status = 'expired'
            else:
                self.status = 'active'

        # تحويل التواريخ الميلادية إلى هجرية
        from hijri_converter import Gregorian
        if self.start_date and not self.start_date_hijri:
            g_date = Gregorian(self.start_date.year, self.start_date.month, self.start_date.day)
            hijri_date = g_date.to_hijri()
            self.start_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        if self.end_date and not self.end_date_hijri:
            g_date = Gregorian(self.end_date.year, self.end_date.month, self.end_date.day)
            hijri_date = g_date.to_hijri()
            self.end_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        if self.admission_date and not self.admission_date_hijri:
            g_date = Gregorian(self.admission_date.year, self.admission_date.month, self.admission_date.day)
            hijri_date = g_date.to_hijri()
            self.admission_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        if self.discharge_date and not self.discharge_date_hijri:
            g_date = Gregorian(self.discharge_date.year, self.discharge_date.month, self.discharge_date.day)
            hijri_date = g_date.to_hijri()
            self.discharge_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        if self.issue_date and not self.issue_date_hijri:
            g_date = Gregorian(self.issue_date.year, self.issue_date.month, self.issue_date.day)
            hijri_date = g_date.to_hijri()
            self.issue_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        # ملء حقول الترجمة الإنجليزية للمريض والطبيب إذا كانت فارغة
        from googletrans import Translator
        translator = Translator()

        # ترجمة بيانات المريض
        if self.patient:
            if self.patient.name and not self.patient.name_en:
                try:
                    translation = translator.translate(self.patient.name, src='ar', dest='en')
                    self.patient.name_en = translation.text
                    self.patient.save(update_fields=['name_en'])
                except Exception:
                    pass

            if self.patient.nationality and not self.patient.nationality_en:
                try:
                    translation = translator.translate(self.patient.nationality, src='ar', dest='en')
                    self.patient.nationality_en = translation.text
                    self.patient.save(update_fields=['nationality_en'])
                except Exception:
                    pass

            if self.patient.employer_name and not self.patient.employer_name_en:
                try:
                    translation = translator.translate(self.patient.employer_name, src='ar', dest='en')
                    self.patient.employer_name_en = translation.text
                    self.patient.save(update_fields=['employer_name_en'])
                except Exception:
                    pass

            if self.patient.address and not self.patient.address_en:
                try:
                    translation = translator.translate(self.patient.address, src='ar', dest='en')
                    self.patient.address_en = translation.text
                    self.patient.save(update_fields=['address_en'])
                except Exception:
                    pass

        # ترجمة بيانات الطبيب
        if self.doctor:
            if self.doctor.name and not self.doctor.name_en:
                try:
                    translation = translator.translate(self.doctor.name, src='ar', dest='en')
                    self.doctor.name_en = translation.text
                    self.doctor.save(update_fields=['name_en'])
                except Exception:
                    pass

            if self.doctor.position and not self.doctor.position_en:
                try:
                    translation = translator.translate(self.doctor.position, src='ar', dest='en')
                    self.doctor.position_en = translation.text
                    self.doctor.save(update_fields=['position_en'])
                except Exception:
                    pass

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
    prefix = models.CharField(max_length=3, choices=[('PSL', 'PSL'), ('GSL', 'GSL')], default='PSL', verbose_name='بادئة الإجازة')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='companion_leaves_as_patient', verbose_name='المريض')
    companion = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='companion_leaves_as_companion', verbose_name='المرافق')
    relation = models.CharField(max_length=100, blank=True, null=True, verbose_name='صلة القرابة')
    relation_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='صلة القرابة (بالإنجليزية)')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='companion_leaves', verbose_name='الطبيب')
    start_date = models.DateField(verbose_name='تاريخ البداية')
    start_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ البداية (هجري)')
    end_date = models.DateField(verbose_name='تاريخ النهاية')
    end_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ النهاية (هجري)')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    admission_date = models.DateField(blank=True, null=True, verbose_name='تاريخ الدخول')
    admission_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الدخول (هجري)')
    discharge_date = models.DateField(blank=True, null=True, verbose_name='تاريخ الخروج')
    discharge_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الخروج (هجري)')
    issue_date = models.DateField(verbose_name='تاريخ الإصدار')
    issue_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الإصدار (هجري)')
    status = models.CharField(max_length=20, choices=[
        ('active', 'نشطة'),
        ('cancelled', 'ملغية'),
        ('expired', 'منتهية')
    ], default='active', blank=True, null=True, verbose_name='الحالة')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'إجازة مرافق'
        verbose_name_plural = 'إجازات المرافقين'

    def __str__(self):
        return f"{self.leave_id} - {self.patient.name} - {self.companion.name}"

    def save(self, *args, **kwargs):
        # حساب مدة الإجازة
        # إذا كان تاريخ البداية والنهاية في نفس اليوم، فالإجازة تعتبر ليوم واحد
        # إذا كان تاريخ النهاية بعد تاريخ البداية بيوم واحد، فالإجازة تعتبر ليومين
        # وهكذا، كل فرق بين التاريخين يضيف يومًا إضافيًا للإجازة
        if self.start_date and self.end_date:
            self.duration_days = (self.end_date - self.start_date).days + 1

        # تحديث حالة الإجازة بناءً على التواريخ
        if self.status != 'cancelled':  # لا نقوم بتحديث الحالة إذا كانت الإجازة ملغية
            today = timezone.now().date()
            if self.end_date < today:
                self.status = 'expired'
            else:
                self.status = 'active'

        # تحويل التواريخ الميلادية إلى هجرية
        from hijri_converter import Gregorian
        if self.start_date and not self.start_date_hijri:
            g_date = Gregorian(self.start_date.year, self.start_date.month, self.start_date.day)
            hijri_date = g_date.to_hijri()
            self.start_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        if self.end_date and not self.end_date_hijri:
            g_date = Gregorian(self.end_date.year, self.end_date.month, self.end_date.day)
            hijri_date = g_date.to_hijri()
            self.end_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        if self.admission_date and not self.admission_date_hijri:
            g_date = Gregorian(self.admission_date.year, self.admission_date.month, self.admission_date.day)
            hijri_date = g_date.to_hijri()
            self.admission_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        if self.discharge_date and not self.discharge_date_hijri:
            g_date = Gregorian(self.discharge_date.year, self.discharge_date.month, self.discharge_date.day)
            hijri_date = g_date.to_hijri()
            self.discharge_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        if self.issue_date and not self.issue_date_hijri:
            g_date = Gregorian(self.issue_date.year, self.issue_date.month, self.issue_date.day)
            hijri_date = g_date.to_hijri()
            self.issue_date_hijri = f"{hijri_date.year}-{hijri_date.month}-{hijri_date.day}"

        # ملء حقول الترجمة الإنجليزية للمريض والمرافق والطبيب إذا كانت فارغة
        from googletrans import Translator
        translator = Translator()

        # ترجمة بيانات المريض
        if self.patient:
            if self.patient.name and not self.patient.name_en:
                try:
                    translation = translator.translate(self.patient.name, src='ar', dest='en')
                    self.patient.name_en = translation.text
                    self.patient.save(update_fields=['name_en'])
                except Exception:
                    pass

            if self.patient.nationality and not self.patient.nationality_en:
                try:
                    translation = translator.translate(self.patient.nationality, src='ar', dest='en')
                    self.patient.nationality_en = translation.text
                    self.patient.save(update_fields=['nationality_en'])
                except Exception:
                    pass

            if self.patient.employer_name and not self.patient.employer_name_en:
                try:
                    translation = translator.translate(self.patient.employer_name, src='ar', dest='en')
                    self.patient.employer_name_en = translation.text
                    self.patient.save(update_fields=['employer_name_en'])
                except Exception:
                    pass

            if self.patient.address and not self.patient.address_en:
                try:
                    translation = translator.translate(self.patient.address, src='ar', dest='en')
                    self.patient.address_en = translation.text
                    self.patient.save(update_fields=['address_en'])
                except Exception:
                    pass

        # ترجمة بيانات المرافق
        if self.companion:
            if self.companion.name and not self.companion.name_en:
                try:
                    translation = translator.translate(self.companion.name, src='ar', dest='en')
                    self.companion.name_en = translation.text
                    self.companion.save(update_fields=['name_en'])
                except Exception:
                    pass

            if self.companion.nationality and not self.companion.nationality_en:
                try:
                    translation = translator.translate(self.companion.nationality, src='ar', dest='en')
                    self.companion.nationality_en = translation.text
                    self.companion.save(update_fields=['nationality_en'])
                except Exception:
                    pass

            if self.companion.employer_name and not self.companion.employer_name_en:
                try:
                    translation = translator.translate(self.companion.employer_name, src='ar', dest='en')
                    self.companion.employer_name_en = translation.text
                    self.companion.save(update_fields=['employer_name_en'])
                except Exception:
                    pass

            if self.companion.address and not self.companion.address_en:
                try:
                    translation = translator.translate(self.companion.address, src='ar', dest='en')
                    self.companion.address_en = translation.text
                    self.companion.save(update_fields=['address_en'])
                except Exception:
                    pass

        # ترجمة بيانات الطبيب
        if self.doctor:
            if self.doctor.name and not self.doctor.name_en:
                try:
                    translation = translator.translate(self.doctor.name, src='ar', dest='en')
                    self.doctor.name_en = translation.text
                    self.doctor.save(update_fields=['name_en'])
                except Exception:
                    pass

            if self.doctor.position and not self.doctor.position_en:
                try:
                    translation = translator.translate(self.doctor.position, src='ar', dest='en')
                    self.doctor.position_en = translation.text
                    self.doctor.save(update_fields=['position_en'])
                except Exception:
                    pass

        # ترجمة صلة القرابة
        if self.relation and not self.relation_en:
            try:
                translation = translator.translate(self.relation, src='ar', dest='en')
                self.relation_en = translation.text
            except Exception:
                pass

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
    ], default='unpaid', blank=True, null=True, verbose_name='الحالة')
    issue_date = models.DateField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإصدار')
    due_date = models.DateField(null=True, blank=True, verbose_name='تاريخ الاستحقاق')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

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
            self.save()

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
    ], blank=True, null=True, verbose_name='طريقة الدفع')
    payment_date = models.DateField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الدفع')
    reference_number = models.CharField(max_length=50, blank=True, null=True, verbose_name='رقم المرجع')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, verbose_name='تاريخ التحديث')

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
    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')

    class Meta:
        verbose_name = 'تفاصيل الدفعة'
        verbose_name_plural = 'تفاصيل الدفعات'

    def __str__(self):
        return f"{self.payment.payment_number} - {self.invoice.invoice_number} - {self.amount}"

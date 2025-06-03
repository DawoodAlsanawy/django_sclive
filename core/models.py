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
    national_id = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهوية')
    name = models.CharField(max_length=100, verbose_name='اسم الطبيب')
    name_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='اسم الطبيب (بالإنجليزية)')
    position = models.CharField(max_length=100, blank=True, null=True, verbose_name='المنصب')
    position_en = models.CharField(max_length=100, blank=True, null=True, verbose_name='المنصب (بالإنجليزية)')
    hospitals = models.ManyToManyField(Hospital, related_name='doctors', blank=True, verbose_name='المستشفيات')
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
    national_id = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name='رقم الهوية')
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
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name='رقم الهاتف')
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
        # تعديل قيود الفريد لتكون مناسبة لطريقة التسعير
        constraints = [
            # للسعر اليومي، يجب أن تكون المجموعة (نوع الإجازة، المدة، العميل، طريقة التسعير) فريدة
            models.UniqueConstraint(
                fields=['leave_type', 'duration_days', 'client', 'pricing_type'],
                condition=models.Q(pricing_type='per_day'),
                name='unique_per_day_price'
            ),
            # للسعر الثابت، يجب أن تكون المجموعة (نوع الإجازة، العميل، طريقة التسعير) فريدة
            models.UniqueConstraint(
                fields=['leave_type', 'client', 'pricing_type'],
                condition=models.Q(pricing_type='fixed'),
                name='unique_fixed_price'
            ),
        ]

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
        from decimal import Decimal

        # التحقق من صحة المدخلات
        if not leave_type or not isinstance(duration_days, (int, float)) or duration_days <= 0:
            return Decimal('0')

        # أولاً: البحث عن أسعار مخصصة للعميل
        if client:
            # 1. البحث عن سعر يومي مخصص للعميل بمدة مطابقة تمامًا
            price = cls.objects.filter(
                leave_type=leave_type,
                duration_days=duration_days,
                client=client,
                pricing_type='per_day',
                is_active=True
            ).first()
            if price:
                return price.price

            # 2. البحث عن سعر ثابت مخصص للعميل
            fixed_price = cls.objects.filter(
                leave_type=leave_type,
                client=client,
                pricing_type='fixed',
                is_active=True
            ).first()
            if fixed_price:
                return fixed_price.price

            # 3. البحث عن أقرب سعر يومي مخصص للعميل (أقل مدة أو تساوي المدة المطلوبة)
            price = cls.objects.filter(
                leave_type=leave_type,
                duration_days__lte=duration_days,
                client=client,
                pricing_type='per_day',
                is_active=True
            ).order_by('-duration_days').first()
            if price and price.duration_days > 0:
                # حساب السعر بناءً على السعر اليومي
                daily_price = price.price / price.duration_days
                return daily_price * Decimal(str(duration_days))

            # 4. البحث عن أقرب سعر يومي مخصص للعميل (أكبر مدة من المدة المطلوبة)
            price = cls.objects.filter(
                leave_type=leave_type,
                duration_days__gt=duration_days,
                client=client,
                pricing_type='per_day',
                is_active=True
            ).order_by('duration_days').first()
            if price and price.duration_days > 0:
                # حساب السعر بناءً على السعر اليومي
                daily_price = price.price / price.duration_days
                return daily_price * Decimal(str(duration_days))

        # ثانياً: البحث عن أسعار عامة
        # 5. البحث عن سعر يومي عام بمدة مطابقة تمامًا
        price = cls.objects.filter(
            leave_type=leave_type,
            duration_days=duration_days,
            client__isnull=True,
            pricing_type='per_day',
            is_active=True
        ).first()
        if price:
            return price.price

        # 6. البحث عن سعر ثابت عام
        fixed_price = cls.objects.filter(
            leave_type=leave_type,
            client__isnull=True,
            pricing_type='fixed',
            is_active=True
        ).first()
        if fixed_price:
            return fixed_price.price

        # 7. البحث عن أقرب سعر يومي عام (أقل مدة أو تساوي المدة المطلوبة)
        price = cls.objects.filter(
            leave_type=leave_type,
            duration_days__lte=duration_days,
            client__isnull=True,
            pricing_type='per_day',
            is_active=True
        ).order_by('-duration_days').first()
        if price and price.duration_days > 0:
            # حساب السعر بناءً على السعر اليومي
            daily_price = price.price / price.duration_days
            return daily_price * Decimal(str(duration_days))

        # 8. البحث عن أقرب سعر يومي عام (أكبر مدة من المدة المطلوبة)
        price = cls.objects.filter(
            leave_type=leave_type,
            duration_days__gt=duration_days,
            client__isnull=True,
            pricing_type='per_day',
            is_active=True
        ).order_by('duration_days').first()
        if price and price.duration_days > 0:
            # حساب السعر بناءً على السعر اليومي
            daily_price = price.price / price.duration_days
            return daily_price * Decimal(str(duration_days))

        return Decimal('0')  # لا يوجد سعر مناسب


class SickLeave(models.Model):
    """نموذج الإجازة المرضية"""
    leave_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الإجازة')
    prefix = models.CharField(max_length=3, choices=[('PSL', 'PSL'), ('GSL', 'GSL')], default='PSL', verbose_name='بادئة الإجازة')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='المريض')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='المستشفى')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='الطبيب', blank=True, null=True)
    start_date = models.DateField(verbose_name='تاريخ البداية')
    start_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ البداية (هجري)')
    end_date = models.DateField(verbose_name='تاريخ النهاية')
    end_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ النهاية (هجري)')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    duration_days2 = models.IntegerField(verbose_name='المدة بالأيام',default=1)
    admission_date = models.DateField(blank=True, null=True, verbose_name='تاريخ الدخول')
    admission_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الدخول (هجري)')
    discharge_date = models.DateField(blank=True, null=True, verbose_name='تاريخ الخروج')
    discharge_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الخروج (هجري)')
    issue_date = models.DateField(verbose_name='تاريخ الإصدار')
    issue_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الإصدار (هجري)')
    created_date = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ إنشاء الإجازة')
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
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='companion_leaves', verbose_name='المستشفى')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='companion_leaves', verbose_name='الطبيب', blank=True, null=True)
    start_date = models.DateField(verbose_name='تاريخ البداية')
    start_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ البداية (هجري)')
    end_date = models.DateField(verbose_name='تاريخ النهاية')
    end_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ النهاية (هجري)')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    duration_days2 = models.IntegerField(verbose_name='المدة بالأيام',default=1)
    admission_date = models.DateField(blank=True, null=True, verbose_name='تاريخ الدخول')
    admission_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الدخول (هجري)')
    discharge_date = models.DateField(blank=True, null=True, verbose_name='تاريخ الخروج')
    discharge_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الخروج (هجري)')
    issue_date = models.DateField(verbose_name='تاريخ الإصدار')
    issue_date_hijri = models.CharField(max_length=20, blank=True, null=True, verbose_name='تاريخ الإصدار (هجري)')
    created_date = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ إنشاء الإجازة')
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
        total = self.payment_details.aggregate(Sum('amount'))['amount__sum'] or 0
        # print(f"إجمالي المبلغ المدفوع للفاتورة {self.invoice_number}: {total}")
        return total

    def get_remaining(self):
        """المبلغ المتبقي للفاتورة"""
        return self.amount - self.get_total_paid()

    def get_payments(self):
        """الحصول على المدفوعات المرتبطة بالفاتورة"""
        return self.payment_details.all().select_related('payment').order_by('-payment__payment_date')

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

    def allocate_to_oldest_invoices(self):
        """
        توزيع المبلغ المدفوع على الفواتير القديمة غير المدفوعة بالترتيب من الأقدم إلى الأحدث

        تعيد:
        - عدد الفواتير التي تم تسديدها
        - إجمالي المبلغ الذي تم تخصيصه
        """
        from django.db.models import Sum

        # حساب المبلغ غير المخصص
        allocated_amount = self.payment_details.aggregate(Sum('amount'))['amount__sum'] or 0
        unallocated_amount = self.amount - allocated_amount

        # إذا لم يكن هناك مبلغ غير مخصص، نعيد 0
        if unallocated_amount <= 0:
            return 0, 0

        # الحصول على الفواتير غير المدفوعة أو المدفوعة جزئيًا للعميل مرتبة من الأقدم إلى الأحدث
        unpaid_invoices = LeaveInvoice.objects.filter(
            client=self.client,
            status__in=['unpaid', 'partially_paid']
        ).order_by('issue_date', 'id')  # ترتيب حسب تاريخ الإصدار ثم المعرف

        invoices_paid = 0
        total_allocated = 0

        # توزيع المبلغ على الفواتير
        for invoice in unpaid_invoices:
            # حساب المبلغ المتبقي للفاتورة
            remaining_invoice_amount = invoice.get_remaining()

            # إذا كان المبلغ المتبقي للفاتورة أكبر من 0
            if remaining_invoice_amount > 0:
                # المبلغ الذي سيتم تخصيصه لهذه الفاتورة
                amount_to_allocate = min(remaining_invoice_amount, unallocated_amount)

                # إنشاء تفصيل دفع جديد
                PaymentDetail.objects.create(
                    payment=self,
                    invoice=invoice,
                    amount=amount_to_allocate
                )

                # تحديث حالة الفاتورة
                invoice.update_status()

                # تحديث المبلغ غير المخصص
                unallocated_amount -= amount_to_allocate
                total_allocated += amount_to_allocate
                invoices_paid += 1

                # إذا تم تخصيص كل المبلغ، نخرج من الحلقة
                if unallocated_amount <= 0:
                    break

        return invoices_paid, total_allocated


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


class SystemSettings(models.Model):
    """إعدادات النظام"""
    SETTING_TYPES = [
        ('general', 'عام'),
        ('company', 'الشركة'),
        ('reports', 'التقارير'),
        ('notifications', 'الإشعارات'),
        ('backup', 'النسخ الاحتياطي'),
        ('security', 'الأمان'),
    ]

    key = models.CharField(max_length=100, unique=True, verbose_name="المفتاح")
    value = models.TextField(verbose_name="القيمة")
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPES, default='general', verbose_name="نوع الإعداد")
    description = models.TextField(blank=True, verbose_name="الوصف")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "إعداد النظام"
        verbose_name_plural = "إعدادات النظام"
        ordering = ['setting_type', 'key']

    def __str__(self):
        return f"{self.key}: {self.value[:50]}"


class UserProfile(models.Model):
    """الملف الشخصي للمستخدم"""
    THEME_CHOICES = [
        ('light', 'فاتح'),
        ('dark', 'داكن'),
        ('auto', 'تلقائي'),
    ]

    LANGUAGE_CHOICES = [
        ('ar', 'العربية'),
        ('en', 'English'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="المستخدم")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="الصورة الشخصية")
    phone = models.CharField(max_length=20, blank=True, verbose_name="رقم الهاتف")
    address = models.TextField(blank=True, verbose_name="العنوان")
    birth_date = models.DateField(blank=True, null=True, verbose_name="تاريخ الميلاد")

    # إعدادات الواجهة
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light', verbose_name="المظهر")
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='ar', verbose_name="اللغة")
    items_per_page = models.PositiveIntegerField(default=25, verbose_name="عدد العناصر في الصفحة")

    # إعدادات الإشعارات
    email_notifications = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني")
    sms_notifications = models.BooleanField(default=False, verbose_name="إشعارات الرسائل النصية")

    # إعدادات الأمان
    two_factor_enabled = models.BooleanField(default=False, verbose_name="المصادقة الثنائية")
    last_password_change = models.DateTimeField(blank=True, null=True, verbose_name="آخر تغيير كلمة مرور")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "الملف الشخصي"
        verbose_name_plural = "الملفات الشخصية"

    def __str__(self):
        return f"ملف {self.user.get_full_name() or self.user.username}"


class BackupRecord(models.Model):
    """سجل النسخ الاحتياطي"""
    BACKUP_TYPES = [
        ('full', 'نسخة كاملة'),
        ('data', 'البيانات فقط'),
        ('files', 'الملفات فقط'),
        ('settings', 'الإعدادات فقط'),
    ]

    STATUS_CHOICES = [
        ('pending', 'في الانتظار'),
        ('running', 'قيد التنفيذ'),
        ('completed', 'مكتملة'),
        ('failed', 'فشلت'),
        ('cancelled', 'ملغية'),
    ]

    name = models.CharField(max_length=200, verbose_name="اسم النسخة")
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPES, verbose_name="نوع النسخة")
    file_path = models.CharField(max_length=500, blank=True, verbose_name="مسار الملف")
    file_size = models.BigIntegerField(default=0, verbose_name="حجم الملف (بايت)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="الحالة")

    # معلومات التنفيذ
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="منشئ النسخة")
    started_at = models.DateTimeField(blank=True, null=True, verbose_name="وقت البدء")
    completed_at = models.DateTimeField(blank=True, null=True, verbose_name="وقت الانتهاء")

    # تفاصيل إضافية
    description = models.TextField(blank=True, verbose_name="الوصف")
    error_message = models.TextField(blank=True, verbose_name="رسالة الخطأ")
    is_scheduled = models.BooleanField(default=False, verbose_name="مجدولة")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    class Meta:
        verbose_name = "سجل النسخة الاحتياطية"
        verbose_name_plural = "سجلات النسخ الاحتياطي"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"

    @property
    def duration(self):
        """حساب مدة النسخ الاحتياطي"""
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None

    @property
    def file_size_mb(self):
        """حجم الملف بالميجابايت"""
        return round(self.file_size / (1024 * 1024), 2) if self.file_size else 0


class BackupSchedule(models.Model):
    """جدولة النسخ الاحتياطي"""
    FREQUENCY_CHOICES = [
        ('daily', 'يومي'),
        ('weekly', 'أسبوعي'),
        ('monthly', 'شهري'),
        ('custom', 'مخصص'),
    ]

    name = models.CharField(max_length=200, verbose_name="اسم الجدولة")
    backup_type = models.CharField(max_length=20, choices=BackupRecord.BACKUP_TYPES, verbose_name="نوع النسخة")
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, verbose_name="التكرار")

    # إعدادات التوقيت
    time = models.TimeField(verbose_name="الوقت")
    day_of_week = models.PositiveIntegerField(blank=True, null=True, verbose_name="يوم الأسبوع (0=الاثنين)")
    day_of_month = models.PositiveIntegerField(blank=True, null=True, verbose_name="يوم الشهر")

    # إعدادات الاحتفاظ
    keep_count = models.PositiveIntegerField(default=7, verbose_name="عدد النسخ المحفوظة")

    is_active = models.BooleanField(default=True, verbose_name="نشط")
    last_run = models.DateTimeField(blank=True, null=True, verbose_name="آخر تشغيل")
    next_run = models.DateTimeField(blank=True, null=True, verbose_name="التشغيل التالي")

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="المنشئ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "جدولة النسخ الاحتياطي"
        verbose_name_plural = "جدولة النسخ الاحتياطي"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.get_frequency_display()}"

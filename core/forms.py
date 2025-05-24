from django import forms
from django.contrib.auth.forms import (AuthenticationForm, PasswordChangeForm,
                                       UserCreationForm)
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .models import (BackupRecord, BackupSchedule, Client, CompanionLeave,
                     Doctor, Hospital, LeaveInvoice, LeavePrice, Patient,
                     Payment, PaymentDetail, SickLeave, SystemSettings, User,
                     UserProfile)


class LoginForm(AuthenticationForm):
    """نموذج تسجيل الدخول"""
    username = forms.CharField(
        label=_('اسم المستخدم'),
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المستخدم'})
    )
    password = forms.CharField(
        label=_('كلمة المرور'),
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'كلمة المرور'})
    )


class RegisterForm(UserCreationForm):
    """نموذج تسجيل حساب جديد"""
    username = forms.CharField(
        label=_('اسم المستخدم'),
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المستخدم'})
    )
    email = forms.EmailField(
        label=_('البريد الإلكتروني'),
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'البريد الإلكتروني'})
    )
    password1 = forms.CharField(
        label=_('كلمة المرور'),
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'كلمة المرور'})
    )
    password2 = forms.CharField(
        label=_('تأكيد كلمة المرور'),
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'تأكيد كلمة المرور'})
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')


class UserCreateForm(UserCreationForm):
    """نموذج إنشاء مستخدم جديد"""
    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'is_active', 'password1', 'password2')
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'role': forms.Select(attrs={'class': 'form-control'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'})
        }


class UserEditForm(forms.ModelForm):
    """نموذج تعديل المستخدم"""
    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'is_active')
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'role': forms.Select(attrs={'class': 'form-control'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'})
        }


class HospitalForm(forms.ModelForm):
    """نموذج إنشاء وتعديل المستشفى"""
    class Meta:
        model = Hospital
        fields = ('name', 'name_en', 'address', 'address_en', 'contact_info', 'logo')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المستشفى'}),
            'name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'address': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى'}),
            'address_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'contact_info': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل معلومات الاتصال'}),
            'logo': forms.FileInput(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل حقول الترجمة الإنجليزية غير مطلوبة
        self.fields['name_en'].required = False
        self.fields['address_en'].required = False

        # إضافة تلميحات للمستخدم
        self.fields['name_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'
        self.fields['address_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'

    def clean_logo(self):
        """التحقق من صحة ملف الشعار"""
        logo = self.cleaned_data.get('logo')
        if logo:
            # التحقق من نوع الملف
            if not logo.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                raise forms.ValidationError('يجب أن يكون الشعار بصيغة PNG أو JPG أو JPEG أو GIF')

            # التحقق من حجم الملف (أقل من 2 ميجابايت)
            if logo.size > 2 * 1024 * 1024:
                raise forms.ValidationError('يجب أن يكون حجم الشعار أقل من 2 ميجابايت')

        return logo


# تم إزالة نموذج EmployerForm


class DoctorForm(forms.ModelForm):
    """نموذج إنشاء وتعديل الطبيب"""
    class Meta:
        model = Doctor
        fields = ('national_id', 'name', 'name_en', 'position', 'position_en', 'hospitals', 'phone', 'email')
        widgets = {
            'national_id': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'position': forms.TextInput(attrs={'class': 'form-control'}),
            'position_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'hospitals': forms.SelectMultiple(attrs={'class': 'form-control select2-multiple'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل جميع الحقول اختيارية ما عدا اسم الطبيب
        self.fields['national_id'].required = False
        self.fields['position'].required = False
        self.fields['hospitals'].required = False
        self.fields['name_en'].required = False
        self.fields['position_en'].required = False
        self.fields['phone'].required = False
        self.fields['email'].required = False


class PatientForm(forms.ModelForm):
    """نموذج إنشاء وتعديل المريض"""
    class Meta:
        model = Patient
        fields = ('national_id', 'name', 'name_en', 'nationality', 'nationality_en',
                 'employer_name', 'employer_name_en', 'phone', 'email', 'address', 'address_en')
        widgets = {
            'national_id': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'nationality': forms.TextInput(attrs={'class': 'form-control'}),
            'nationality_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'employer_name': forms.TextInput(attrs={'class': 'form-control'}),
            'employer_name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'address_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل جميع الحقول اختيارية ما عدا اسم المريض
        self.fields['national_id'].required = False
        self.fields['name_en'].required = False
        self.fields['nationality'].required = False
        self.fields['nationality_en'].required = False
        self.fields['employer_name'].required = False
        self.fields['employer_name_en'].required = False
        self.fields['phone'].required = False
        self.fields['email'].required = False
        self.fields['address'].required = False
        self.fields['address_en'].required = False

        # إضافة تلميحات للمستخدم
        self.fields['name_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'
        self.fields['nationality_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'
        self.fields['employer_name_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'
        self.fields['address_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'


class ClientForm(forms.ModelForm):
    """نموذج إنشاء وتعديل العميل"""
    class Meta:
        model = Client
        fields = ('name', 'name_en', 'phone', 'email', 'address', 'address_en', 'notes', 'notes_en')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'address_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'notes_en': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل جميع الحقول اختيارية ما عدا اسم العميل
        self.fields['phone'].required = False
        self.fields['name_en'].required = False
        self.fields['email'].required = False
        self.fields['address'].required = False
        self.fields['address_en'].required = False
        self.fields['notes'].required = False
        self.fields['notes_en'].required = False

        # إضافة تلميحات للمستخدم
        self.fields['name_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'
        self.fields['address_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'
        self.fields['notes_en'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ، يمكنك تعديله إذا كانت الترجمة غير دقيقة'


class LeavePriceForm(forms.ModelForm):
    """نموذج إنشاء وتعديل سعر الإجازة"""
    class Meta:
        model = LeavePrice
        fields = ('leave_type', 'pricing_type', 'duration_days', 'price', 'client', 'is_active')
        widgets = {
            'leave_type': forms.Select(attrs={'class': 'form-control'}),
            'pricing_type': forms.Select(attrs={'class': 'form-control'}),
            'duration_days': forms.NumberInput(attrs={'class': 'form-control', 'id': 'id_duration_days','type':'hidden'}),

            'price': forms.NumberInput(attrs={'class': 'form-control'}),
            'client': forms.Select(attrs={'class': 'form-control'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل حقل العميل اختياري مع إضافة تلميح
        self.fields['client'].required = False
        self.fields['client'].help_text = 'اترك هذا الحقل فارغًا للسعر العام، أو اختر عميلًا لتحديد سعر خاص به'

        # إضافة تلميح لحقل طريقة التسعير
        self.fields['pricing_type'].help_text = 'سعر يومي: يتم ضرب السعر في عدد أيام الإجازة. سعر ثابت: سعر ثابت للإجازة بغض النظر عن عدد الأيام'

        # إضافة مستمع JavaScript لإخفاء/إظهار حقل المدة بالأيام حسب طريقة التسعير
        self.fields['pricing_type'].widget.attrs.update({
            'onchange': 'toggleDurationField(this.value)',
            'id': 'id_pricing_type'
        })

        # إضافة معرف للحاوية التي تحتوي على حقل المدة بالأيام
        self.fields['duration_days'].widget.attrs.update({
            'data-container': 'duration_days_container'
        })

        # تعيين قيمة افتراضية للمدة (1 يوم) إذا كان السعر ثابتًا
        if 'pricing_type' in self.data and self.data['pricing_type'] == 'fixed':
            # إذا كان النموذج مقدمًا وطريقة التسعير هي "سعر ثابت"، نضع قيمة 1 للمدة
            self.data = self.data.copy()  # نسخ البيانات لتجنب خطأ "QueryDict is immutable"
            self.data['duration_days'] = 1
        elif self.instance.pk and self.instance.pricing_type == 'fixed':
            # إذا كان تعديل لسجل موجود وطريقة التسعير هي "سعر ثابت"، نضع قيمة 1 للمدة
            self.initial['duration_days'] = 1

    def clean(self):
        """التحقق من صحة البيانات المدخلة"""
        cleaned_data = super().clean()

        # التحقق من قيمة السعر
        price = cleaned_data.get('price')
        if price is not None and price <= 0:
            self.add_error('price', 'يجب أن يكون السعر أكبر من صفر')

        # التحقق من قيمة المدة بالأيام
        duration_days = cleaned_data.get('duration_days')
        pricing_type = cleaned_data.get('pricing_type')

        # إذا كان السعر ثابتًا، نضع قيمة 1 للمدة بالأيام
        if pricing_type == 'fixed':
            # تعيين قيمة المدة إلى 1 مباشرة في البيانات المنظفة
            cleaned_data['duration_days'] = 1
            # تعيين قيمة المدة في البيانات الأصلية أيضًا
            if hasattr(self, 'data') and isinstance(self.data, dict):
                self.data['duration_days'] = 1
            # تحديث قيمة الحقل في النموذج
            self.instance.duration_days = 1
        elif pricing_type == 'per_day' and (duration_days is None or duration_days <= 0):
            self.add_error('duration_days', 'يجب أن تكون المدة بالأيام أكبر من صفر للسعر اليومي')

        # التحقق من عدم وجود سعر مكرر
        leave_type = cleaned_data.get('leave_type')
        client = cleaned_data.get('client')
        duration_days = cleaned_data.get('duration_days', 1)  # استخدام القيمة المحدثة

        if leave_type and pricing_type:
            # البحث عن سعر مطابق
            existing_price = LeavePrice.objects.filter(
                leave_type=leave_type,
                pricing_type=pricing_type,
                client=client
            )

            # إذا كان السعر يوميًا، نضيف شرط المدة
            if pricing_type == 'per_day':
                existing_price = existing_price.filter(duration_days=duration_days)

            # استثناء السعر الحالي في حالة التعديل
            if self.instance.pk:
                existing_price = existing_price.exclude(pk=self.instance.pk)

            if existing_price.exists():
                client_text = f" للعميل {client.name}" if client else " العام"
                price_type_text = "يومي" if pricing_type == 'per_day' else "ثابت"
                duration_text = f" بمدة {duration_days} يوم" if pricing_type == 'per_day' else ""
                self.add_error(None, f'يوجد بالفعل سعر {price_type_text} لـ {leave_type}{duration_text}{client_text}')

        return cleaned_data

    def save(self, commit=True):
        """حفظ النموذج مع التأكد من تعيين قيمة المدة بشكل صحيح"""
        instance = super().save(commit=False)

        # إذا كان السعر ثابتًا، نتأكد من أن المدة هي 1
        if instance.pricing_type == 'fixed':
            instance.duration_days = 1

        if commit:
            instance.save()

        return instance


class SickLeaveForm(forms.ModelForm):
    """نموذج إنشاء وتعديل الإجازة المرضية"""
    # حقل اختيار بادئة رقم الإجازة
    prefix = forms.ChoiceField(
        label='بادئة رقم الإجازة',
        choices=[('PSL', 'PSL'), ('GSL', 'GSL')],
        initial='PSL',
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    # حقول إضافة مريض جديد
    new_patient_national_id = forms.CharField(
        label='رقم هوية المريض الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هوية المريض الجديد'})
    )
    new_patient_name = forms.CharField(
        label='اسم المريض الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المريض الجديد'})
    )
    new_patient_name_en = forms.CharField(
        label='اسم المريض الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_patient_phone = forms.CharField(
        label='رقم هاتف المريض الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المريض الجديد'})
    )
    new_patient_nationality = forms.CharField(
        label='جنسية المريض الجديد',
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جنسية المريض الجديد'})
    )
    new_patient_nationality_en = forms.CharField(
        label='جنسية المريض الجديد (بالإنجليزية)',
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_patient_employer_name = forms.CharField(
        label='جهة عمل المريض الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المريض الجديد'})
    )
    new_patient_employer_name_en = forms.CharField(
        label='جهة عمل المريض الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_patient_address = forms.CharField(
        label='عنوان المريض الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المريض الجديد'})
    )
    new_patient_address_en = forms.CharField(
        label='عنوان المريض الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    # حقول إضافة طبيب جديد
    new_doctor_national_id = forms.CharField(
        label='رقم هوية الطبيب الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هوية الطبيب الجديد'})
    )
    new_doctor_name = forms.CharField(
        label='اسم الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم الطبيب الجديد'})
    )
    new_doctor_name_en = forms.CharField(
        label='اسم الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_doctor_phone = forms.CharField(
        label='رقم هاتف الطبيب الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف الطبيب الجديد'})
    )
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
    )
    new_doctor_position_en = forms.CharField(
        label='منصب الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_doctor_hospital = forms.ModelMultipleChoiceField(
        label='مستشفيات الطبيب الجديد',
        queryset=Hospital.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={'class': 'form-control select2-multiple'})
    )

    # حقول إضافة مستشفى جديد
    new_hospital_name = forms.CharField(
        label='اسم المستشفى الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المستشفى الجديد'})
    )
    new_hospital_name_en = forms.CharField(
        label='اسم المستشفى الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )
    new_hospital_address_en = forms.CharField(
        label='عنوان المستشفى الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    # حقل اختيار المستشفى
    hospital = forms.ModelChoiceField(
        label='المستشفى',
        queryset=Hospital.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control select2-hospital'})
    )

    # حقل إضافة فاتورة - مخفي ومحدد افتراضياً
    create_invoice = forms.BooleanField(
        label='إنشاء فاتورة',
        required=False,
        initial=True,
        widget=forms.HiddenInput()  # جعل الحقل مخفياً
    )
    client = forms.ModelChoiceField(
        label='العميل',
        queryset=Client.objects.all(),
        required=True,  # جعل حقل العميل مطلوبًا
        widget=forms.Select(attrs={'class': 'form-control select2-client'})
    )

    class Meta:
        model = SickLeave
        fields = ('leave_id', 'prefix', 'patient', 'doctor', 'start_date', 'start_date_hijri', 'end_date', 'end_date_hijri',
                  'admission_date', 'admission_date_hijri', 'discharge_date', 'discharge_date_hijri',
                  'issue_date', 'issue_date_hijri', 'created_date', 'status', 'duration_days','duration_days2')
        widgets = {
            'leave_id': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
            'prefix': forms.Select(attrs={'class': 'form-control'}),
            'patient': forms.Select(attrs={'class': 'form-control select2-patient'}),
            'doctor': forms.Select(attrs={'class': 'form-control select2-doctor'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'start_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'admission_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'admission_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'discharge_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'discharge_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'readonly': 'readonly'}),
            'issue_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'created_date': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'duration_days': forms.NumberInput(attrs={'class': 'form-control', 'type':'hidden'}),
            'duration_days2': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل الحقول غير الإلزامية واضحة
        self.fields['admission_date'].required = False
        self.fields['discharge_date'].required = False
        self.fields['status'].required = False

        # جعل حقول التواريخ الهجرية غير مطلوبة
        self.fields['start_date_hijri'].required = False
        self.fields['end_date_hijri'].required = False
        self.fields['admission_date_hijri'].required = False
        self.fields['discharge_date_hijri'].required = False
        self.fields['issue_date_hijri'].required = False

        # جعل حقول المريض والطبيب غير مطلوبة لتمكين إضافة بيانات جديدة
        self.fields['patient'].required = False
        self.fields['doctor'].required = False

        # إضافة تلميحات للمستخدم
        self.fields['start_date'].help_text = 'تاريخ بداية الإجازة المرضية'
        self.fields['end_date'].help_text = 'تاريخ نهاية الإجازة المرضية'
        self.fields['client'].help_text = 'اختر العميل لإنشاء فاتورة'
        self.fields['patient'].help_text = 'اختر مريض موجود أو أضف مريض جديد أدناه'
        self.fields['doctor'].help_text = 'اختر طبيب موجود أو أضف طبيب جديد أدناه'
        self.fields['start_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['end_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['admission_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['discharge_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['issue_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'

        # تعيين قيم افتراضية
        if not self.instance.pk:  # إذا كان إنشاء جديد وليس تعديل
            from django.utils import timezone

            from core.utils import generate_sick_leave_id

            # توليد رقم إجازة تلقائي باستخدام البادئة المختارة
            prefix = self.initial.get('prefix', 'PSL')
            if prefix not in ['PSL', 'GSL']:
                prefix = 'PSL'  # استخدام PSL كبادئة افتراضية

            if not self.initial.get('leave_id'):
                self.initial['leave_id'] = generate_sick_leave_id(prefix)

            # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
            if not self.initial.get('issue_date'):
                self.initial['issue_date'] = timezone.now().date()

    def clean(self):
        """التحقق من صحة البيانات المدخلة"""
        cleaned_data = super().clean()

        # التحقق من وجود مريض (إما مختار من القائمة أو مدخل كبيانات جديدة)
        patient = cleaned_data.get('patient')
        new_patient_name = cleaned_data.get('new_patient_name')
        new_patient_national_id = cleaned_data.get('new_patient_national_id')

        if not patient and not (new_patient_name and new_patient_national_id):
            self.add_error('patient', 'يجب اختيار مريض موجود أو إدخال بيانات مريض جديد')

        # التحقق من وجود طبيب (إما مختار من القائمة أو مدخل كبيانات جديدة)
        doctor = cleaned_data.get('doctor')
        new_doctor_name = cleaned_data.get('new_doctor_name')
        new_doctor_national_id = cleaned_data.get('new_doctor_national_id')

        if not doctor and not (new_doctor_name and new_doctor_national_id):
            self.add_error('doctor', 'يجب اختيار طبيب موجود أو إدخال بيانات طبيب جديد')

        # التحقق من وجود مستشفى للطبيب الجديد
        if new_doctor_name and new_doctor_national_id:
            new_doctor_hospital = cleaned_data.get('new_doctor_hospital')
            new_hospital_name = cleaned_data.get('new_hospital_name')

            if not new_doctor_hospital and not new_hospital_name:
                self.add_error('new_doctor_hospital', 'يجب اختيار مستشفى موجود أو إدخال بيانات مستشفى جديد للطبيب الجديد')

        return cleaned_data


class SickLeaveWithInvoiceForm(forms.Form):
    """نموذج إنشاء إجازة مرضية مع فاتورة في خطوة واحدة"""
    # حقل اختيار بادئة رقم الإجازة
    prefix = forms.ChoiceField(
        label='بادئة رقم الإجازة',
        choices=[('PSL', 'PSL'), ('GSL', 'GSL')],
        initial='PSL',
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    # حقول المريض
    patient_national_id = forms.CharField(
        label='رقم هوية المريض',
        max_length=20,
        widget=forms.TextInput(attrs={'class': 'form-control'})

    )
    patient_name = forms.CharField(
        label='اسم المريض',
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    patient_phone = forms.CharField(
        label='رقم هاتف المريض',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})

    )

    # حقول الطبيب
    doctor = forms.ModelChoiceField(
        label='الطبيب',
        queryset=Doctor.objects.all(),
        widget=forms.Select(attrs={'class': 'form-control select2-doctor'})
    )

    # حقول إضافة طبيب جديد
    new_doctor_national_id = forms.CharField(
        label='رقم هوية الطبيب الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هوية الطبيب الجديد'})
    )
    new_doctor_name = forms.CharField(
        label='اسم الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم الطبيب الجديد'})
    )
    new_doctor_name_en = forms.CharField(
        label='اسم الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_doctor_phone = forms.CharField(
        label='رقم هاتف الطبيب الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف الطبيب الجديد'})
    )
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
    )
    new_doctor_position_en = forms.CharField(
        label='منصب الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_doctor_hospital = forms.ModelChoiceField(
        label='مستشفى الطبيب الجديد',
        queryset=Hospital.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control select2-hospital'})
    )

    # حقول إضافة مستشفى جديد
    new_hospital_name = forms.CharField(
        label='اسم المستشفى الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المستشفى الجديد'})
    )
    new_hospital_name_en = forms.CharField(
        label='اسم المستشفى الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )
    new_hospital_address_en = forms.CharField(
        label='عنوان المستشفى الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    # حقول الإجازة
    start_date = forms.DateField(
        label='تاريخ البداية',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    end_date = forms.DateField(
        label='تاريخ النهاية',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    issue_date = forms.DateField(
        label='تاريخ الإصدار',
        initial=timezone.now().date(),
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )

    # حقول الفاتورة
    create_invoice = forms.BooleanField(
        label='إنشاء فاتورة',
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    client = forms.ModelChoiceField(
        label='العميل',
        queryset=Client.objects.all(),
        required=True,  # جعل حقل العميل مطلوبًا
        widget=forms.Select(attrs={'class': 'form-control'})
    )


class CompanionLeaveForm(forms.ModelForm):
    """نموذج إنشاء وتعديل إجازة المرافق"""
    # حقل اختيار بادئة رقم الإجازة
    prefix = forms.ChoiceField(
        label='بادئة رقم الإجازة',
        choices=[('PSL', 'PSL'), ('GSL', 'GSL')],
        initial='PSL',
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    # حقول إضافة مريض جديد
    new_patient_national_id = forms.CharField(
        label='رقم هوية المريض الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هوية المريض الجديد'})
    )
    new_patient_name = forms.CharField(
        label='اسم المريض الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المريض الجديد'})
    )
    new_patient_name_en = forms.CharField(
        label='اسم المريض الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_patient_phone = forms.CharField(
        label='رقم هاتف المريض الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المريض الجديد'})
    )
    new_patient_nationality = forms.CharField(
        label='جنسية المريض الجديد',
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جنسية المريض الجديد'})
    )
    new_patient_nationality_en = forms.CharField(
        label='جنسية المريض الجديد (بالإنجليزية)',
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_patient_employer_name = forms.CharField(
        label='جهة عمل المريض الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المريض الجديد'})
    )
    new_patient_employer_name_en = forms.CharField(
        label='جهة عمل المريض الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_patient_address = forms.CharField(
        label='عنوان المريض الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المريض الجديد'})
    )
    new_patient_address_en = forms.CharField(
        label='عنوان المريض الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    # حقول إضافة مرافق جديد
    new_companion_national_id = forms.CharField(
        label='رقم هوية المرافق الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هوية المرافق الجديد'})
    )
    new_companion_name = forms.CharField(
        label='اسم المرافق الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المرافق الجديد'})
    )
    new_companion_name_en = forms.CharField(
        label='اسم المرافق الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_companion_phone = forms.CharField(
        label='رقم هاتف المرافق الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المرافق الجديد'})
    )
    new_companion_nationality = forms.CharField(
        label='جنسية المرافق الجديد',
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جنسية المرافق الجديد'})
    )
    new_companion_nationality_en = forms.CharField(
        label='جنسية المرافق الجديد (بالإنجليزية)',
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_companion_relation = forms.CharField(
        label='صلة قرابة المرافق الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل صلة قرابة المرافق الجديد'})
    )
    new_companion_relation_en = forms.CharField(
        label='صلة قرابة المرافق الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_companion_employer_name = forms.CharField(
        label='جهة عمل المرافق الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المرافق الجديد'})
    )
    new_companion_employer_name_en = forms.CharField(
        label='جهة عمل المرافق الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_companion_address = forms.CharField(
        label='عنوان المرافق الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المرافق الجديد'})
    )
    new_companion_address_en = forms.CharField(
        label='عنوان المرافق الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    # حقول إضافة طبيب جديد
    new_doctor_national_id = forms.CharField(
        label='رقم هوية الطبيب الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هوية الطبيب الجديد'})
    )
    new_doctor_name = forms.CharField(
        label='اسم الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم الطبيب الجديد'})
    )
    new_doctor_name_en = forms.CharField(
        label='اسم الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_doctor_phone = forms.CharField(
        label='رقم هاتف الطبيب الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف الطبيب الجديد'})
    )
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
    )
    new_doctor_position_en = forms.CharField(
        label='منصب الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_doctor_hospital = forms.ModelMultipleChoiceField(
        label='مستشفيات الطبيب الجديد',
        queryset=Hospital.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={'class': 'form-control select2-multiple'})
    )

    # حقول إضافة مستشفى جديد
    new_hospital_name = forms.CharField(
        label='اسم المستشفى الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المستشفى الجديد'})
    )
    new_hospital_name_en = forms.CharField(
        label='اسم المستشفى الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )
    new_hospital_address_en = forms.CharField(
        label='عنوان المستشفى الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    # حقل اختيار المستشفى
    hospital = forms.ModelChoiceField(
        label='المستشفى',
        queryset=Hospital.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control select2-hospital'})
    )

    # حقل إضافة فاتورة - مخفي ومحدد افتراضياً
    create_invoice = forms.BooleanField(
        label='إنشاء فاتورة',
        required=False,
        initial=True,
        widget=forms.HiddenInput()  # جعل الحقل مخفياً
    )
    client = forms.ModelChoiceField(
        label='العميل',
        queryset=Client.objects.all(),
        required=True,  # جعل حقل العميل مطلوبًا
        widget=forms.Select(attrs={'class': 'form-control select2-client'})
    )

    # حقل صلة القرابة
    relation = forms.CharField(
        label='صلة القرابة',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل صلة القرابة'})
    )
    relation_en = forms.CharField(
        label='صلة القرابة (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    class Meta:
        model = CompanionLeave
        fields = ('leave_id', 'prefix', 'patient', 'companion', 'relation', 'relation_en', 'doctor', 'start_date', 'start_date_hijri', 'end_date', 'end_date_hijri',
                  'admission_date', 'admission_date_hijri', 'discharge_date', 'discharge_date_hijri',
                  'issue_date', 'issue_date_hijri', 'created_date', 'status', 'duration_days','duration_days2')
        widgets = {
            'leave_id': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
            'prefix': forms.Select(attrs={'class': 'form-control'}),
            'patient': forms.Select(attrs={'class': 'form-control select2-patient'}),
            'companion': forms.Select(attrs={'class': 'form-control select2-companion'}),
            'doctor': forms.Select(attrs={'class': 'form-control select2-doctor'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'start_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'admission_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'admission_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'discharge_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'discharge_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'readonly': 'readonly'}),
            'issue_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'created_date': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'duration_days': forms.NumberInput(attrs={'class': 'form-control', 'type':'hidden'}),
            'duration_days2': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل الحقول غير الإلزامية واضحة
        self.fields['admission_date'].required = False
        self.fields['discharge_date'].required = False
        self.fields['status'].required = False

        # جعل حقول التواريخ الهجرية غير مطلوبة
        self.fields['start_date_hijri'].required = False
        self.fields['end_date_hijri'].required = False
        self.fields['admission_date_hijri'].required = False
        self.fields['discharge_date_hijri'].required = False
        self.fields['issue_date_hijri'].required = False

        # جعل حقول المريض والمرافق والطبيب غير مطلوبة لتمكين إضافة بيانات جديدة
        self.fields['patient'].required = False
        self.fields['companion'].required = False
        self.fields['doctor'].required = False

        # إضافة تلميحات للمستخدم
        self.fields['start_date'].help_text = 'تاريخ بداية إجازة المرافق'
        self.fields['end_date'].help_text = 'تاريخ نهاية إجازة المرافق'
        self.fields['patient'].help_text = 'اختر مريض موجود أو أضف مريض جديد أدناه'
        self.fields['companion'].help_text = 'اختر مرافق موجود أو أضف مرافق جديد أدناه'
        self.fields['doctor'].help_text = 'اختر طبيب موجود أو أضف طبيب جديد أدناه'
        self.fields['client'].help_text = 'اختر العميل لإنشاء فاتورة'
        self.fields['start_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['end_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['admission_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['discharge_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['issue_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'

        # تعيين قيم افتراضية
        if not self.instance.pk:  # إذا كان إنشاء جديد وليس تعديل
            from django.utils import timezone

            from core.utils import generate_companion_leave_id

            # توليد رقم إجازة تلقائي باستخدام البادئة المختارة
            prefix = self.initial.get('prefix', 'PSL')
            if prefix not in ['PSL', 'GSL']:
                prefix = 'PSL'  # استخدام PSL كبادئة افتراضية

            if not self.initial.get('leave_id'):
                self.initial['leave_id'] = generate_companion_leave_id(prefix)

            # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
            if not self.initial.get('issue_date'):
                self.initial['issue_date'] = timezone.now().date()

    def clean(self):
        """التحقق من صحة البيانات المدخلة"""
        cleaned_data = super().clean()

        # التحقق من وجود مريض (إما مختار من القائمة أو مدخل كبيانات جديدة)
        patient = cleaned_data.get('patient')
        new_patient_name = cleaned_data.get('new_patient_name')
        new_patient_national_id = cleaned_data.get('new_patient_national_id')

        if not patient and not (new_patient_name and new_patient_national_id):
            self.add_error('patient', 'يجب اختيار مريض موجود أو إدخال بيانات مريض جديد')

        # التحقق من وجود مرافق (إما مختار من القائمة أو مدخل كبيانات جديدة)
        companion = cleaned_data.get('companion')
        new_companion_name = cleaned_data.get('new_companion_name')
        new_companion_national_id = cleaned_data.get('new_companion_national_id')

        if not companion and not (new_companion_name and new_companion_national_id):
            self.add_error('companion', 'يجب اختيار مرافق موجود أو إدخال بيانات مرافق جديد')

        # التحقق من وجود طبيب (إما مختار من القائمة أو مدخل كبيانات جديدة)
        doctor = cleaned_data.get('doctor')
        new_doctor_name = cleaned_data.get('new_doctor_name')
        new_doctor_national_id = cleaned_data.get('new_doctor_national_id')

        if not doctor and not (new_doctor_name and new_doctor_national_id):
            self.add_error('doctor', 'يجب اختيار طبيب موجود أو إدخال بيانات طبيب جديد')

        # التحقق من وجود مستشفى للطبيب الجديد
        if new_doctor_name and new_doctor_national_id:
            new_doctor_hospital = cleaned_data.get('new_doctor_hospital')
            new_hospital_name = cleaned_data.get('new_hospital_name')

            if not new_doctor_hospital and not new_hospital_name:
                self.add_error('new_doctor_hospital', 'يجب اختيار مستشفى موجود أو إدخال بيانات مستشفى جديد للطبيب الجديد')

        return cleaned_data


class CompanionLeaveWithInvoiceForm(forms.Form):
    """نموذج إنشاء إجازة مرافق مع فاتورة في خطوة واحدة"""
    # حقل اختيار بادئة رقم الإجازة
    prefix = forms.ChoiceField(
        label='بادئة رقم الإجازة',
        choices=[('PSL', 'PSL'), ('GSL', 'GSL')],
        initial='PSL',
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    # حقول المريض
    patient_national_id = forms.CharField(
        label='رقم هوية المريض',
        max_length=20,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    patient_name = forms.CharField(
        label='اسم المريض',
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    patient_name_en = forms.CharField(
        label='اسم المريض (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    patient_phone = forms.CharField(
        label='رقم هاتف المريض',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    # حقول المرافق
    companion_national_id = forms.CharField(
        label='رقم هوية المرافق',
        max_length=20,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    companion_name = forms.CharField(
        label='اسم المرافق',
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    companion_name_en = forms.CharField(
        label='اسم المرافق (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    companion_phone = forms.CharField(
        label='رقم هاتف المرافق',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    relation = forms.CharField(
        label='صلة القرابة',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل صلة القرابة'})
    )
    relation_en = forms.CharField(
        label='صلة القرابة (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    # حقول الطبيب
    doctor = forms.ModelChoiceField(
        label='الطبيب',
        queryset=Doctor.objects.all(),
        widget=forms.Select(attrs={'class': 'form-control select2-doctor'})
    )

    # حقول إضافة طبيب جديد
    new_doctor_national_id = forms.CharField(
        label='رقم هوية الطبيب الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هوية الطبيب الجديد'})
    )
    new_doctor_name = forms.CharField(
        label='اسم الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم الطبيب الجديد'})
    )
    new_doctor_name_en = forms.CharField(
        label='اسم الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_doctor_phone = forms.CharField(
        label='رقم هاتف الطبيب الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف الطبيب الجديد'})
    )
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
    )
    new_doctor_position_en = forms.CharField(
        label='منصب الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_doctor_hospital = forms.ModelChoiceField(
        label='مستشفى الطبيب الجديد',
        queryset=Hospital.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control select2-hospital'})
    )

    # حقول إضافة مستشفى جديد
    new_hospital_name = forms.CharField(
        label='اسم المستشفى الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المستشفى الجديد'})
    )
    new_hospital_name_en = forms.CharField(
        label='اسم المستشفى الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )
    new_hospital_address_en = forms.CharField(
        label='عنوان المستشفى الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )

    # حقول الإجازة
    start_date = forms.DateField(
        label='تاريخ البداية',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    end_date = forms.DateField(
        label='تاريخ النهاية',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    issue_date = forms.DateField(
        label='تاريخ الإصدار',
        initial=timezone.now().date(),
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )

    # حقول الفاتورة
    create_invoice = forms.BooleanField(
        label='إنشاء فاتورة',
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    client = forms.ModelChoiceField(
        label='العميل',
        queryset=Client.objects.all(),
        required=True,  # جعل حقل العميل مطلوبًا
        widget=forms.Select(attrs={'class': 'form-control'})
    )


class LeaveInvoiceForm(forms.ModelForm):
    """نموذج إنشاء وتعديل فاتورة الإجازة"""
    class Meta:
        model = LeaveInvoice
        fields = ('invoice_number', 'client', 'leave_type', 'leave_id', 'amount',
                  'status', 'issue_date', 'due_date', 'notes')
        widgets = {
            'invoice_number': forms.TextInput(attrs={'class': 'form-control'}),
            'client': forms.Select(attrs={'class': 'form-control'}),
            'leave_type': forms.Select(attrs={'class': 'form-control'}),
            'leave_id': forms.TextInput(attrs={'class': 'form-control'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'due_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
        }


class PaymentForm(forms.ModelForm):
    """نموذج إنشاء وتعديل الدفعة"""
    class Meta:
        model = Payment
        fields = ('payment_number', 'client', 'amount', 'payment_method',
                  'payment_date', 'reference_number', 'notes')
        widgets = {
            'payment_number': forms.TextInput(attrs={'class': 'form-control'}),
            'client': forms.Select(attrs={'class': 'form-control'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control'}),
            'payment_method': forms.Select(attrs={'class': 'form-control'}),
            'payment_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'reference_number': forms.TextInput(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
        }


class PaymentDetailForm(forms.ModelForm):
    """نموذج إنشاء وتعديل تفاصيل الدفعة"""
    class Meta:
        model = PaymentDetail
        fields = ('invoice', 'amount')
        widgets = {
            'invoice': forms.Select(attrs={'class': 'form-control'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control'})
        }


# تم نقل نموذج LeaveRequestForm إلى تطبيق ai_leaves


# ===== نماذج الإعدادات والملف الشخصي =====

class SystemSettingsForm(forms.Form):
    """نموذج إعدادات النظام العامة"""

    # الإعدادات العامة
    site_name = forms.CharField(
        label="اسم الموقع",
        max_length=200,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    site_description = forms.CharField(
        label="وصف الموقع",
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
    )
    default_language = forms.ChoiceField(
        label="اللغة الافتراضية",
        choices=[('ar', 'العربية'), ('en', 'English')],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    timezone = forms.CharField(
        label="المنطقة الزمنية",
        max_length=50,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    items_per_page = forms.IntegerField(
        label="عدد العناصر في الصفحة",
        min_value=10,
        max_value=100,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )


class CompanySettingsForm(forms.Form):
    """نموذج إعدادات الشركة"""

    company_name = forms.CharField(
        label="اسم الشركة",
        max_length=200,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    company_address = forms.CharField(
        label="عنوان الشركة",
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
    )
    company_phone = forms.CharField(
        label="هاتف الشركة",
        max_length=20,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    company_email = forms.EmailField(
        label="بريد الشركة الإلكتروني",
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    company_website = forms.URLField(
        label="موقع الشركة",
        required=False,
        widget=forms.URLInput(attrs={'class': 'form-control'})
    )
    license_number = forms.CharField(
        label="رقم الترخيص",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )


class UserProfileForm(forms.ModelForm):
    """نموذج الملف الشخصي للمستخدم"""

    class Meta:
        model = UserProfile
        fields = [
            'avatar', 'phone', 'address', 'birth_date',
            'theme', 'language', 'items_per_page',
            'email_notifications', 'sms_notifications'
        ]
        widgets = {
            'avatar': forms.FileInput(attrs={'class': 'form-control', 'accept': 'image/*'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'birth_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'theme': forms.Select(attrs={'class': 'form-control'}),
            'language': forms.Select(attrs={'class': 'form-control'}),
            'items_per_page': forms.NumberInput(attrs={'class': 'form-control'}),
            'email_notifications': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'sms_notifications': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class BackupCreateForm(forms.Form):
    """نموذج إنشاء نسخة احتياطية"""

    name = forms.CharField(
        label="اسم النسخة الاحتياطية",
        max_length=200,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    backup_type = forms.ChoiceField(
        label="نوع النسخة الاحتياطية",
        choices=BackupRecord.BACKUP_TYPES,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    description = forms.CharField(
        label="الوصف",
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
    )


class NotificationSettingsForm(forms.Form):
    """نموذج إعدادات الإشعارات"""

    email_notifications_enabled = forms.BooleanField(
        label="تفعيل إشعارات البريد الإلكتروني",
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    sms_notifications_enabled = forms.BooleanField(
        label="تفعيل إشعارات الرسائل النصية",
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    notification_email = forms.EmailField(
        label="بريد الإشعارات",
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    smtp_host = forms.CharField(
        label="خادم SMTP",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    smtp_port = forms.IntegerField(
        label="منفذ SMTP",
        min_value=1,
        max_value=65535,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    smtp_username = forms.CharField(
        label="اسم مستخدم SMTP",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    smtp_password = forms.CharField(
        label="كلمة مرور SMTP",
        max_length=100,
        required=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    smtp_use_tls = forms.BooleanField(
        label="استخدام TLS",
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )


class BackupSettingsForm(forms.Form):
    """نموذج إعدادات النسخ الاحتياطي"""

    auto_backup_enabled = forms.BooleanField(
        label="تفعيل النسخ الاحتياطي التلقائي",
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    backup_frequency = forms.ChoiceField(
        label="تكرار النسخ الاحتياطي",
        choices=[
            ('daily', 'يومي'),
            ('weekly', 'أسبوعي'),
            ('monthly', 'شهري')
        ],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    backup_time = forms.TimeField(
        label="وقت النسخ الاحتياطي",
        widget=forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'})
    )
    keep_backup_count = forms.IntegerField(
        label="عدد النسخ المحفوظة",
        min_value=1,
        max_value=30,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    compress_backups = forms.BooleanField(
        label="ضغط النسخ الاحتياطي",
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )


class CustomPasswordChangeForm(PasswordChangeForm):
    """نموذج تغيير كلمة المرور المخصص"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['old_password'].widget.attrs.update({'class': 'form-control'})
        self.fields['new_password1'].widget.attrs.update({'class': 'form-control'})
        self.fields['new_password2'].widget.attrs.update({'class': 'form-control'})

        self.fields['old_password'].label = "كلمة المرور الحالية"
        self.fields['new_password1'].label = "كلمة المرور الجديدة"
        self.fields['new_password2'].label = "تأكيد كلمة المرور الجديدة"


class RestoreBackupForm(forms.Form):
    """نموذج استعادة النسخة الاحتياطية"""

    restore_data = forms.BooleanField(
        label="استعادة البيانات",
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    restore_files = forms.BooleanField(
        label="استعادة الملفات",
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    restore_settings = forms.BooleanField(
        label="استعادة الإعدادات",
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    confirm_restore = forms.BooleanField(
        label="أؤكد أنني أريد استعادة هذه النسخة الاحتياطية (سيتم استبدال البيانات الحالية)",
        required=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )


class UploadRestoreForm(forms.Form):
    """نموذج استعادة نسخة احتياطية من ملف مرفوع"""

    backup_file = forms.FileField(
        label='ملف النسخة الاحتياطية',
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': '.zip,.json',
            'required': True
        }),
        help_text='اختر ملف النسخة الاحتياطية (.zip أو .json)'
    )

    backup_type = forms.ChoiceField(
        label='نوع النسخة الاحتياطية',
        choices=[
            ('', 'تحديد تلقائي'),
            ('full', 'نسخة كاملة'),
            ('data', 'البيانات فقط'),
            ('files', 'الملفات فقط'),
            ('settings', 'الإعدادات فقط'),
        ],
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
        help_text='اتركه فارغاً للتحديد التلقائي'
    )

    restore_data = forms.BooleanField(
        label='استعادة البيانات',
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        help_text='استعادة قاعدة البيانات'
    )

    restore_files = forms.BooleanField(
        label='استعادة الملفات',
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        help_text='استعادة الملفات المرفوعة'
    )

    restore_settings = forms.BooleanField(
        label='استعادة الإعدادات',
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        help_text='استعادة إعدادات النظام'
    )

    confirm_restore = forms.BooleanField(
        label='أؤكد أنني أريد استعادة النسخة الاحتياطية',
        required=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        help_text='تحذير: ستحل النسخة الاحتياطية محل البيانات الحالية'
    )

    def clean_backup_file(self):
        backup_file = self.cleaned_data.get('backup_file')
        if backup_file:
            # التحقق من حجم الملف (حد أقصى 500 ميجابايت)
            if backup_file.size > 500 * 1024 * 1024:
                raise forms.ValidationError('حجم الملف كبير جداً. الحد الأقصى 500 ميجابايت.')

            # التحقق من امتداد الملف
            import os
            allowed_extensions = ['.zip', '.json']
            file_extension = os.path.splitext(backup_file.name)[1].lower()
            if file_extension not in allowed_extensions:
                raise forms.ValidationError('نوع الملف غير مدعوم. يُسمح بملفات .zip و .json فقط.')

        return backup_file


class UISettingsForm(forms.Form):
    """نموذج إعدادات الواجهة"""

    theme_primary_color = forms.CharField(
        label="اللون الأساسي",
        max_length=7,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'color'})
    )
    theme_secondary_color = forms.CharField(
        label="اللون الثانوي",
        max_length=7,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'color'})
    )
    theme_success_color = forms.CharField(
        label="لون النجاح",
        max_length=7,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'color'})
    )
    theme_danger_color = forms.CharField(
        label="لون الخطر",
        max_length=7,
        widget=forms.TextInput(attrs={'class': 'form-control', 'type': 'color'})
    )
    font_family = forms.CharField(
        label="خط النص",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    font_size_base = forms.CharField(
        label="حجم الخط الأساسي",
        max_length=10,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    border_radius = forms.CharField(
        label="انحناء الحواف",
        max_length=10,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )


class ValidationSettingsForm(forms.Form):
    """نموذج إعدادات التحقق"""

    phone_regex = forms.CharField(
        label="نمط رقم الهاتف",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    national_id_regex = forms.CharField(
        label="نمط رقم الهوية",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    email_required = forms.BooleanField(
        label="البريد الإلكتروني مطلوب",
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    phone_required = forms.BooleanField(
        label="رقم الهاتف مطلوب",
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    address_max_length = forms.IntegerField(
        label="الحد الأقصى لطول العنوان",
        min_value=50,
        max_value=1000,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    name_max_length = forms.IntegerField(
        label="الحد الأقصى لطول الاسم",
        min_value=20,
        max_value=200,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )


class FileSettingsForm(forms.Form):
    """نموذج إعدادات الملفات"""

    max_file_size_mb = forms.IntegerField(
        label="الحد الأقصى لحجم الملف (ميجابايت)",
        min_value=1,
        max_value=100,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    allowed_image_formats = forms.CharField(
        label="صيغ الصور المسموحة",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'png,jpg,jpeg,gif'})
    )
    allowed_document_formats = forms.CharField(
        label="صيغ المستندات المسموحة",
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'pdf,doc,docx,xls,xlsx'})
    )
    image_max_width = forms.IntegerField(
        label="العرض الأقصى للصور",
        min_value=100,
        max_value=5000,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    image_max_height = forms.IntegerField(
        label="الارتفاع الأقصى للصور",
        min_value=100,
        max_value=5000,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )

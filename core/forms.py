from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .models import (Client, CompanionLeave, Doctor, Hospital, LeaveInvoice,
                     LeavePrice, Patient, Payment, PaymentDetail, SickLeave,
                     User)


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
<<<<<<< HEAD
        fields = ('name', 'address', 'contact_info', 'logo')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المستشفى'}),
            'address': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى'}),
=======
        fields = ('name', 'name_en', 'address', 'address_en', 'contact_info', 'logo')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المستشفى'}),
            'name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'address': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى'}),
            'address_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
>>>>>>> settings
            'contact_info': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل معلومات الاتصال'}),
            'logo': forms.FileInput(attrs={'class': 'form-control'})
        }

<<<<<<< HEAD
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

=======
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل حقول الترجمة الإنجليزية غير مطلوبة
        self.fields['name_en'].required = False
        self.fields['address_en'].required = False
>>>>>>> settings

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
        fields = ('national_id', 'name', 'name_en', 'position', 'position_en', 'hospital', 'phone', 'email')
        widgets = {
            'national_id': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'position': forms.TextInput(attrs={'class': 'form-control'}),
            'position_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'hospital': forms.Select(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل جميع الحقول اختيارية ما عدا اسم الطبيب
        self.fields['national_id'].required = False
        self.fields['position'].required = False
        self.fields['hospital'].required = False
        self.fields['name_en'].required = False
        self.fields['position_en'].required = False
        self.fields['phone'].required = False
        self.fields['email'].required = False


class PatientForm(forms.ModelForm):
    """نموذج إنشاء وتعديل المريض"""
    class Meta:
        model = Patient
<<<<<<< HEAD
        fields = ('national_id', 'name', 'nationality', 'employer_name', 'phone', 'email', 'address')
=======
        fields = ('national_id', 'name', 'name_en', 'nationality', 'nationality_en',
                 'employer_name', 'employer_name_en', 'phone', 'email', 'address', 'address_en')
>>>>>>> settings
        widgets = {
            'national_id': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'nationality': forms.TextInput(attrs={'class': 'form-control'}),
<<<<<<< HEAD
            'employer_name': forms.TextInput(attrs={'class': 'form-control'}),
=======
            'nationality_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'employer_name': forms.TextInput(attrs={'class': 'form-control'}),
            'employer_name_en': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
>>>>>>> settings
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
<<<<<<< HEAD
            'duration_days': forms.NumberInput(attrs={'class': 'form-control'}),
=======
            'duration_days': forms.NumberInput(attrs={'class': 'form-control', 'id': 'id_duration_days'}),
>>>>>>> settings
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
<<<<<<< HEAD
            'onchange': 'toggleDurationField(this.value)'
        })

=======
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

>>>>>>> settings

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
<<<<<<< HEAD
=======
    new_patient_name_en = forms.CharField(
        label='اسم المريض الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
    new_patient_phone = forms.CharField(
        label='رقم هاتف المريض الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المريض الجديد'})
    )
<<<<<<< HEAD
=======
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
>>>>>>> settings
    new_patient_employer_name = forms.CharField(
        label='جهة عمل المريض الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المريض الجديد'})
    )
<<<<<<< HEAD
=======
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
>>>>>>> settings

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
<<<<<<< HEAD
=======
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
>>>>>>> settings
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
    )
<<<<<<< HEAD
=======
    new_doctor_position_en = forms.CharField(
        label='منصب الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
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
<<<<<<< HEAD
=======
    new_hospital_name_en = forms.CharField(
        label='اسم المستشفى الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )
<<<<<<< HEAD
=======
    new_hospital_address_en = forms.CharField(
        label='عنوان المستشفى الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings

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
                  'issue_date', 'issue_date_hijri', 'status')
        widgets = {
            'leave_id': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
<<<<<<< HEAD
=======
            'prefix': forms.Select(attrs={'class': 'form-control'}),
>>>>>>> settings
            'patient': forms.Select(attrs={'class': 'form-control select2-patient'}),
            'doctor': forms.Select(attrs={'class': 'form-control select2-doctor'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'start_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'admission_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'admission_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'discharge_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
<<<<<<< HEAD
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'readonly': 'readonly'}),
=======
            'discharge_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'readonly': 'readonly'}),
            'issue_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
>>>>>>> settings
            'status': forms.Select(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل الحقول غير الإلزامية واضحة
        self.fields['admission_date'].required = False
        self.fields['discharge_date'].required = False
        self.fields['status'].required = False

<<<<<<< HEAD
=======
        # جعل حقول التواريخ الهجرية غير مطلوبة
        self.fields['start_date_hijri'].required = False
        self.fields['end_date_hijri'].required = False
        self.fields['admission_date_hijri'].required = False
        self.fields['discharge_date_hijri'].required = False
        self.fields['issue_date_hijri'].required = False

>>>>>>> settings
        # جعل حقول المريض والطبيب غير مطلوبة لتمكين إضافة بيانات جديدة
        self.fields['patient'].required = False
        self.fields['doctor'].required = False

        # إضافة تلميحات للمستخدم
        self.fields['start_date'].help_text = 'تاريخ بداية الإجازة المرضية'
        self.fields['end_date'].help_text = 'تاريخ نهاية الإجازة المرضية'
        self.fields['client'].help_text = 'اختر العميل لإنشاء فاتورة'
        self.fields['patient'].help_text = 'اختر مريض موجود أو أضف مريض جديد أدناه'
        self.fields['doctor'].help_text = 'اختر طبيب موجود أو أضف طبيب جديد أدناه'
<<<<<<< HEAD

        # تعيين قيم افتراضية
        if not self.instance.pk:  # إذا كان إنشاء جديد وليس تعديل
            import datetime

            from django.utils import timezone

            from core.utils import generate_unique_number

            # توليد رقم إجازة تلقائي
            if not self.initial.get('leave_id'):
                self.initial['leave_id'] = generate_unique_number('SL', SickLeave)
=======
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
>>>>>>> settings

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
<<<<<<< HEAD
=======
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
>>>>>>> settings
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
    )
<<<<<<< HEAD
=======
    new_doctor_position_en = forms.CharField(
        label='منصب الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
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
<<<<<<< HEAD
=======
    new_hospital_name_en = forms.CharField(
        label='اسم المستشفى الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )
<<<<<<< HEAD
=======
    new_hospital_address_en = forms.CharField(
        label='عنوان المستشفى الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings

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
<<<<<<< HEAD
=======
    new_patient_name_en = forms.CharField(
        label='اسم المريض الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
    new_patient_phone = forms.CharField(
        label='رقم هاتف المريض الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المريض الجديد'})
    )
<<<<<<< HEAD
=======
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
>>>>>>> settings
    new_patient_employer_name = forms.CharField(
        label='جهة عمل المريض الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المريض الجديد'})
    )
<<<<<<< HEAD
=======
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
>>>>>>> settings

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
<<<<<<< HEAD
=======
    new_companion_name_en = forms.CharField(
        label='اسم المرافق الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
    new_companion_phone = forms.CharField(
        label='رقم هاتف المرافق الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المرافق الجديد'})
    )
<<<<<<< HEAD
=======
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
>>>>>>> settings
    new_companion_employer_name = forms.CharField(
        label='جهة عمل المرافق الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المرافق الجديد'})
    )
<<<<<<< HEAD
=======
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
>>>>>>> settings

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
<<<<<<< HEAD
=======
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
>>>>>>> settings
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
    )
<<<<<<< HEAD
=======
    new_doctor_position_en = forms.CharField(
        label='منصب الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
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
<<<<<<< HEAD
=======
    new_hospital_name_en = forms.CharField(
        label='اسم المستشفى الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )
<<<<<<< HEAD
=======
    new_hospital_address_en = forms.CharField(
        label='عنوان المستشفى الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings

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

<<<<<<< HEAD
=======
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

>>>>>>> settings
    class Meta:
        model = CompanionLeave
        fields = ('leave_id', 'prefix', 'patient', 'companion', 'relation', 'relation_en', 'doctor', 'start_date', 'start_date_hijri', 'end_date', 'end_date_hijri',
                  'admission_date', 'admission_date_hijri', 'discharge_date', 'discharge_date_hijri',
                  'issue_date', 'issue_date_hijri', 'status')
        widgets = {
            'leave_id': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
<<<<<<< HEAD
=======
            'prefix': forms.Select(attrs={'class': 'form-control'}),
>>>>>>> settings
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
<<<<<<< HEAD
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'readonly': 'readonly'}),
=======
            'discharge_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'readonly': 'readonly'}),
            'issue_date_hijri': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'}),
>>>>>>> settings
            'status': forms.Select(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل الحقول غير الإلزامية واضحة
        self.fields['admission_date'].required = False
        self.fields['discharge_date'].required = False
        self.fields['status'].required = False

<<<<<<< HEAD
=======
        # جعل حقول التواريخ الهجرية غير مطلوبة
        self.fields['start_date_hijri'].required = False
        self.fields['end_date_hijri'].required = False
        self.fields['admission_date_hijri'].required = False
        self.fields['discharge_date_hijri'].required = False
        self.fields['issue_date_hijri'].required = False

>>>>>>> settings
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
<<<<<<< HEAD
=======
        self.fields['start_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['end_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['admission_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['discharge_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
        self.fields['issue_date_hijri'].help_text = 'سيتم ملء هذا الحقل تلقائيًا عند الحفظ'
>>>>>>> settings

        # تعيين قيم افتراضية
        if not self.instance.pk:  # إذا كان إنشاء جديد وليس تعديل
            from django.utils import timezone

<<<<<<< HEAD
            from core.utils import generate_unique_number

            # توليد رقم إجازة تلقائي
            if not self.initial.get('leave_id'):
                self.initial['leave_id'] = generate_unique_number('CL', CompanionLeave)
=======
            from core.utils import generate_companion_leave_id

            # توليد رقم إجازة تلقائي باستخدام البادئة المختارة
            prefix = self.initial.get('prefix', 'PSL')
            if prefix not in ['PSL', 'GSL']:
                prefix = 'PSL'  # استخدام PSL كبادئة افتراضية

            if not self.initial.get('leave_id'):
                self.initial['leave_id'] = generate_companion_leave_id(prefix)
>>>>>>> settings

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
<<<<<<< HEAD
=======
    patient_name_en = forms.CharField(
        label='اسم المريض (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
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
<<<<<<< HEAD
=======
    companion_name_en = forms.CharField(
        label='اسم المرافق (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
    companion_phone = forms.CharField(
        label='رقم هاتف المرافق',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
<<<<<<< HEAD
=======
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
>>>>>>> settings

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
<<<<<<< HEAD
=======
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
>>>>>>> settings
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
    )
<<<<<<< HEAD
=======
    new_doctor_position_en = forms.CharField(
        label='منصب الطبيب الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
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
<<<<<<< HEAD
=======
    new_hospital_name_en = forms.CharField(
        label='اسم المستشفى الجديد (بالإنجليزية)',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )
<<<<<<< HEAD
=======
    new_hospital_address_en = forms.CharField(
        label='عنوان المستشفى الجديد (بالإنجليزية)',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'سيتم ملؤه تلقائيًا عند الحفظ'})
    )
>>>>>>> settings

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

from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .models import (Client, CompanionLeave, Doctor, Employer, Hospital,
                     LeaveInvoice, LeavePrice, Patient, Payment, PaymentDetail,
                     SickLeave, User)


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
        fields = ('name', 'address', 'contact_info', 'logo')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل اسم المستشفى'}),
            'address': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى'}),
            'contact_info': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل معلومات الاتصال'}),
            'logo': forms.FileInput(attrs={'class': 'form-control'})
        }

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


class EmployerForm(forms.ModelForm):
    """نموذج إنشاء وتعديل جهة العمل"""
    class Meta:
        model = Employer
        fields = ('name', 'address', 'contact_info')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'contact_info': forms.TextInput(attrs={'class': 'form-control'})
        }


class DoctorForm(forms.ModelForm):
    """نموذج إنشاء وتعديل الطبيب"""
    class Meta:
        model = Doctor
        fields = ('national_id', 'name', 'position', 'hospital', 'phone', 'email')
        widgets = {
            'national_id': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'position': forms.TextInput(attrs={'class': 'form-control'}),
            'hospital': forms.Select(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'})
        }


class PatientForm(forms.ModelForm):
    """نموذج إنشاء وتعديل المريض"""
    class Meta:
        model = Patient
        fields = ('national_id', 'name', 'nationality', 'employer_name', 'phone', 'email', 'address')
        widgets = {
            'national_id': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'nationality': forms.TextInput(attrs={'class': 'form-control'}),
            'employer_name': forms.TextInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'})
        }


class ClientForm(forms.ModelForm):
    """نموذج إنشاء وتعديل العميل"""
    class Meta:
        model = Client
        fields = ('name', 'phone', 'email', 'address', 'notes')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
        }


class LeavePriceForm(forms.ModelForm):
    """نموذج إنشاء وتعديل سعر الإجازة"""
    class Meta:
        model = LeavePrice
        fields = ('leave_type', 'pricing_type', 'duration_days', 'price', 'client', 'is_active')
        widgets = {
            'leave_type': forms.Select(attrs={'class': 'form-control'}),
            'pricing_type': forms.Select(attrs={'class': 'form-control'}),
            'duration_days': forms.NumberInput(attrs={'class': 'form-control'}),
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
            'onchange': 'toggleDurationField(this.value)'
        })


class SickLeaveForm(forms.ModelForm):
    """نموذج إنشاء وتعديل الإجازة المرضية"""
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
    new_patient_phone = forms.CharField(
        label='رقم هاتف المريض الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المريض الجديد'})
    )
    new_patient_employer_name = forms.CharField(
        label='جهة عمل المريض الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المريض الجديد'})
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
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
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
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )

    # حقل إضافة فاتورة
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
        widget=forms.Select(attrs={'class': 'form-control select2-client'})
    )

    class Meta:
        model = SickLeave
        fields = ('leave_id', 'patient', 'doctor', 'start_date', 'end_date',
                  'admission_date', 'discharge_date', 'issue_date', 'status')
        widgets = {
            'leave_id': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
            'patient': forms.Select(attrs={'class': 'form-control select2-patient'}),
            'doctor': forms.Select(attrs={'class': 'form-control select2-doctor'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'admission_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'discharge_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'readonly': 'readonly'}),
            'status': forms.Select(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل الحقول غير الإلزامية واضحة
        self.fields['admission_date'].required = False
        self.fields['discharge_date'].required = False
        self.fields['status'].required = False

        # جعل حقول المريض والطبيب غير مطلوبة لتمكين إضافة بيانات جديدة
        self.fields['patient'].required = False
        self.fields['doctor'].required = False

        # إضافة تلميحات للمستخدم
        self.fields['start_date'].help_text = 'تاريخ بداية الإجازة المرضية'
        self.fields['end_date'].help_text = 'تاريخ نهاية الإجازة المرضية'
        self.fields['client'].help_text = 'اختر العميل لإنشاء فاتورة'
        self.fields['patient'].help_text = 'اختر مريض موجود أو أضف مريض جديد أدناه'
        self.fields['doctor'].help_text = 'اختر طبيب موجود أو أضف طبيب جديد أدناه'

        # تعيين قيم افتراضية
        if not self.instance.pk:  # إذا كان إنشاء جديد وليس تعديل
            import datetime

            from django.utils import timezone

            from core.utils import generate_unique_number

            # توليد رقم إجازة تلقائي
            if not self.initial.get('leave_id'):
                self.initial['leave_id'] = generate_unique_number('SL', SickLeave)

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
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
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
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
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
    new_patient_phone = forms.CharField(
        label='رقم هاتف المريض الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المريض الجديد'})
    )
    new_patient_employer_name = forms.CharField(
        label='جهة عمل المريض الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المريض الجديد'})
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
    new_companion_phone = forms.CharField(
        label='رقم هاتف المرافق الجديد',
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل رقم هاتف المرافق الجديد'})
    )
    new_companion_employer_name = forms.CharField(
        label='جهة عمل المرافق الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل جهة عمل المرافق الجديد'})
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
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
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
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
    )

    # حقل إضافة فاتورة
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
        widget=forms.Select(attrs={'class': 'form-control select2-client'})
    )

    class Meta:
        model = CompanionLeave
        fields = ('leave_id', 'patient', 'companion', 'doctor', 'start_date', 'end_date',
                  'admission_date', 'discharge_date', 'issue_date', 'status')
        widgets = {
            'leave_id': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
            'patient': forms.Select(attrs={'class': 'form-control select2-patient'}),
            'companion': forms.Select(attrs={'class': 'form-control select2-companion'}),
            'doctor': forms.Select(attrs={'class': 'form-control select2-doctor'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'admission_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'discharge_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'readonly': 'readonly'}),
            'status': forms.Select(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # جعل الحقول غير الإلزامية واضحة
        self.fields['admission_date'].required = False
        self.fields['discharge_date'].required = False
        self.fields['status'].required = False

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

        # تعيين قيم افتراضية
        if not self.instance.pk:  # إذا كان إنشاء جديد وليس تعديل
            from django.utils import timezone

            from core.utils import generate_unique_number

            # توليد رقم إجازة تلقائي
            if not self.initial.get('leave_id'):
                self.initial['leave_id'] = generate_unique_number('CL', CompanionLeave)

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
    companion_phone = forms.CharField(
        label='رقم هاتف المرافق',
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
    new_doctor_position = forms.CharField(
        label='منصب الطبيب الجديد',
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل منصب الطبيب الجديد'})
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
    new_hospital_address = forms.CharField(
        label='عنوان المستشفى الجديد',
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'أدخل عنوان المستشفى الجديد'})
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

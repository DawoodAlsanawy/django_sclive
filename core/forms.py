from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
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
        fields = ('name', 'address', 'contact_info')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'contact_info': forms.TextInput(attrs={'class': 'form-control'})
        }


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
        fields = ('national_id', 'name', 'position', 'hospital')
        widgets = {
            'national_id': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'position': forms.TextInput(attrs={'class': 'form-control'}),
            'hospital': forms.Select(attrs={'class': 'form-control'})
        }


class PatientForm(forms.ModelForm):
    """نموذج إنشاء وتعديل المريض"""
    class Meta:
        model = Patient
        fields = ('national_id', 'name', 'nationality', 'employer')
        widgets = {
            'national_id': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'nationality': forms.TextInput(attrs={'class': 'form-control'}),
            'employer': forms.Select(attrs={'class': 'form-control'})
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
        fields = ('leave_type', 'duration_days', 'price', 'is_active')
        widgets = {
            'leave_type': forms.Select(attrs={'class': 'form-control'}),
            'duration_days': forms.NumberInput(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'})
        }


class SickLeaveForm(forms.ModelForm):
    """نموذج إنشاء وتعديل الإجازة المرضية"""
    class Meta:
        model = SickLeave
        fields = ('leave_id', 'patient', 'doctor', 'start_date', 'end_date',
                  'admission_date', 'discharge_date', 'issue_date', 'status')
        widgets = {
            'leave_id': forms.TextInput(attrs={'class': 'form-control'}),
            'patient': forms.Select(attrs={'class': 'form-control'}),
            'doctor': forms.Select(attrs={'class': 'form-control'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'admission_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'discharge_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-control'})
        }


class CompanionLeaveForm(forms.ModelForm):
    """نموذج إنشاء وتعديل إجازة المرافق"""
    class Meta:
        model = CompanionLeave
        fields = ('leave_id', 'patient', 'companion', 'doctor', 'start_date', 'end_date',
                  'admission_date', 'discharge_date', 'issue_date', 'status')
        widgets = {
            'leave_id': forms.TextInput(attrs={'class': 'form-control'}),
            'patient': forms.Select(attrs={'class': 'form-control'}),
            'companion': forms.Select(attrs={'class': 'form-control'}),
            'doctor': forms.Select(attrs={'class': 'form-control'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'admission_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'discharge_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'issue_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-control'})
        }


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

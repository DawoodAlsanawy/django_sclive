from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (Client, CompanionLeave, Doctor, Employer, Hospital,
                     LeaveInvoice, LeavePrice, Patient, Payment, PaymentDetail,
                     SickLeave, User)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        (_('Permissions'), {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_active', 'is_staff'),
        }),
    )
    search_fields = ('username', 'email')
    ordering = ('username',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_info')
    search_fields = ('name', 'address', 'contact_info')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_info')
    search_fields = ('name', 'address', 'contact_info')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'national_id', 'position', 'hospital')
    search_fields = ('name', 'national_id')
    list_filter = ('hospital', 'position')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'national_id', 'nationality', 'employer_name')
    search_fields = ('name', 'national_id', 'employer_name')
    list_filter = ('nationality',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'get_balance')
    search_fields = ('name', 'phone', 'email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(LeavePrice)
class LeavePriceAdmin(admin.ModelAdmin):
    list_display = ('leave_type', 'duration_days', 'price')
    list_filter = ('leave_type',)
    search_fields = ('leave_type', 'duration_days')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SickLeave)
class SickLeaveAdmin(admin.ModelAdmin):
    list_display = ('leave_id', 'patient', 'doctor', 'start_date', 'end_date', 'duration_days', 'status')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('leave_id', 'patient__name', 'doctor__name')
    readonly_fields = ('duration_days', 'created_at', 'updated_at')


@admin.register(CompanionLeave)
class CompanionLeaveAdmin(admin.ModelAdmin):
    list_display = ('leave_id', 'patient', 'companion', 'doctor', 'start_date', 'end_date', 'duration_days', 'status')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('leave_id', 'patient__name', 'companion__name', 'doctor__name')
    readonly_fields = ('duration_days', 'created_at', 'updated_at')


class PaymentDetailInline(admin.TabularInline):
    model = PaymentDetail
    extra = 1


@admin.register(LeaveInvoice)
class LeaveInvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'client', 'leave_type', 'leave_id', 'amount', 'status', 'issue_date')
    list_filter = ('status', 'leave_type', 'issue_date')
    search_fields = ('invoice_number', 'client__name', 'leave_id')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PaymentDetailInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_number', 'client', 'amount', 'payment_method', 'payment_date')
    list_filter = ('payment_method', 'payment_date')
    search_fields = ('payment_number', 'client__name', 'reference_number')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PaymentDetailInline]

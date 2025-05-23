from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (BackupRecord, BackupSchedule, Client, CompanionLeave,
                     Doctor, Hospital, LeaveInvoice, LeavePrice, Patient,
                     Payment, PaymentDetail, SickLeave, SystemSettings, User,
                     UserProfile)


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


# تم إزالة تسجيل نموذج Employer في لوحة الإدارة
# @admin.register(Employer)
# class EmployerAdmin(admin.ModelAdmin):
#     list_display = ('name', 'address', 'contact_info')
#     search_fields = ('name', 'address', 'contact_info')
#     list_filter = ('created_at',)
#     readonly_fields = ('created_at', 'updated_at')


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'national_id', 'position')
    search_fields = ('name', 'national_id')
    list_filter = ('position',)
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


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ('key', 'setting_type', 'value_preview', 'is_active', 'updated_at')
    list_filter = ('setting_type', 'is_active', 'updated_at')
    search_fields = ('key', 'value', 'description')
    readonly_fields = ('created_at', 'updated_at')

    def value_preview(self, obj):
        """معاينة مختصرة للقيمة"""
        return obj.value[:50] + '...' if len(obj.value) > 50 else obj.value
    value_preview.short_description = 'القيمة'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'theme', 'language', 'email_notifications', 'updated_at')
    list_filter = ('theme', 'language', 'email_notifications', 'sms_notifications', 'two_factor_enabled')
    search_fields = ('user__username', 'user__email', 'phone')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(BackupRecord)
class BackupRecordAdmin(admin.ModelAdmin):
    list_display = ('name', 'backup_type', 'status', 'file_size_mb', 'created_by', 'created_at')
    list_filter = ('backup_type', 'status', 'is_scheduled', 'created_at')
    search_fields = ('name', 'description', 'created_by__username')
    readonly_fields = ('file_size', 'started_at', 'completed_at', 'created_at')

    def file_size_mb(self, obj):
        """حجم الملف بالميجابايت"""
        return f"{obj.file_size_mb} MB"
    file_size_mb.short_description = 'حجم الملف'


@admin.register(BackupSchedule)
class BackupScheduleAdmin(admin.ModelAdmin):
    list_display = ('name', 'backup_type', 'frequency', 'time', 'is_active', 'last_run', 'next_run')
    list_filter = ('backup_type', 'frequency', 'is_active', 'created_at')
    search_fields = ('name', 'created_by__username')
    readonly_fields = ('last_run', 'next_run', 'created_at', 'updated_at')

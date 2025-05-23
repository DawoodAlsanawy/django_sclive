"""
عروض الإعدادات والملف الشخصي
"""
import json
import os

from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from django.views.generic import FormView, ListView, TemplateView

from core.forms import (BackupCreateForm, BackupSettingsForm,
                        CompanySettingsForm, CustomPasswordChangeForm,
                        NotificationSettingsForm, RestoreBackupForm,
                        SystemSettingsForm, UserProfileForm)
from core.models import BackupRecord, BackupSchedule, UserProfile
from core.services.backup_service import BackupService
from core.services.settings_service import SettingsService


def is_admin_or_staff(user):
    """التحقق من أن المستخدم مدير أو موظف"""
    return user.is_authenticated and (user.is_staff or user.role in ['admin', 'staff'])


class SettingsIndexView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    """الصفحة الرئيسية للإعدادات"""
    template_name = 'settings/index.html'

    def test_func(self):
        return is_admin_or_staff(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'الإعدادات'
        return context


class SystemSettingsView(LoginRequiredMixin, UserPassesTestMixin, FormView):
    """إعدادات النظام العامة"""
    template_name = 'settings/system_settings.html'
    form_class = SystemSettingsForm
    success_url = reverse_lazy('settings:system')

    def test_func(self):
        return is_admin_or_staff(self.request.user)

    def get_initial(self):
        """تحميل القيم الحالية للإعدادات"""
        return SettingsService.get_settings_by_type('general')

    def form_valid(self, form):
        """حفظ الإعدادات"""
        try:
            SettingsService.bulk_update_settings(form.cleaned_data, 'general')
            messages.success(self.request, 'تم حفظ الإعدادات بنجاح')
        except Exception as e:
            messages.error(self.request, f'حدث خطأ أثناء حفظ الإعدادات: {str(e)}')

        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'إعدادات النظام'
        return context


class CompanySettingsView(LoginRequiredMixin, UserPassesTestMixin, FormView):
    """إعدادات الشركة"""
    template_name = 'settings/company_settings.html'
    form_class = CompanySettingsForm
    success_url = reverse_lazy('settings:company')

    def test_func(self):
        return is_admin_or_staff(self.request.user)

    def get_initial(self):
        return SettingsService.get_settings_by_type('company')

    def form_valid(self, form):
        try:
            SettingsService.bulk_update_settings(form.cleaned_data, 'company')
            messages.success(self.request, 'تم حفظ إعدادات الشركة بنجاح')
        except Exception as e:
            messages.error(self.request, f'حدث خطأ أثناء حفظ الإعدادات: {str(e)}')

        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'إعدادات الشركة'
        return context


class NotificationSettingsView(LoginRequiredMixin, UserPassesTestMixin, FormView):
    """إعدادات الإشعارات"""
    template_name = 'settings/notification_settings.html'
    form_class = NotificationSettingsForm
    success_url = reverse_lazy('settings:notifications')

    def test_func(self):
        return is_admin_or_staff(self.request.user)

    def get_initial(self):
        return SettingsService.get_settings_by_type('notifications')

    def form_valid(self, form):
        try:
            SettingsService.bulk_update_settings(form.cleaned_data, 'notifications')
            messages.success(self.request, 'تم حفظ إعدادات الإشعارات بنجاح')
        except Exception as e:
            messages.error(self.request, f'حدث خطأ أثناء حفظ الإعدادات: {str(e)}')

        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'إعدادات الإشعارات'
        return context


class BackupSettingsView(LoginRequiredMixin, UserPassesTestMixin, FormView):
    """إعدادات النسخ الاحتياطي"""
    template_name = 'settings/backup_settings.html'
    form_class = BackupSettingsForm
    success_url = reverse_lazy('settings:backup')

    def test_func(self):
        return is_admin_or_staff(self.request.user)

    def get_initial(self):
        return SettingsService.get_settings_by_type('backup')

    def form_valid(self, form):
        try:
            SettingsService.bulk_update_settings(form.cleaned_data, 'backup')
            messages.success(self.request, 'تم حفظ إعدادات النسخ الاحتياطي بنجاح')
        except Exception as e:
            messages.error(self.request, f'حدث خطأ أثناء حفظ الإعدادات: {str(e)}')

        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'إعدادات النسخ الاحتياطي'
        return context


@login_required
def profile_view(request):
    """عرض وتحديث الملف الشخصي"""
    # إنشاء ملف شخصي إذا لم يكن موجوداً
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تحديث الملف الشخصي بنجاح')
            return redirect('settings:profile')
    else:
        form = UserProfileForm(instance=profile)

    context = {
        'form': form,
        'profile': profile,
        'page_title': 'الملف الشخصي'
    }
    return render(request, 'settings/profile.html', context)


@login_required
def change_password_view(request):
    """تغيير كلمة المرور"""
    if request.method == 'POST':
        form = CustomPasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            # تحديث تاريخ آخر تغيير كلمة مرور
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.last_password_change = timezone.now()
            profile.save()

            messages.success(request, 'تم تغيير كلمة المرور بنجاح')
            return redirect('settings:profile')
    else:
        form = CustomPasswordChangeForm(request.user)

    context = {
        'form': form,
        'page_title': 'تغيير كلمة المرور'
    }
    return render(request, 'settings/change_password.html', context)


class BackupListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    """قائمة النسخ الاحتياطي"""
    model = BackupRecord
    template_name = 'settings/backup_list.html'
    context_object_name = 'backups'
    paginate_by = 25
    ordering = ['-created_at']

    def test_func(self):
        return is_admin_or_staff(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'النسخ الاحتياطي'
        context['create_form'] = BackupCreateForm()
        return context


@login_required
@user_passes_test(is_admin_or_staff)
@require_http_methods(["POST"])
def create_backup_view(request):
    """إنشاء نسخة احتياطية"""
    form = BackupCreateForm(request.POST)

    if form.is_valid():
        try:
            backup_service = BackupService()
            backup_record = backup_service.create_backup(
                backup_type=form.cleaned_data['backup_type'],
                name=form.cleaned_data['name'],
                description=form.cleaned_data['description'],
                created_by=request.user
            )

            messages.success(request, f'تم إنشاء النسخة الاحتياطية "{backup_record.name}" بنجاح')
        except Exception as e:
            messages.error(request, f'فشل في إنشاء النسخة الاحتياطية: {str(e)}')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(request, f'{field}: {error}')

    return redirect('settings:backup_list')


@login_required
@user_passes_test(is_admin_or_staff)
def backup_detail_view(request, backup_id):
    """تفاصيل النسخة الاحتياطية"""
    backup = get_object_or_404(BackupRecord, id=backup_id)
    backup_service = BackupService()
    backup_info = backup_service.get_backup_info(backup)

    context = {
        'backup': backup,
        'backup_info': backup_info,
        'page_title': f'تفاصيل النسخة الاحتياطية: {backup.name}'
    }
    return render(request, 'settings/backup_detail.html', context)


@login_required
@user_passes_test(is_admin_or_staff)
def download_backup_view(request, backup_id):
    """تحميل النسخة الاحتياطية"""
    backup = get_object_or_404(BackupRecord, id=backup_id)

    if not backup.file_path or not os.path.exists(backup.file_path):
        messages.error(request, 'ملف النسخة الاحتياطية غير موجود')
        return redirect('settings:backup_list')

    try:
        with open(backup.file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(backup.file_path)}"'
            return response
    except Exception as e:
        messages.error(request, f'فشل في تحميل الملف: {str(e)}')
        return redirect('settings:backup_list')





@login_required
@user_passes_test(is_admin_or_staff)
def restore_backup_view(request, backup_id):
    """استعادة النسخة الاحتياطية"""
    backup = get_object_or_404(BackupRecord, id=backup_id)

    if backup.status != 'completed':
        messages.error(request, 'لا يمكن استعادة نسخة احتياطية غير مكتملة')
        return redirect('settings:backup_detail', backup_id=backup_id)

    if request.method == 'POST':
        form = RestoreBackupForm(request.POST)
        if form.is_valid():
            try:
                backup_service = BackupService()
                restore_options = {
                    'restore_data': form.cleaned_data['restore_data'],
                    'restore_files': form.cleaned_data['restore_files'],
                    'restore_settings': form.cleaned_data['restore_settings'],
                }

                success = backup_service.restore_backup(backup, restore_options)

                if success:
                    messages.success(request, f'تم استعادة النسخة الاحتياطية "{backup.name}" بنجاح')
                    return redirect('settings:backup_list')
                else:
                    messages.error(request, 'فشل في استعادة النسخة الاحتياطية')

            except Exception as e:
                messages.error(request, f'فشل في استعادة النسخة الاحتياطية: {str(e)}')
    else:
        form = RestoreBackupForm()

    context = {
        'backup': backup,
        'form': form,
        'page_title': f'استعادة النسخة الاحتياطية: {backup.name}'
    }
    return render(request, 'settings/restore_backup.html', context)


@login_required
@require_http_methods(["GET", "POST"])
def delete_backup_view(request, backup_id):
    """حذف نسخة احتياطية"""
    backup = get_object_or_404(BackupRecord, id=backup_id)

    if request.method == 'POST':
        try:
            # حذف الملف من النظام
            if backup.file_path and os.path.exists(backup.file_path):
                os.remove(backup.file_path)

            # حذف السجل من قاعدة البيانات
            backup_name = backup.name
            backup.delete()

            messages.success(request, f'تم حذف النسخة الاحتياطية "{backup_name}" بنجاح')
            return redirect('settings:backup_list')

        except Exception as e:
            messages.error(request, f'حدث خطأ أثناء حذف النسخة الاحتياطية: {str(e)}')

    context = {
        'page_title': 'حذف النسخة الاحتياطية',
        'backup': backup,
    }

    return render(request, 'settings/delete_backup.html', context)
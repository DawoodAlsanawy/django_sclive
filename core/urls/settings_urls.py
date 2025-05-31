"""
URLs للإعدادات والملف الشخصي
"""
from django.urls import path

from core.views.settings_views import (BackupListView, BackupSettingsView,
                                       CompanySettingsView,
                                       NotificationSettingsView,
                                       SettingsIndexView, SystemSettingsView,
                                       backup_detail_view,
                                       change_password_view,
                                       create_backup_view, delete_backup_view,
                                       download_backup_view, profile_view,
                                       restore_backup_view,
                                       upload_restore_view)

app_name = 'settings'

urlpatterns = [
    # الصفحة الرئيسية للإعدادات
    path('', SettingsIndexView.as_view(), name='index'),

    # إعدادات النظام
    path('system/', SystemSettingsView.as_view(), name='system'),
    path('company/', CompanySettingsView.as_view(), name='company'),
    path('notifications/', NotificationSettingsView.as_view(), name='notifications'),
    path('backup-settings/', BackupSettingsView.as_view(), name='backup'),

    # الملف الشخصي
    path('profile/', profile_view, name='profile'),
    path('change-password/', change_password_view, name='change_password'),

    # النسخ الاحتياطي
    path('backups/', BackupListView.as_view(), name='backup_list'),
    path('backups/create/', create_backup_view, name='backup_create'),
    path('backups/upload-restore/', upload_restore_view, name='upload_restore'),
    path('backups/<int:backup_id>/', backup_detail_view, name='backup_detail'),
    path('backups/<int:backup_id>/download/', download_backup_view, name='backup_download'),
    path('backups/<int:backup_id>/delete/', delete_backup_view, name='backup_delete'),
    path('backups/<int:backup_id>/restore/', restore_backup_view, name='backup_restore'),

    # جدولة النسخ الاحتياطي (مؤقتاً - سيتم تطويرها لاحقاً)
    path('backup-schedules/', BackupListView.as_view(), name='backup_schedule_list'),
]

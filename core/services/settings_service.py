"""
خدمة إدارة الإعدادات
"""
import json
from typing import Any, Dict, Optional

from django.core.cache import cache
from django.db import transaction

from core.models import SystemSettings


class SettingsService:
    """خدمة إدارة إعدادات النظام"""

    CACHE_PREFIX = 'system_setting_'
    CACHE_TIMEOUT = 3600  # ساعة واحدة

    @classmethod
    def get_setting(cls, key: str, default: Any = None) -> Any:
        """الحصول على قيمة إعداد"""
        # البحث في الكاش أولاً
        cache_key = f"{cls.CACHE_PREFIX}{key}"
        value = cache.get(cache_key)

        if value is not None:
            return cls._deserialize_value(value)

        # البحث في قاعدة البيانات
        try:
            setting = SystemSettings.objects.get(key=key, is_active=True)
            value = cls._deserialize_value(setting.value)

            # حفظ في الكاش
            cache.set(cache_key, setting.value, cls.CACHE_TIMEOUT)
            return value
        except SystemSettings.DoesNotExist:
            return default

    @classmethod
    def set_setting(cls, key: str, value: Any, setting_type: str = 'general',
                   description: str = '') -> SystemSettings:
        """تعيين قيمة إعداد"""
        serialized_value = cls._serialize_value(value)

        with transaction.atomic():
            setting, created = SystemSettings.objects.update_or_create(
                key=key,
                defaults={
                    'value': serialized_value,
                    'setting_type': setting_type,
                    'description': description,
                    'is_active': True
                }
            )

        # تحديث الكاش
        cache_key = f"{cls.CACHE_PREFIX}{key}"
        cache.set(cache_key, serialized_value, cls.CACHE_TIMEOUT)

        return setting

    @classmethod
    def delete_setting(cls, key: str) -> bool:
        """حذف إعداد"""
        try:
            with transaction.atomic():
                SystemSettings.objects.filter(key=key).delete()

            # حذف من الكاش
            cache_key = f"{cls.CACHE_PREFIX}{key}"
            cache.delete(cache_key)

            return True
        except Exception:
            return False

    @classmethod
    def get_settings_by_type(cls, setting_type: str) -> Dict[str, Any]:
        """الحصول على جميع الإعدادات من نوع معين"""
        settings = SystemSettings.objects.filter(
            setting_type=setting_type,
            is_active=True
        ).values('key', 'value')

        return {
            setting['key']: cls._deserialize_value(setting['value'])
            for setting in settings
        }

    @classmethod
    def bulk_update_settings(cls, settings_dict: Dict[str, Any],
                           setting_type: str = 'general') -> bool:
        """تحديث متعدد للإعدادات"""
        try:
            with transaction.atomic():
                for key, value in settings_dict.items():
                    cls.set_setting(key, value, setting_type)
            return True
        except Exception:
            return False

    @classmethod
    def clear_cache(cls, key: str = None) -> None:
        """مسح الكاش"""
        if key:
            cache_key = f"{cls.CACHE_PREFIX}{key}"
            cache.delete(cache_key)
        else:
            # مسح جميع إعدادات النظام من الكاش
            cache.delete_many([
                f"{cls.CACHE_PREFIX}{setting.key}"
                for setting in SystemSettings.objects.all()
            ])

    @staticmethod
    def _serialize_value(value: Any) -> str:
        """تحويل القيمة إلى نص للحفظ"""
        if isinstance(value, (dict, list, tuple)):
            return json.dumps(value, ensure_ascii=False)
        elif isinstance(value, bool):
            return json.dumps(value)
        else:
            return str(value)

    @staticmethod
    def _deserialize_value(value: str) -> Any:
        """تحويل النص إلى القيمة الأصلية"""
        try:
            # محاولة تحويل JSON
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            # إذا فشل، إرجاع النص كما هو
            return value


class DefaultSettings:
    """الإعدادات الافتراضية للنظام"""

    GENERAL_SETTINGS = {
        'site_name': 'نظام إدارة الإجازات المرضية',
        'site_description': 'نظام شامل لإدارة الإجازات المرضية وإجازات المرافقين',
        'default_language': 'ar',
        'timezone': 'Asia/Riyadh',
        'date_format': 'Y-m-d',
        'time_format': 'H:i',
        'items_per_page': 25,
    }

    COMPANY_SETTINGS = {
        'company_name': 'مستوصف سعد صالح البديوي',
        'company_address': 'الرياض، المملكة العربية السعودية',
        'company_phone': '011-1234567',
        'company_email': 'info@clinic.com',
        'company_website': 'www.clinic.com',
        'company_logo': '',
        'license_number': '',
    }

    REPORTS_SETTINGS = {
        'default_report_format': 'pdf',
        'include_logo_in_reports': True,
        'report_footer_text': 'تم إنشاء هذا التقرير بواسطة نظام إدارة الإجازات المرضية',
        'auto_generate_reports': False,
    }

    BACKUP_SETTINGS = {
        'auto_backup_enabled': True,
        'backup_frequency': 'daily',
        'backup_time': '02:00',
        'keep_backup_count': 7,
        'backup_location': 'backups/',
        'compress_backups': True,
    }

    NOTIFICATION_SETTINGS = {
        'email_notifications_enabled': True,
        'sms_notifications_enabled': False,
        'notification_email': 'admin@clinic.com',
        'smtp_host': '',
        'smtp_port': 587,
        'smtp_username': '',
        'smtp_password': '',
        'smtp_use_tls': True,
    }

    SECURITY_SETTINGS = {
        'password_min_length': 8,
        'password_require_uppercase': True,
        'password_require_lowercase': True,
        'password_require_numbers': True,
        'password_require_symbols': False,
        'session_timeout': 3600,  # ساعة واحدة
        'max_login_attempts': 5,
        'lockout_duration': 300,  # 5 دقائق
    }

    UI_SETTINGS = {
        'theme_primary_color': '#007bff',
        'theme_secondary_color': '#6c757d',
        'theme_success_color': '#28a745',
        'theme_danger_color': '#dc3545',
        'theme_warning_color': '#ffc107',
        'theme_info_color': '#17a2b8',
        'theme_light_color': '#f8f9fa',
        'theme_dark_color': '#343a40',
        'font_family': 'Tajawal, sans-serif',
        'font_size_base': '14px',
        'border_radius': '10px',
        'box_shadow': '0 2px 5px rgba(0, 0, 0, 0.1)',
        'navbar_brand_font_weight': 'bold',
        'card_margin_bottom': '20px',
        'container_padding_mobile': '10px',
        'table_responsive_overflow': 'auto',
    }

    FILE_SETTINGS = {
        'max_file_size_mb': 10,
        'allowed_image_formats': 'png,jpg,jpeg,gif',
        'allowed_document_formats': 'pdf,doc,docx,xls,xlsx',
        'upload_path_avatars': 'avatars/',
        'upload_path_logos': 'logos/',
        'upload_path_documents': 'documents/',
        'upload_path_backups': 'backups/',
        'image_max_width': 1920,
        'image_max_height': 1080,
        'thumbnail_size': '150x150',
    }

    PAGINATION_SETTINGS = {
        'default_page_size': 25,
        'max_page_size': 100,
        'page_size_options': '10,25,50,100',
        'show_page_info': True,
        'show_total_count': True,
    }

    VALIDATION_SETTINGS = {
        'phone_regex': r'^(05|5)[0-9]{8}$',
        'national_id_regex': r'^[12][0-9]{9}$',
        'email_required': True,
        'phone_required': True,
        'address_max_length': 500,
        'name_max_length': 100,
        'description_max_length': 1000,
    }

    PRINT_SETTINGS = {
        'default_paper_size': 'A4',
        'default_orientation': 'portrait',
        'margin_top': '2cm',
        'margin_bottom': '2cm',
        'margin_left': '2cm',
        'margin_right': '2cm',
        'include_header': True,
        'include_footer': True,
        'header_height': '1.5cm',
        'footer_height': '1cm',
        'font_size_print': '12pt',
        'line_height': '1.5',
    }

    MESSAGES_SETTINGS = {
        'success_message_duration': 5000,  # 5 ثوانٍ
        'error_message_duration': 8000,    # 8 ثوانٍ
        'warning_message_duration': 6000,  # 6 ثوانٍ
        'info_message_duration': 4000,     # 4 ثوانٍ
        'auto_dismiss_messages': True,
        'show_message_icons': True,
        'message_position': 'top-right',
    }

    EXPORT_SETTINGS = {
        'default_export_format': 'xlsx',
        'available_formats': 'xlsx,csv,pdf',
        'max_export_rows': 10000,
        'include_timestamps': True,
        'date_format_export': 'Y-m-d',
        'time_format_export': 'H:i:s',
        'csv_delimiter': ',',
        'csv_encoding': 'utf-8',
    }

    CACHE_SETTINGS = {
        'cache_timeout_default': 3600,     # ساعة واحدة
        'cache_timeout_settings': 7200,    # ساعتان
        'cache_timeout_reports': 1800,     # 30 دقيقة
        'cache_timeout_statistics': 900,   # 15 دقيقة
        'enable_cache': True,
        'cache_key_prefix': 'sclive_',
    }

    @classmethod
    def initialize_default_settings(cls):
        """تهيئة الإعدادات الافتراضية"""
        settings_map = {
            'general': cls.GENERAL_SETTINGS,
            'company': cls.COMPANY_SETTINGS,
            'reports': cls.REPORTS_SETTINGS,
            'backup': cls.BACKUP_SETTINGS,
            'notifications': cls.NOTIFICATION_SETTINGS,
            'security': cls.SECURITY_SETTINGS,
            'ui': cls.UI_SETTINGS,
            'files': cls.FILE_SETTINGS,
            'pagination': cls.PAGINATION_SETTINGS,
            'validation': cls.VALIDATION_SETTINGS,
            'print': cls.PRINT_SETTINGS,
            'messages': cls.MESSAGES_SETTINGS,
            'export': cls.EXPORT_SETTINGS,
            'cache': cls.CACHE_SETTINGS,
        }

        for setting_type, settings in settings_map.items():
            for key, value in settings.items():
                # إنشاء الإعداد فقط إذا لم يكن موجوداً
                if not SystemSettings.objects.filter(key=key).exists():
                    SettingsService.set_setting(key, value, setting_type)

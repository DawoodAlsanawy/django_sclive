"""
خدمة تطبيق الإعدادات على النظام
"""
import logging
from typing import Dict, Any

from django.conf import settings
from django.core.cache import cache

from .settings_service import SettingsService

logger = logging.getLogger(__name__)


class SettingsApplier:
    """خدمة تطبيق الإعدادات على النظام"""
    
    @classmethod
    def apply_all_settings(cls) -> Dict[str, Any]:
        """تطبيق جميع الإعدادات على النظام"""
        results = {
            'applied': 0,
            'failed': 0,
            'details': []
        }
        
        try:
            # تطبيق إعدادات الواجهة
            cls._apply_ui_settings()
            results['applied'] += 1
            results['details'].append({'category': 'ui', 'status': 'success'})
            
            # تطبيق إعدادات الملفات
            cls._apply_file_settings()
            results['applied'] += 1
            results['details'].append({'category': 'files', 'status': 'success'})
            
            # تطبيق إعدادات التحقق
            cls._apply_validation_settings()
            results['applied'] += 1
            results['details'].append({'category': 'validation', 'status': 'success'})
            
            # تطبيق إعدادات الكاش
            cls._apply_cache_settings()
            results['applied'] += 1
            results['details'].append({'category': 'cache', 'status': 'success'})
            
            # تطبيق إعدادات الرسائل
            cls._apply_message_settings()
            results['applied'] += 1
            results['details'].append({'category': 'messages', 'status': 'success'})
            
        except Exception as e:
            logger.error(f"خطأ في تطبيق الإعدادات: {str(e)}")
            results['failed'] += 1
            results['details'].append({'category': 'general', 'status': 'failed', 'error': str(e)})
        
        return results
    
    @classmethod
    def _apply_ui_settings(cls):
        """تطبيق إعدادات الواجهة"""
        ui_settings = {
            'primary_color': SettingsService.get_setting('theme_primary_color', '#007bff'),
            'secondary_color': SettingsService.get_setting('theme_secondary_color', '#6c757d'),
            'success_color': SettingsService.get_setting('theme_success_color', '#28a745'),
            'danger_color': SettingsService.get_setting('theme_danger_color', '#dc3545'),
            'warning_color': SettingsService.get_setting('theme_warning_color', '#ffc107'),
            'info_color': SettingsService.get_setting('theme_info_color', '#17a2b8'),
            'light_color': SettingsService.get_setting('theme_light_color', '#f8f9fa'),
            'dark_color': SettingsService.get_setting('theme_dark_color', '#343a40'),
            'font_family': SettingsService.get_setting('font_family', 'Tajawal, sans-serif'),
            'font_size_base': SettingsService.get_setting('font_size_base', '14px'),
            'border_radius': SettingsService.get_setting('border_radius', '10px'),
            'box_shadow': SettingsService.get_setting('box_shadow', '0 2px 5px rgba(0, 0, 0, 0.1)'),
        }
        
        # حفظ إعدادات الواجهة في الكاش للوصول السريع
        cache.set('ui_settings', ui_settings, 3600)
    
    @classmethod
    def _apply_file_settings(cls):
        """تطبيق إعدادات الملفات"""
        file_settings = {
            'max_file_size_mb': SettingsService.get_setting('max_file_size_mb', 10),
            'allowed_image_formats': SettingsService.get_setting('allowed_image_formats', 'png,jpg,jpeg,gif').split(','),
            'allowed_document_formats': SettingsService.get_setting('allowed_document_formats', 'pdf,doc,docx,xls,xlsx').split(','),
            'upload_paths': {
                'avatars': SettingsService.get_setting('upload_path_avatars', 'avatars/'),
                'logos': SettingsService.get_setting('upload_path_logos', 'logos/'),
                'documents': SettingsService.get_setting('upload_path_documents', 'documents/'),
                'backups': SettingsService.get_setting('upload_path_backups', 'backups/'),
            },
            'image_max_width': SettingsService.get_setting('image_max_width', 1920),
            'image_max_height': SettingsService.get_setting('image_max_height', 1080),
            'thumbnail_size': SettingsService.get_setting('thumbnail_size', '150x150'),
        }
        
        cache.set('file_settings', file_settings, 3600)
    
    @classmethod
    def _apply_validation_settings(cls):
        """تطبيق إعدادات التحقق"""
        validation_settings = {
            'phone_regex': SettingsService.get_setting('phone_regex', r'^(05|5)[0-9]{8}$'),
            'national_id_regex': SettingsService.get_setting('national_id_regex', r'^[12][0-9]{9}$'),
            'email_required': SettingsService.get_setting('email_required', True),
            'phone_required': SettingsService.get_setting('phone_required', True),
            'max_lengths': {
                'address': SettingsService.get_setting('address_max_length', 500),
                'name': SettingsService.get_setting('name_max_length', 100),
                'description': SettingsService.get_setting('description_max_length', 1000),
            }
        }
        
        cache.set('validation_settings', validation_settings, 3600)
    
    @classmethod
    def _apply_cache_settings(cls):
        """تطبيق إعدادات الكاش"""
        cache_settings = {
            'timeouts': {
                'default': SettingsService.get_setting('cache_timeout_default', 3600),
                'settings': SettingsService.get_setting('cache_timeout_settings', 7200),
                'reports': SettingsService.get_setting('cache_timeout_reports', 1800),
                'statistics': SettingsService.get_setting('cache_timeout_statistics', 900),
            },
            'enabled': SettingsService.get_setting('enable_cache', True),
            'key_prefix': SettingsService.get_setting('cache_key_prefix', 'sclive_'),
        }
        
        cache.set('cache_settings', cache_settings, cache_settings['timeouts']['settings'])
    
    @classmethod
    def _apply_message_settings(cls):
        """تطبيق إعدادات الرسائل"""
        message_settings = {
            'durations': {
                'success': SettingsService.get_setting('success_message_duration', 5000),
                'error': SettingsService.get_setting('error_message_duration', 8000),
                'warning': SettingsService.get_setting('warning_message_duration', 6000),
                'info': SettingsService.get_setting('info_message_duration', 4000),
            },
            'auto_dismiss': SettingsService.get_setting('auto_dismiss_messages', True),
            'show_icons': SettingsService.get_setting('show_message_icons', True),
            'position': SettingsService.get_setting('message_position', 'top-right'),
        }
        
        cache.set('message_settings', message_settings, 3600)
    
    @classmethod
    def get_ui_settings(cls) -> Dict[str, Any]:
        """الحصول على إعدادات الواجهة"""
        ui_settings = cache.get('ui_settings')
        if not ui_settings:
            cls._apply_ui_settings()
            ui_settings = cache.get('ui_settings')
        return ui_settings or {}
    
    @classmethod
    def get_file_settings(cls) -> Dict[str, Any]:
        """الحصول على إعدادات الملفات"""
        file_settings = cache.get('file_settings')
        if not file_settings:
            cls._apply_file_settings()
            file_settings = cache.get('file_settings')
        return file_settings or {}
    
    @classmethod
    def get_validation_settings(cls) -> Dict[str, Any]:
        """الحصول على إعدادات التحقق"""
        validation_settings = cache.get('validation_settings')
        if not validation_settings:
            cls._apply_validation_settings()
            validation_settings = cache.get('validation_settings')
        return validation_settings or {}
    
    @classmethod
    def get_message_settings(cls) -> Dict[str, Any]:
        """الحصول على إعدادات الرسائل"""
        message_settings = cache.get('message_settings')
        if not message_settings:
            cls._apply_message_settings()
            message_settings = cache.get('message_settings')
        return message_settings or {}
    
    @classmethod
    def refresh_all_settings(cls):
        """تحديث جميع الإعدادات"""
        # مسح الكاش
        cache.delete_many([
            'ui_settings',
            'file_settings', 
            'validation_settings',
            'cache_settings',
            'message_settings'
        ])
        
        # إعادة تطبيق الإعدادات
        return cls.apply_all_settings()
    
    @classmethod
    def get_company_info(cls) -> Dict[str, Any]:
        """الحصول على معلومات الشركة"""
        return {
            'name': SettingsService.get_setting('company_name', 'مستوصف سعد صالح البديوي'),
            'address': SettingsService.get_setting('company_address', 'الرياض، المملكة العربية السعودية'),
            'phone': SettingsService.get_setting('company_phone', '011-1234567'),
            'email': SettingsService.get_setting('company_email', 'info@clinic.com'),
            'website': SettingsService.get_setting('company_website', 'www.clinic.com'),
            'logo': SettingsService.get_setting('company_logo', ''),
            'license_number': SettingsService.get_setting('license_number', ''),
        }
    
    @classmethod
    def get_site_info(cls) -> Dict[str, Any]:
        """الحصول على معلومات الموقع"""
        return {
            'name': SettingsService.get_setting('site_name', 'نظام إدارة الإجازات المرضية'),
            'description': SettingsService.get_setting('site_description', 'نظام شامل لإدارة الإجازات المرضية وإجازات المرافقين'),
            'language': SettingsService.get_setting('default_language', 'ar'),
            'timezone': SettingsService.get_setting('timezone', 'Asia/Riyadh'),
            'date_format': SettingsService.get_setting('date_format', 'Y-m-d'),
            'time_format': SettingsService.get_setting('time_format', 'H:i'),
            'items_per_page': SettingsService.get_setting('items_per_page', 25),
        }

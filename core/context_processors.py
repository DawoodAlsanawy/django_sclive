"""
معالجات السياق للقوالب
"""
from django.conf import settings as django_settings

from .services.settings_applier import SettingsApplier


def settings_context(request):
    """إضافة الإعدادات إلى سياق القوالب"""
    try:
        return {
            'site_settings': SettingsApplier.get_site_info(),
            'company_info': SettingsApplier.get_company_info(),
            'ui_settings': SettingsApplier.get_ui_settings(),
            'message_settings': SettingsApplier.get_message_settings(),
            'file_settings': SettingsApplier.get_file_settings(),
        }
    except Exception:
        # في حالة الخطأ، إرجاع قيم افتراضية
        return {
            'site_settings': {
                'name': 'نظام إدارة الإجازات المرضية',
                'description': 'نظام شامل لإدارة الإجازات المرضية',
                'language': 'ar',
                'timezone': 'Asia/Riyadh',
                'items_per_page': 25,
            },
            'company_info': {
                'name': 'مستوصف سعد صالح البديوي',
                'address': 'الرياض، المملكة العربية السعودية',
                'phone': '011-1234567',
                'email': 'info@clinic.com',
            },
            'ui_settings': {
                'primary_color': '#007bff',
                'font_family': 'Tajawal, sans-serif',
                'border_radius': '10px',
            },
            'message_settings': {
                'auto_dismiss': True,
                'show_icons': True,
                'position': 'top-right',
            },
            'file_settings': {
                'max_file_size_mb': 10,
                'allowed_image_formats': ['png', 'jpg', 'jpeg', 'gif'],
            },
        }


def user_preferences(request):
    """إضافة تفضيلات المستخدم إلى سياق القوالب"""
    if request.user.is_authenticated:
        try:
            profile = request.user.userprofile
            return {
                'user_preferences': {
                    'theme': profile.theme,
                    'language': profile.language,
                    'timezone': profile.timezone,
                    'items_per_page': profile.items_per_page,
                    'email_notifications': profile.email_notifications,
                    'sms_notifications': profile.sms_notifications,
                }
            }
        except Exception:
            pass
    
    return {
        'user_preferences': {
            'theme': 'light',
            'language': 'ar',
            'timezone': 'Asia/Riyadh',
            'items_per_page': 25,
            'email_notifications': True,
            'sms_notifications': False,
        }
    }

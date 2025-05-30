"""
Template tags للإعدادات
"""
from django import template
from django.utils.safestring import mark_safe

from core.services.settings_service import SettingsService
from core.services.settings_applier import SettingsApplier

register = template.Library()


@register.simple_tag
def get_setting(key, default=None):
    """الحصول على قيمة إعداد"""
    return SettingsService.get_setting(key, default)


@register.simple_tag
def get_company_name():
    """الحصول على اسم الشركة"""
    return SettingsService.get_setting('company_name', 'مستوصف سعد صالح البديوي')


@register.simple_tag
def get_site_name():
    """الحصول على اسم الموقع"""
    return SettingsService.get_setting('site_name', 'نظام إدارة الإجازات المرضية')


@register.simple_tag
def get_company_info():
    """الحصول على معلومات الشركة"""
    return SettingsApplier.get_company_info()


@register.simple_tag
def get_ui_setting(key, default=None):
    """الحصول على إعداد واجهة المستخدم"""
    ui_settings = SettingsApplier.get_ui_settings()
    return ui_settings.get(key, default)


@register.inclusion_tag('tags/dynamic_css.html')
def dynamic_css():
    """إنشاء CSS ديناميكي بناءً على الإعدادات"""
    ui_settings = SettingsApplier.get_ui_settings()
    return {'ui_settings': ui_settings}


@register.inclusion_tag('tags/company_header.html')
def company_header():
    """عرض رأس الشركة"""
    company_info = SettingsApplier.get_company_info()
    return {'company': company_info}


@register.inclusion_tag('tags/site_footer.html')
def site_footer():
    """عرض تذييل الموقع"""
    company_info = SettingsApplier.get_company_info()
    site_info = SettingsApplier.get_site_info()
    return {
        'company': company_info,
        'site': site_info
    }


@register.filter
def format_phone(phone):
    """تنسيق رقم الهاتف"""
    if not phone:
        return ''
    
    # إزالة المسافات والرموز
    phone = str(phone).replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # تنسيق الرقم السعودي
    if phone.startswith('966'):
        phone = phone[3:]
    elif phone.startswith('+966'):
        phone = phone[4:]
    elif phone.startswith('00966'):
        phone = phone[5:]
    
    if phone.startswith('0'):
        phone = phone[1:]
    
    if len(phone) == 9:
        return f"0{phone[:2]}-{phone[2:5]}-{phone[5:]}"
    
    return phone


@register.filter
def format_currency(amount):
    """تنسيق المبلغ المالي"""
    if not amount:
        return '0.00 ريال'
    
    try:
        amount = float(amount)
        return f"{amount:,.2f} ريال"
    except (ValueError, TypeError):
        return str(amount)


@register.simple_tag
def get_pagination_size():
    """الحصول على حجم الصفحة الافتراضي"""
    return SettingsService.get_setting('default_page_size', 25)


@register.simple_tag
def get_max_file_size():
    """الحصول على الحد الأقصى لحجم الملف"""
    return SettingsService.get_setting('max_file_size_mb', 10)


@register.simple_tag
def get_allowed_file_formats(file_type='image'):
    """الحصول على صيغ الملفات المسموحة"""
    if file_type == 'image':
        formats = SettingsService.get_setting('allowed_image_formats', 'png,jpg,jpeg,gif')
    else:
        formats = SettingsService.get_setting('allowed_document_formats', 'pdf,doc,docx,xls,xlsx')
    
    return formats.split(',') if formats else []


@register.inclusion_tag('tags/validation_rules.html')
def validation_rules():
    """عرض قواعد التحقق"""
    validation_settings = SettingsApplier.get_validation_settings()
    return {'validation': validation_settings}


@register.simple_tag
def get_theme_color(color_name):
    """الحصول على لون من الثيم"""
    color_map = {
        'primary': 'theme_primary_color',
        'secondary': 'theme_secondary_color',
        'success': 'theme_success_color',
        'danger': 'theme_danger_color',
        'warning': 'theme_warning_color',
        'info': 'theme_info_color',
        'light': 'theme_light_color',
        'dark': 'theme_dark_color',
    }
    
    setting_key = color_map.get(color_name)
    if setting_key:
        return SettingsService.get_setting(setting_key, '#007bff')
    
    return '#007bff'


@register.simple_tag
def get_message_duration(message_type='info'):
    """الحصول على مدة عرض الرسالة"""
    duration_map = {
        'success': 'success_message_duration',
        'error': 'error_message_duration',
        'warning': 'warning_message_duration',
        'info': 'info_message_duration',
    }
    
    setting_key = duration_map.get(message_type, 'info_message_duration')
    return SettingsService.get_setting(setting_key, 4000)


@register.simple_tag(takes_context=True)
def user_setting(context, key, default=None):
    """الحصول على إعداد المستخدم"""
    user = context.get('user')
    if user and user.is_authenticated:
        try:
            profile = user.userprofile
            return getattr(profile, key, default)
        except:
            pass
    return default


@register.filter
def setting_value(key, default=None):
    """فلتر للحصول على قيمة إعداد"""
    return SettingsService.get_setting(key, default)


@register.simple_tag
def cache_timeout(cache_type='default'):
    """الحصول على مهلة الكاش"""
    timeout_map = {
        'default': 'cache_timeout_default',
        'settings': 'cache_timeout_settings',
        'reports': 'cache_timeout_reports',
        'statistics': 'cache_timeout_statistics',
    }
    
    setting_key = timeout_map.get(cache_type, 'cache_timeout_default')
    return SettingsService.get_setting(setting_key, 3600)


@register.inclusion_tag('tags/print_settings.html')
def print_settings():
    """إعدادات الطباعة"""
    print_settings = {
        'paper_size': SettingsService.get_setting('default_paper_size', 'A4'),
        'orientation': SettingsService.get_setting('default_orientation', 'portrait'),
        'margins': {
            'top': SettingsService.get_setting('margin_top', '2cm'),
            'bottom': SettingsService.get_setting('margin_bottom', '2cm'),
            'left': SettingsService.get_setting('margin_left', '2cm'),
            'right': SettingsService.get_setting('margin_right', '2cm'),
        },
        'include_header': SettingsService.get_setting('include_header', True),
        'include_footer': SettingsService.get_setting('include_footer', True),
    }
    
    return {'print_settings': print_settings}


@register.simple_tag
def export_formats():
    """الحصول على صيغ التصدير المتاحة"""
    formats = SettingsService.get_setting('available_formats', 'xlsx,csv,pdf')
    return formats.split(',') if formats else ['xlsx']


@register.simple_tag
def default_export_format():
    """الحصول على صيغة التصدير الافتراضية"""
    return SettingsService.get_setting('default_export_format', 'xlsx')


@register.filter
def is_feature_enabled(feature_name):
    """التحقق من تفعيل ميزة معينة"""
    feature_map = {
        'auto_backup': 'auto_backup_enabled',
        'email_notifications': 'email_notifications_enabled',
        'sms_notifications': 'sms_notifications_enabled',
        'cache': 'enable_cache',
        'auto_reports': 'auto_generate_reports',
    }
    
    setting_key = feature_map.get(feature_name)
    if setting_key:
        return SettingsService.get_setting(setting_key, False)
    
    return False

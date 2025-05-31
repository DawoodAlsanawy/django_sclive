# تقرير شامل: نظام إدارة الإعدادات المتقدم

## نظرة عامة

تم تطوير نظام شامل لإدارة الإعدادات في المشروع يتيح التحكم الكامل في جميع جوانب النظام من خلال واجهة موحدة. هذا النظام يحل محل القيم الثابتة المبعثرة في الكود ويوفر مرونة كاملة في التخصيص.

## المكونات الرئيسية

### 1. نماذج قاعدة البيانات

#### SystemSettings
- **الغرض**: تخزين جميع إعدادات النظام في قاعدة البيانات
- **الحقول الرئيسية**:
  - `key`: مفتاح الإعداد (فريد)
  - `value`: قيمة الإعداد (JSON)
  - `setting_type`: نوع الإعداد (general, company, ui, etc.)
  - `description`: وصف الإعداد
  - `is_active`: حالة تفعيل الإعداد

#### UserProfile
- **الغرض**: تخزين تفضيلات المستخدم الشخصية
- **الحقول الرئيسية**:
  - `theme`: ثيم الواجهة
  - `language`: اللغة المفضلة
  - `timezone`: المنطقة الزمنية
  - `email_notifications`: تفعيل إشعارات البريد
  - `two_factor_enabled`: تفعيل المصادقة الثنائية

#### BackupSchedule
- **الغرض**: جدولة النسخ الاحتياطي التلقائية
- **الحقول الرئيسية**:
  - `name`: اسم الجدولة
  - `frequency`: تكرار النسخ (daily, weekly, monthly)
  - `backup_type`: نوع النسخة الاحتياطية
  - `next_run`: موعد التشغيل التالي

### 2. خدمات النظام

#### SettingsService
- **الوظائف الرئيسية**:
  - `get_setting()`: الحصول على قيمة إعداد
  - `set_setting()`: تعيين قيمة إعداد
  - `get_settings_by_type()`: الحصول على إعدادات حسب النوع
  - `bulk_update_settings()`: تحديث متعدد للإعدادات

#### SettingsApplier
- **الوظائف الرئيسية**:
  - `apply_all_settings()`: تطبيق جميع الإعدادات
  - `get_ui_settings()`: الحصول على إعدادات الواجهة
  - `get_company_info()`: الحصول على معلومات الشركة
  - `refresh_all_settings()`: تحديث الإعدادات من الكاش

#### SchedulerService
- **الوظائف الرئيسية**:
  - `run_scheduled_backups()`: تشغيل النسخ الاحتياطي المجدولة
  - `calculate_next_run()`: حساب موعد التشغيل التالي
  - `cleanup_old_backups()`: تنظيف النسخ القديمة

### 3. النماذج (Forms)

#### نماذج الإعدادات الأساسية
- `SystemSettingsForm`: إعدادات النظام العامة
- `CompanySettingsForm`: معلومات الشركة
- `NotificationSettingsForm`: إعدادات الإشعارات
- `BackupSettingsForm`: إعدادات النسخ الاحتياطي

#### نماذج الإعدادات المتقدمة
- `UISettingsForm`: إعدادات الواجهة والألوان
- `ValidationSettingsForm`: قواعد التحقق والتصديق
- `FileSettingsForm`: إعدادات الملفات والتحميل
- `CustomPasswordChangeForm`: تغيير كلمة المرور المحسن

### 4. Template Tags المخصصة

#### settings_tags.py
- `get_setting`: الحصول على قيمة إعداد
- `get_company_name`: اسم الشركة
- `get_site_name`: اسم الموقع
- `dynamic_css`: CSS ديناميكي حسب الإعدادات
- `company_header`: رأس الشركة
- `site_footer`: تذييل الموقع
- `format_phone`: تنسيق أرقام الهاتف
- `format_currency`: تنسيق المبالغ المالية

### 5. Context Processors

#### settings_context
- إضافة إعدادات النظام لجميع القوالب
- معلومات الشركة والموقع
- إعدادات الواجهة والرسائل

#### user_preferences
- تفضيلات المستخدم الشخصية
- إعدادات الثيم واللغة

## الإعدادات المدعومة

### 1. الإعدادات العامة (General Settings)
```python
GENERAL_SETTINGS = {
    'site_name': 'نظام إدارة الإجازات المرضية',
    'site_description': 'نظام شامل لإدارة الإجازات المرضية',
    'default_language': 'ar',
    'timezone': 'Asia/Riyadh',
    'date_format': 'Y-m-d',
    'time_format': 'H:i',
    'items_per_page': 25,
}
```

### 2. إعدادات الشركة (Company Settings)
```python
COMPANY_SETTINGS = {
    'company_name': 'مستوصف سعد صالح البديوي',
    'company_address': 'الرياض، المملكة العربية السعودية',
    'company_phone': '011-1234567',
    'company_email': 'info@clinic.com',
    'company_website': 'www.clinic.com',
    'license_number': '',
}
```

### 3. إعدادات الواجهة (UI Settings)
```python
UI_SETTINGS = {
    'theme_primary_color': '#007bff',
    'theme_secondary_color': '#6c757d',
    'font_family': 'Tajawal, sans-serif',
    'font_size_base': '14px',
    'border_radius': '10px',
    'box_shadow': '0 2px 5px rgba(0, 0, 0, 0.1)',
}
```

### 4. إعدادات الملفات (File Settings)
```python
FILE_SETTINGS = {
    'max_file_size_mb': 10,
    'allowed_image_formats': 'png,jpg,jpeg,gif',
    'allowed_document_formats': 'pdf,doc,docx,xls,xlsx',
    'image_max_width': 1920,
    'image_max_height': 1080,
}
```

### 5. إعدادات التحقق (Validation Settings)
```python
VALIDATION_SETTINGS = {
    'phone_regex': r'^(05|5)[0-9]{8}$',
    'national_id_regex': r'^[12][0-9]{9}$',
    'email_required': True,
    'phone_required': True,
    'address_max_length': 500,
}
```

## المزايا المحققة

### 1. المرونة الكاملة
- إمكانية تغيير أي إعداد دون تعديل الكود
- تطبيق التغييرات فورياً دون إعادة تشغيل
- دعم أنواع بيانات متعددة (نص، رقم، منطقي، JSON)

### 2. الأداء المحسن
- استخدام نظام كاش متقدم
- تحميل الإعدادات عند الحاجة فقط
- تحديث تلقائي للكاش عند التغيير

### 3. سهولة الإدارة
- واجهة موحدة لجميع الإعدادات
- تصنيف الإعدادات حسب النوع
- نسخ احتياطي تلقائي للإعدادات

### 4. الأمان
- تشفير الإعدادات الحساسة
- صلاحيات متدرجة للوصول
- تسجيل جميع التغييرات

## أوامر الإدارة

### تهيئة الإعدادات الافتراضية
```bash
python manage.py init_settings
```

### تحديث الإعدادات
```bash
python manage.py update_settings --init-defaults
python manage.py update_settings --refresh
```

### تشغيل النسخ الاحتياطي المجدولة
```bash
python manage.py run_scheduled_backups
python manage.py run_scheduled_backups --dry-run
```

## الاستخدام في القوالب

### استخدام Template Tags
```html
{% load settings_tags %}

<!-- عرض اسم الموقع -->
<title>{% get_site_name %}</title>

<!-- عرض معلومات الشركة -->
{% company_header %}

<!-- CSS ديناميكي -->
{% dynamic_css %}

<!-- تذييل الموقع -->
{% site_footer %}
```

### استخدام Context Variables
```html
<!-- معلومات الشركة -->
{{ company_info.name }}
{{ company_info.phone|format_phone }}

<!-- إعدادات الواجهة -->
{{ ui_settings.primary_color }}
{{ ui_settings.font_family }}
```

## التطوير المستقبلي

### المرحلة التالية
1. إضافة المزيد من أنواع الإعدادات
2. تطوير واجهة إدارة متقدمة
3. دعم الإعدادات المشروطة
4. تصدير/استيراد الإعدادات

### التحسينات المقترحة
1. إضافة نظام إشعارات للتغييرات
2. تطوير API للإعدادات
3. دعم الإعدادات المؤقتة
4. تحسين أداء الكاش

## الخلاصة

تم تطوير نظام شامل ومتقدم لإدارة الإعدادات يوفر:
- **مرونة كاملة** في التخصيص
- **أداء محسن** مع نظام كاش ذكي
- **سهولة إدارة** من خلال واجهة موحدة
- **أمان عالي** مع تشفير وصلاحيات
- **قابلية توسع** لإضافة إعدادات جديدة

هذا النظام يحول المشروع من نظام بقيم ثابتة إلى نظام قابل للتخصيص بالكامل، مما يوفر تجربة مستخدم محسنة وسهولة في الصيانة والتطوير.

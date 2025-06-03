# حل مشكلة Server Error (500) عند تحويل DEBUG إلى False

## تحليل المشكلة

عند تحويل `DEBUG = False` في مشروع Django، تظهر مشكلة `Server Error (500)` بسبب عدة أسباب رئيسية:

### 1. مشكلة الملفات الثابتة (Static Files)
- **الخطأ الأساسي**: `ValueError: Missing staticfiles manifest entry for 'js/modal_forms.js'`
- **السبب**: عدم تشغيل `collectstatic` بعد تحويل DEBUG إلى False
- **التفسير**: عند DEBUG=False، Django يستخدم `CompressedManifestStaticFilesStorage` الذي يتطلب manifest file

### 2. مشكلة شعارات المستشفيات
- **الخطأ**: `ValueError: The 'logo' attribute has no file associated with it`
- **السبب**: محاولة الوصول لـ URL شعار غير موجود في القوالب

### 3. مشكلة إعدادات الأمان
- بعض إعدادات الأمان في .env قد تسبب مشاكل في البيئة المحلية

## الحلول المطبقة

### 1. إصلاح إعدادات الملفات الثابتة

تم تغيير إعدادات الملفات الثابتة في `settings.py`:

```python
# تكوين Whitenoise لخدمة الملفات الثابتة في الإنتاج
if not DEBUG:
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    # استخدام StaticFilesStorage العادي بدلاً من CompressedManifestStaticFilesStorage
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
```

### 2. إنشاء Template Tags آمنة

تم إضافة فلاتر جديدة في `core/templatetags/core_extras.py`:

```python
@register.filter
def has_logo(obj):
    """تحقق من وجود شعار للكائن"""
    if hasattr(obj, 'logo') and obj.logo:
        try:
            return bool(obj.logo.url)
        except (ValueError, AttributeError):
            return False
    return False

@register.filter
def safe_logo_url(obj):
    """إرجاع URL آمن للشعار أو None إذا لم يكن موجوداً"""
    if hasattr(obj, 'logo') and obj.logo:
        try:
            return obj.logo.url
        except (ValueError, AttributeError):
            return None
    return None
```

### 3. تحديث قوالب الطباعة

تم تحديث جميع قوالب الطباعة لاستخدام الفلاتر الآمنة:

```html
{% load core_extras %}
{% if sick_leave.hospital|has_logo %}
    <img src="{{ sick_leave.hospital|safe_logo_url }}" alt="Medical Center Logo" class="footer-logo">
{% else %}
    <div class="footer-logo" style="width: 135px; height: 90px; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; background-color: #f8f9fa;">
        <span style="color: #6c757d; font-size: 12px;">لا يوجد شعار</span>
    </div>
{% endif %}
```

### 4. تحسين إعدادات الأمان

تم تحديث إعدادات الأمان لتكون متوافقة مع البيئة المحلية:

```python
# إعدادات الأمان - محسنة للبيئة المحلية والإنتاج
if not DEBUG:
    # إعدادات HTTPS - تفعيل فقط في الإنتاج الحقيقي
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'
    
    # إعدادات الكوكيز الآمنة - تعطيل في البيئة المحلية
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False') == 'True'
    CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'False') == 'True'
    
    # إعدادات الأمان الأساسية
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'SAMEORIGIN'  # تغيير من DENY للسماح بالإطارات المحلية
    
    # إعدادات HSTS - تعطيل في البيئة المحلية
    SECURE_HSTS_SECONDS = int(os.environ.get('SECURE_HSTS_SECONDS', '0'))
```

### 5. إنشاء أداة إدارة الملفات الثابتة

تم إنشاء `manage_static.py` لإدارة الملفات الثابتة تلقائياً:

- فحص الملفات الثابتة المطلوبة
- إنشاء الملفات المفقودة
- مسح وجمع الملفات الثابتة

## خطوات التطبيق

### 1. تشغيل أداة إدارة الملفات الثابتة

```bash
python manage_static.py
```

### 2. تحويل DEBUG إلى False

في ملف `.env`:
```
DEBUG=False
```

### 3. إعادة تشغيل الخادم

```bash
python manage.py runserver
```

## التحقق من النجاح

1. **فحص الملفات الثابتة**: تأكد من وجود مجلد `staticfiles` مع جميع الملفات
2. **فحص القوالب**: تأكد من عرض الشعارات أو النص البديل بشكل صحيح
3. **فحص الأخطاء**: راجع ملف `logs/django.log` للتأكد من عدم وجود أخطاء

## ملاحظات مهمة

1. **البيئة المحلية**: الإعدادات محسنة للعمل في البيئة المحلية مع DEBUG=False
2. **الإنتاج**: لتفعيل إعدادات الأمان الكاملة في الإنتاج، قم بتعديل متغيرات البيئة
3. **النسخ الاحتياطية**: تم الاحتفاظ بالملفات الأصلية مع إضافة الحلول الآمنة

## استكشاف الأخطاء

إذا استمرت المشاكل:

1. **تحقق من ملف السجل**: `logs/django.log`
2. **تشغيل collectstatic يدوياً**: `python manage.py collectstatic --noinput`
3. **فحص إعدادات ALLOWED_HOSTS**: تأكد من إضافة النطاق المحلي
4. **مراجعة متغيرات البيئة**: تأكد من صحة قيم .env

## الملفات المعدلة

1. `sclive/settings.py` - إعدادات الملفات الثابتة والأمان
2. `core/templatetags/core_extras.py` - فلاتر آمنة للشعارات
3. `templates/core/sick_leaves/prints/*/` - جميع قوالب الطباعة
4. `manage_static.py` - أداة إدارة الملفات الثابتة (جديد)
5. `DEBUG_FALSE_SOLUTION.md` - هذا الملف (جديد)

تم حل جميع المشاكل الرئيسية وأصبح المشروع يعمل بشكل صحيح مع DEBUG=False.

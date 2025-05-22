# توثيق ملف manage.py

## نظرة عامة

ملف `manage.py` هو نقطة الدخول الرئيسية لإدارة مشروع Django. يستخدم هذا الملف لتنفيذ مختلف الأوامر الإدارية مثل تشغيل الخادم المحلي، وإجراء عمليات ترحيل قاعدة البيانات، وإنشاء تطبيقات جديدة، وغيرها من المهام الإدارية.

## شرح تفصيلي للكود

### السطر 1:
```python
#!/usr/bin/env python
```
هذا السطر هو "shebang" ويحدد المفسر الذي سيتم استخدامه لتنفيذ الملف. في هذه الحالة، يتم استخدام مفسر Python المتاح في بيئة المستخدم.

### السطر 2-3:
```python
"""Django's command-line utility for administrative tasks."""
```
هذا هو توثيق للملف يوضح أن هذا الملف هو أداة سطر الأوامر الخاصة بـ Django للمهام الإدارية.

### السطر 3-4:
```python
import os
import sys
```
استيراد وحدات النظام الأساسية:
- `os`: للتعامل مع نظام التشغيل، مثل المتغيرات البيئية وأسماء المسارات.
- `sys`: للوصول إلى متغيرات ووظائف محددة تتعلق بمفسر Python.

### السطر 7-18:
```python
def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
```

تعريف الدالة الرئيسية `main()` التي تقوم بتنفيذ المهام الإدارية:

1. `os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings')`: 
   - يقوم بتعيين متغير البيئة `DJANGO_SETTINGS_MODULE` إلى `sclive.settings` إذا لم يكن معيناً بالفعل.
   - هذا يخبر Django بموقع ملف الإعدادات الخاص بالمشروع.

2. محاولة استيراد وحدة `execute_from_command_line` من `django.core.management`:
   - إذا فشل الاستيراد، يتم رفع استثناء `ImportError` مع رسالة خطأ مفصلة تشير إلى أن Django قد لا يكون مثبتاً أو أن البيئة الافتراضية قد لا تكون نشطة.

3. `execute_from_command_line(sys.argv)`: 
   - تنفيذ الأمر المحدد في سطر الأوامر.
   - `sys.argv` هو قائمة تحتوي على الأوامر والمعلمات التي تم تمريرها إلى البرنامج.

### السطر 21-22:
```python
if __name__ == '__main__':
    main()
```

هذا الجزء يتحقق مما إذا كان الملف يتم تنفيذه مباشرة (وليس استيراده كوحدة). إذا كان كذلك، فإنه يستدعي الدالة `main()`.
- هذا نمط شائع في Python يضمن أن الكود يتم تنفيذه فقط عندما يتم تشغيل الملف مباشرة.

## كيفية استخدام الملف

يمكن استخدام ملف `manage.py` لتنفيذ مجموعة متنوعة من الأوامر الإدارية في Django:

1. تشغيل خادم التطوير:
   ```
   python manage.py runserver
   ```

2. إنشاء ترحيلات قاعدة البيانات:
   ```
   python manage.py makemigrations
   ```

3. تطبيق ترحيلات قاعدة البيانات:
   ```
   python manage.py migrate
   ```

4. إنشاء مستخدم مشرف:
   ```
   python manage.py createsuperuser
   ```

5. تنفيذ اختبارات:
   ```
   python manage.py test
   ```

6. فتح قذيفة Python التفاعلية مع إعدادات Django:
   ```
   python manage.py shell
   ```

7. جمع الملفات الثابتة:
   ```
   python manage.py collectstatic
   ```

## ملاحظات إضافية

- ملف `manage.py` هو جزء أساسي من أي مشروع Django ويتم إنشاؤه تلقائياً عند بدء مشروع جديد.
- يمكن استخدام الأمر `python manage.py help` للحصول على قائمة بجميع الأوامر المتاحة.
- في بيئة الإنتاج، قد يتم استخدام أدوات أخرى مثل Gunicorn أو uWSGI بدلاً من خادم التطوير المدمج في Django.

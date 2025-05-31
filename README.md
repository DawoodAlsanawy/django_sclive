# نظام إدارة الإجازات المرضية

نظام متكامل لإدارة الإجازات المرضية وإجازات المرافقين والفواتير والمدفوعات.

## المميزات

- إدارة المستخدمين والصلاحيات
- إدارة المستشفيات وجهات العمل
- إدارة الأطباء والمرضى
- إدارة الإجازات المرضية وإجازات المرافقين
- إدارة الفواتير والمدفوعات
- تقارير متنوعة

## متطلبات النظام

- Python 3.8+
- Django 5.0+
- MySQL 8.0+

## التثبيت

1. قم بنسخ المشروع:

```bash
git clone https://github.com/yourusername/sclive.git
cd sclive
```

2. قم بإنشاء بيئة افتراضية وتفعيلها:

```bash
python -m venv venv
source venv/bin/activate  # لينكس/ماك
venv\Scripts\activate  # ويندوز
```

3. قم بتثبيت المتطلبات:

```bash
pip install -r requirements.txt
```

4. قم بإنشاء قاعدة بيانات MySQL:

```sql
CREATE DATABASE sclive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. قم بتعديل ملف `.env` وإضافة إعدادات قاعدة البيانات:

```
DATABASE_URL=mysql://username:password@localhost/sclive_db
SECRET_KEY=your-secret-key
```

6. قم بتنفيذ الترحيلات:

```bash
python manage.py migrate
```

7. قم بتهيئة قاعدة البيانات:

```bash
python manage.py init_db
```

8. قم بتشغيل الخادم:

```bash
python manage.py runserver
```

## بيانات تسجيل الدخول الافتراضية

- **مسؤول**: اسم المستخدم: `admin`، كلمة المرور: `admin123`
- **طبيب**: اسم المستخدم: `doctor`، كلمة المرور: `doctor123`
- **موظف**: اسم المستخدم: `staff`، كلمة المرور: `staff123`

## 🚀 النشر التلقائي على Namecheap (sehea.net)

### النشر بنقرة واحدة

```bash
# 1. رفع المشروع للخادم
# 2. تنفيذ النشر التلقائي
chmod +x quick_deploy.sh
bash quick_deploy.sh --deploy

# أو النشر التفاعلي
bash quick_deploy.sh
```

### الملفات المطلوبة للنشر
- ✅ `deploy_namecheap.sh` - سكريبت النشر الرئيسي
- ✅ `deploy_helper.py` - مساعد Python للنشر
- ✅ `quick_deploy.sh` - النشر السريع
- ✅ `requirements-production.txt` - متطلبات الإنتاج
- ✅ `.htaccess` - إعدادات الخادم
- ✅ `index.py` - ملف WSGI
- ✅ `.env.production` - قالب البيئة

### المزايا التلقائية
- 🔐 **إنشاء شهادة SSL** تلقائياً (Let's Encrypt)
- 🗄️ **إعداد قاعدة البيانات** MySQL تلقائياً
- 📧 **تكوين البريد الإلكتروني** لدومين sehea.net
- 📊 **مراقبة الموقع** كل 5 دقائق
- 💾 **نسخ احتياطية** يومية تلقائية
- ⚡ **تحسين الأداء** والأمان

## نشر المشروع على Namecheap

### متطلبات الاستضافة

للنشر على Namecheap، تحتاج إلى:
- **استضافة مشتركة** مع دعم Python/Django
- **قاعدة بيانات MySQL**
- **دومين** مسجل
- **شهادة SSL** (مجانية مع Namecheap)

### خطوات النشر

#### 1. إعداد الاستضافة

```bash
# تسجيل الدخول لـ cPanel
# الانتقال إلى File Manager
# إنشاء مجلد للمشروع في public_html
mkdir /public_html/sclive
```

#### 2. رفع ملفات المشروع

```bash
# ضغط المشروع محلياً
zip -r sclive.zip . -x "venv/*" "__pycache__/*" "*.pyc" ".git/*"

# رفع الملف المضغوط عبر File Manager
# استخراج الملفات في مجلد sclive
```

#### 3. إعداد قاعدة البيانات

```sql
-- في cPanel > MySQL Databases
-- إنشاء قاعدة بيانات جديدة
CREATE DATABASE cpanel_username_sclive;

-- إنشاء مستخدم قاعدة بيانات
CREATE USER 'cpanel_username_sclive'@'localhost' IDENTIFIED BY 'strong_password';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON cpanel_username_sclive.* TO 'cpanel_username_sclive'@'localhost';
FLUSH PRIVILEGES;
```

#### 4. إعداد ملف البيئة

```bash
# إنشاء ملف .env في مجلد المشروع
nano /public_html/sclive/.env
```

```env
# إعدادات الإنتاج
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# إعدادات قاعدة البيانات
DATABASE_URL=mysql://cpanel_username_sclive:password@localhost/cpanel_username_sclive

# إعدادات البريد الإلكتروني
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=email_password
EMAIL_USE_TLS=True

# إعدادات الملفات الثابتة
STATIC_URL=/static/
STATIC_ROOT=/public_html/sclive/staticfiles/
MEDIA_URL=/media/
MEDIA_ROOT=/public_html/sclive/media/
```

#### 5. تثبيت المتطلبات

```bash
# في Terminal أو SSH
cd /public_html/sclive
python3 -m pip install --user -r requirements.txt
```

#### 6. تنفيذ الترحيلات

```bash
# تنفيذ ترحيلات قاعدة البيانات
python3 manage.py migrate

# جمع الملفات الثابتة
python3 manage.py collectstatic --noinput

# تهيئة قاعدة البيانات
python3 manage.py init_db
```

#### 7. إعداد ملف .htaccess

```apache
# نسخ ملف .htaccess المرفق إلى public_html
cp /public_html/sclive/.htaccess /public_html/.htaccess
```

#### 8. إعداد Python WSGI

```python
# إنشاء ملف index.py في public_html
import os
import sys
import django
from django.core.wsgi import get_wsgi_application

# إضافة مسار المشروع
sys.path.insert(0, '/home/cpanel_username/public_html/sclive')
sys.path.insert(0, '/home/cpanel_username/public_html/sclive/sclive')

# تعيين إعدادات Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings')

# تهيئة Django
django.setup()

# تطبيق WSGI
application = get_wsgi_application()
```

#### 9. إعداد شهادة SSL

```bash
# في cPanel > SSL/TLS
# تفعيل Let's Encrypt SSL Certificate
# أو رفع شهادة SSL مخصصة
```

#### 10. اختبار الموقع

```bash
# زيارة الموقع
https://yourdomain.com

# فحص الأخطاء في Error Logs
tail -f /home/cpanel_username/logs/error_log
```

### إعدادات إضافية للأمان

#### 1. حماية ملفات Django

```apache
# في .htaccess - منع الوصول للملفات الحساسة
<FilesMatch "\.(py|pyc|pyo|db|sqlite|log|ini|conf|env)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
```

#### 2. إعداد النسخ الاحتياطية

```bash
# إنشاء سكريبت نسخ احتياطي
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u username -p database_name > backup_$DATE.sql
tar -czf sclive_backup_$DATE.tar.gz /public_html/sclive
```

#### 3. مراقبة الأداء

```bash
# إعداد مراقبة الموقع
# استخدام Namecheap Website Monitoring
# أو خدمات مراقبة خارجية مثل UptimeRobot
```

### استكشاف الأخطاء

#### مشاكل شائعة وحلولها:

1. **خطأ 500 Internal Server Error**
   ```bash
   # فحص error logs
   tail -f ~/logs/error_log

   # التأكد من صحة ملف .htaccess
   # التأكد من صحة مسارات Python
   ```

2. **مشاكل قاعدة البيانات**
   ```bash
   # التأكد من صحة بيانات الاتصال
   python3 manage.py dbshell

   # إعادة تنفيذ الترحيلات
   python3 manage.py migrate --run-syncdb
   ```

3. **مشاكل الملفات الثابتة**
   ```bash
   # إعادة جمع الملفات الثابتة
   python3 manage.py collectstatic --clear --noinput

   # التأكد من صحة مسارات STATIC_ROOT
   ```

4. **مشاكل الصلاحيات**
   ```bash
   # تعديل صلاحيات الملفات
   chmod -R 755 /public_html/sclive
   chmod -R 644 /public_html/sclive/media
   ```

### نصائح للأداء الأمثل

1. **تحسين قاعدة البيانات**
   ```sql
   -- إضافة فهارس للجداول المهمة
   CREATE INDEX idx_patient_national_id ON core_patient(national_id);
   CREATE INDEX idx_sick_leave_date ON core_sickleave(start_date);
   ```

2. **تحسين الذاكرة**
   ```python
   # في settings.py
   DATABASES = {
       'default': {
           'OPTIONS': {
               'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
               'charset': 'utf8mb4',
           }
       }
   }
   ```

3. **تفعيل التخزين المؤقت**
   ```python
   # إضافة Redis أو Memcached للتخزين المؤقت
   CACHES = {
       'default': {
           'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
           'LOCATION': '/tmp/django_cache',
       }
   }
   ```

## الترخيص

هذا المشروع مرخص بموجب رخصة MIT.

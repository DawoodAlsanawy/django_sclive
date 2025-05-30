# 🚀 دليل النشر التلقائي لموقع sehea.net

## نظرة عامة
هذا الدليل يوضح كيفية نشر نظام إدارة الإجازات المرضية على استضافة Namecheap باستخدام دومين `sehea.net` بشكل تلقائي.

## 📋 المتطلبات المسبقة

### 1. استضافة Namecheap
- ✅ **حساب استضافة مشتركة** مع دعم Python
- ✅ **دومين sehea.net** مسجل ومربوط بالاستضافة
- ✅ **وصول SSH** (اختياري لكن مفضل)
- ✅ **قاعدة بيانات MySQL** متاحة

### 2. الملفات المطلوبة
- ✅ `deploy_namecheap.sh` - سكريبت النشر الرئيسي
- ✅ `deploy_helper.py` - مساعد Python للنشر
- ✅ `requirements-production.txt` - متطلبات الإنتاج
- ✅ `.htaccess` - إعدادات الخادم
- ✅ `index.py` - ملف WSGI
- ✅ `.env.production` - قالب متغيرات البيئة

## 🎯 طرق النشر

### الطريقة الأولى: النشر التلقائي الكامل (موصى بها)

#### 1. رفع الملفات
```bash
# ضغط المشروع (على جهازك المحلي)
zip -r sclive.zip . -x "venv/*" "__pycache__/*" "*.pyc" ".git/*"

# رفع الملف المضغوط عبر cPanel File Manager
# استخراج الملفات في public_html
```

#### 2. تنفيذ النشر التلقائي
```bash
# الاتصال بالخادم عبر SSH أو Terminal في cPanel
cd ~/public_html

# إعطاء صلاحيات التنفيذ
chmod +x deploy_namecheap.sh
chmod +x deploy_helper.py

# تنفيذ النشر التلقائي
bash deploy_namecheap.sh
```

#### 3. متابعة النشر
```bash
# مراقبة سجل النشر
tail -f ~/deployment.log

# فحص حالة النشر
bash deploy_namecheap.sh --check
```

### الطريقة الثانية: النشر اليدوي خطوة بخطوة

#### 1. إعداد قاعدة البيانات
```sql
-- في cPanel > MySQL Databases
CREATE DATABASE cpanel_username_sclive;
CREATE USER 'cpanel_username_sclive'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON cpanel_username_sclive.* TO 'cpanel_username_sclive'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. إعداد ملف البيئة
```bash
# نسخ قالب البيئة
cp .env.production .env

# تعديل الإعدادات
nano .env
```

#### 3. تثبيت المتطلبات
```bash
# تثبيت مكتبات Python
python3 -m pip install --user -r requirements-production.txt
```

#### 4. إعداد Django
```bash
# تنفيذ الترحيلات
python3 manage.py migrate --settings=sclive.settings_production

# جمع الملفات الثابتة
python3 manage.py collectstatic --noinput --settings=sclive.settings_production

# تهيئة قاعدة البيانات
python3 manage.py init_db --settings=sclive.settings_production
```

#### 5. إعداد الخادم
```bash
# نسخ .htaccess
cp .htaccess ~/public_html/.htaccess

# إعداد WSGI
cp index.py ~/public_html/index.py
chmod +x ~/public_html/index.py
```

## 🔐 إعداد SSL التلقائي

### Let's Encrypt (مجاني)
```bash
# تنفيذ إعداد SSL التلقائي
python3 deploy_helper.py --ssl

# أو باستخدام السكريبت الرئيسي
bash deploy_namecheap.sh --ssl
```

### SSL يدوي في cPanel
1. انتقل إلى **cPanel > SSL/TLS**
2. اختر **Let's Encrypt SSL**
3. أدخل `sehea.net` و `www.sehea.net`
4. انقر **Issue**

## 📧 إعداد البريد الإلكتروني

### إنشاء حسابات البريد في cPanel
```
1. noreply@sehea.net - للإشعارات التلقائية
2. admin@sehea.net - للإدارة
3. support@sehea.net - للدعم الفني
```

### إعدادات SMTP
```
Server: mail.sehea.net
Port: 587
Security: TLS
Authentication: Yes
```

## 🔧 الاختبار والتحقق

### اختبار تلقائي
```bash
# اختبار شامل للموقع
python3 deploy_helper.py --test

# فحص صحة النظام
python3 manage.py check --settings=sclive.settings_production
```

### اختبار يدوي
1. **زيارة الموقع:** https://sehea.net
2. **لوحة الإدارة:** https://sehea.net/admin/
3. **اختبار SSL:** https://www.ssllabs.com/ssltest/
4. **اختبار السرعة:** https://gtmetrix.com/

## 📊 المراقبة والصيانة

### إعداد المراقبة التلقائية
```bash
# تفعيل مراقبة الموقع
python3 deploy_helper.py --monitor

# فحص سجلات المراقبة
tail -f ~/monitor.log
```

### النسخ الاحتياطية التلقائية
```bash
# تفعيل النسخ الاحتياطية اليومية
bash deploy_namecheap.sh --backup

# تنفيذ نسخة احتياطية فورية
bash ~/backup_sclive.sh
```

### تحسين الأداء
```bash
# تحسين قاعدة البيانات والملفات
python3 deploy_helper.py --optimize
```

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### خطأ 500 Internal Server Error
```bash
# فحص سجلات الأخطاء
tail -f ~/logs/error_log

# فحص إعدادات Python
python3 --version
which python3

# فحص صلاحيات الملفات
ls -la ~/public_html/index.py
```

#### مشاكل قاعدة البيانات
```bash
# اختبار الاتصال
python3 manage.py dbshell --settings=sclive.settings_production

# إعادة تنفيذ الترحيلات
python3 manage.py migrate --run-syncdb --settings=sclive.settings_production
```

#### مشاكل الملفات الثابتة
```bash
# إعادة جمع الملفات الثابتة
python3 manage.py collectstatic --clear --noinput --settings=sclive.settings_production

# فحص مسارات الملفات
ls -la ~/public_html/sclive/staticfiles/
```

#### مشاكل SSL
```bash
# تجديد شهادة Let's Encrypt
certbot renew --dry-run

# فحص صحة الشهادة
openssl x509 -in ~/ssl/sehea.net.crt -text -noout
```

## 📈 تحسين الأداء

### تحسين قاعدة البيانات
```sql
-- إضافة فهارس للجداول المهمة
CREATE INDEX idx_patient_national_id ON core_patient(national_id);
CREATE INDEX idx_sick_leave_date ON core_sickleave(start_date);
CREATE INDEX idx_companion_leave_date ON core_companionleave(start_date);
```

### تحسين الخادم
```apache
# في .htaccess - تفعيل ضغط إضافي
<IfModule mod_deflate.c>
    SetOutputFilter DEFLATE
    SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png)$ no-gzip dont-vary
</IfModule>
```

### تحسين Django
```python
# في settings_production.py - تفعيل التخزين المؤقت
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': '/tmp/django_cache',
        'TIMEOUT': 300,
    }
}
```

## 🔄 التحديثات المستقبلية

### تحديث الكود
```bash
# نسخ احتياطية قبل التحديث
bash ~/backup_sclive.sh

# رفع الملفات الجديدة
# تنفيذ الترحيلات الجديدة
python3 manage.py migrate --settings=sclive.settings_production

# جمع الملفات الثابتة الجديدة
python3 manage.py collectstatic --noinput --settings=sclive.settings_production
```

### تحديث المتطلبات
```bash
# تحديث مكتبات Python
python3 -m pip install --user --upgrade -r requirements-production.txt
```

## 📞 الدعم الفني

### معلومات الاتصال
- **البريد الإلكتروني:** support@sehea.net
- **الموقع:** https://sehea.net
- **التوثيق:** https://sehea.net/docs/

### الملفات المهمة
- **سجل النشر:** `~/deployment.log`
- **سجل Python:** `~/deployment_python.log`
- **سجل المراقبة:** `~/monitor.log`
- **تقرير النشر:** `~/sehea_deployment_report.txt`

## ✅ قائمة التحقق النهائية

- [ ] ✅ رفع جميع ملفات المشروع
- [ ] ✅ إعداد قاعدة البيانات MySQL
- [ ] ✅ تكوين ملف .env
- [ ] ✅ تثبيت متطلبات Python
- [ ] ✅ تنفيذ ترحيلات Django
- [ ] ✅ جمع الملفات الثابتة
- [ ] ✅ إعداد .htaccess
- [ ] ✅ تكوين WSGI
- [ ] ✅ تثبيت شهادة SSL
- [ ] ✅ إنشاء حسابات البريد الإلكتروني
- [ ] ✅ اختبار الموقع
- [ ] ✅ إعداد المراقبة
- [ ] ✅ تفعيل النسخ الاحتياطية
- [ ] ✅ تحسين الأداء
- [ ] ✅ توثيق الإعدادات

## 🎉 النتيجة النهائية

بعد اكتمال النشر بنجاح، ستحصل على:

- ✅ **موقع آمن:** https://sehea.net مع شهادة SSL
- ✅ **لوحة إدارة:** https://sehea.net/admin/
- ✅ **نظام مراقبة:** تلقائي كل 5 دقائق
- ✅ **نسخ احتياطية:** يومية تلقائية
- ✅ **أداء محسن:** ضغط وتخزين مؤقت
- ✅ **أمان عالي:** حماية شاملة من الهجمات
- ✅ **دعم عربي:** كامل للغة العربية

**🚀 موقع sehea.net جاهز للاستخدام!**

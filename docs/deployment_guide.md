# دليل النشر والصيانة لنظام إدارة الإجازات المرضية

## مقدمة

هذا الدليل يشرح كيفية نشر نظام إدارة الإجازات المرضية على خادم الإنتاج وكيفية صيانته. يتضمن الدليل خطوات تفصيلية لإعداد الخادم وتكوين النظام وتشغيله وصيانته.

## متطلبات الخادم

- نظام تشغيل: Ubuntu 22.04 LTS أو أحدث
- وحدة المعالجة المركزية: 2 نواة أو أكثر
- الذاكرة: 4 جيجابايت أو أكثر
- مساحة التخزين: 20 جيجابايت أو أكثر
- اتصال إنترنت مستقر

## إعداد الخادم

### 1. تحديث النظام

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. تثبيت المتطلبات الأساسية

```bash
sudo apt install -y python3 python3-pip python3-venv nginx mysql-server mysql-client libmysqlclient-dev
```

### 3. تكوين MySQL

```bash
sudo mysql_secure_installation
```

اتبع التعليمات لإعداد كلمة مرور لمستخدم الجذر وتأمين خادم MySQL.

### 4. إنشاء قاعدة بيانات ومستخدم

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE sclive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sclive_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON sclive_db.* TO 'sclive_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. إنشاء مستخدم للتطبيق

```bash
sudo adduser sclive
sudo usermod -aG sudo sclive
```

### 6. تثبيت Certbot للحصول على شهادة SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

## نشر التطبيق

### 1. تنزيل التطبيق

```bash
sudo su - sclive
git clone https://github.com/yourusername/sclive.git
cd sclive
```

### 2. إنشاء بيئة افتراضية

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. تثبيت المتطلبات

```bash
pip install uv
uv pip install -r requirements.txt
```

### 4. إنشاء ملف .env

```bash
nano .env
```

أضف المحتوى التالي:

```
# إعدادات المشروع
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# إعدادات قاعدة البيانات
DB_ENGINE=django.db.backends.mysql
DB_NAME=sclive_db
DB_USER=sclive_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306

# إعدادات البريد الإلكتروني
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# إعدادات Sentry
SENTRY_DSN=your-production-sentry-dsn
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### 5. تطبيق الترحيلات

```bash
python manage.py migrate
```

### 6. إنشاء مستخدم مسؤول

```bash
python manage.py createsuperuser
```

### 7. جمع الملفات الثابتة

```bash
python manage.py collectstatic --noinput
```

### 8. إنشاء مجلد للسجلات

```bash
mkdir -p logs
```

### 9. تكوين Gunicorn

تأكد من أن ملف `gunicorn_config.py` موجود في المجلد الرئيسي للمشروع ويحتوي على التكوين المناسب.

### 10. تكوين ملف خدمة systemd

```bash
sudo nano /etc/systemd/system/sclive.service
```

أضف المحتوى التالي:

```ini
[Unit]
Description=Gunicorn daemon for SCLIVE
After=network.target

[Service]
User=sclive
Group=www-data
WorkingDirectory=/home/sclive/sclive
ExecStart=/home/sclive/sclive/.venv/bin/gunicorn --config gunicorn_config.py sclive.wsgi:application
Restart=on-failure
RestartSec=5s
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 11. تكوين Nginx

```bash
sudo nano /etc/nginx/sites-available/sclive
```

أضف المحتوى التالي:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # تحويل جميع الطلبات إلى HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    # تكوين SSL
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # تكوين HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # تكوين سياسة أمان المحتوى
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self';" always;

    # تكوين X-Frame-Options
    add_header X-Frame-Options "SAMEORIGIN" always;

    # تكوين X-Content-Type-Options
    add_header X-Content-Type-Options "nosniff" always;

    # تكوين Referrer-Policy
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # تكوين Feature-Policy
    add_header Feature-Policy "geolocation 'none'; midi 'none'; sync-xhr 'none'; microphone 'none'; camera 'none'; magnetometer 'none'; gyroscope 'none'; speaker 'none'; fullscreen 'self'; payment 'none'" always;

    # تكوين الملفات الثابتة
    location /static/ {
        alias /home/sclive/sclive/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # تكوين ملفات الوسائط
    location /media/ {
        alias /home/sclive/sclive/media/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # تكوين الطلبات الأخرى
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_buffering on;
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
    }

    # تكوين ملف robots.txt
    location = /robots.txt {
        alias /home/sclive/sclive/staticfiles/robots.txt;
    }

    # تكوين ملف favicon.ico
    location = /favicon.ico {
        alias /home/sclive/sclive/staticfiles/favicon.ico;
    }

    # تكوين الخطأ 404
    error_page 404 /404.html;
    location = /404.html {
        root /home/sclive/sclive/staticfiles/;
        internal;
    }

    # تكوين الخطأ 500
    error_page 500 502 503 504 /500.html;
    location = /500.html {
        root /home/sclive/sclive/staticfiles/;
        internal;
    }
}
```

### 12. إنشاء رابط رمزي لتكوين Nginx

```bash
sudo ln -s /etc/nginx/sites-available/sclive /etc/nginx/sites-enabled/
```

### 13. الحصول على شهادة SSL

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 14. اختبار تكوين Nginx

```bash
sudo nginx -t
```

### 15. تشغيل الخدمات

```bash
sudo systemctl daemon-reload
sudo systemctl start sclive
sudo systemctl enable sclive
sudo systemctl restart nginx
```

## الصيانة

### النسخ الاحتياطي

#### 1. النسخ الاحتياطي لقاعدة البيانات

إنشاء سكريبت للنسخ الاحتياطي:

```bash
sudo nano /home/sclive/backup_db.sh
```

أضف المحتوى التالي:

```bash
#!/bin/bash

# تعيين المتغيرات
BACKUP_DIR="/home/sclive/backups/db"
MYSQL_USER="sclive_user"
MYSQL_PASSWORD="your-password"
MYSQL_DATABASE="sclive_db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sclive_db_$DATE.sql"

# إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجودًا
mkdir -p $BACKUP_DIR

# إنشاء نسخة احتياطية
mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > $BACKUP_FILE

# ضغط النسخة الاحتياطية
gzip $BACKUP_FILE

# الاحتفاظ بآخر 30 نسخة احتياطية فقط
ls -tp $BACKUP_DIR/*.sql.gz | grep -v '/$' | tail -n +31 | xargs -I {} rm -- {}

# إخراج رسالة نجاح
echo "تم إنشاء نسخة احتياطية لقاعدة البيانات: $BACKUP_FILE.gz"
```

تعيين صلاحيات التنفيذ:

```bash
sudo chmod +x /home/sclive/backup_db.sh
```

إضافة مهمة cron للنسخ الاحتياطي اليومي:

```bash
sudo crontab -e
```

أضف السطر التالي:

```
0 2 * * * /home/sclive/backup_db.sh >> /home/sclive/logs/backup.log 2>&1
```

#### 2. النسخ الاحتياطي للملفات

إنشاء سكريبت للنسخ الاحتياطي:

```bash
sudo nano /home/sclive/backup_files.sh
```

أضف المحتوى التالي:

```bash
#!/bin/bash

# تعيين المتغيرات
BACKUP_DIR="/home/sclive/backups/files"
SOURCE_DIR="/home/sclive/sclive"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sclive_files_$DATE.tar.gz"

# إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجودًا
mkdir -p $BACKUP_DIR

# إنشاء نسخة احتياطية
tar -czf $BACKUP_FILE -C $SOURCE_DIR media .env

# الاحتفاظ بآخر 7 نسخ احتياطية فقط
ls -tp $BACKUP_DIR/*.tar.gz | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}

# إخراج رسالة نجاح
echo "تم إنشاء نسخة احتياطية للملفات: $BACKUP_FILE"
```

تعيين صلاحيات التنفيذ:

```bash
sudo chmod +x /home/sclive/backup_files.sh
```

إضافة مهمة cron للنسخ الاحتياطي الأسبوعي:

```bash
sudo crontab -e
```

أضف السطر التالي:

```
0 3 * * 0 /home/sclive/backup_files.sh >> /home/sclive/logs/backup.log 2>&1
```

### استعادة النسخ الاحتياطي

#### 1. استعادة قاعدة البيانات

```bash
# فك ضغط ملف النسخ الاحتياطي
gunzip /home/sclive/backups/db/sclive_db_YYYYMMDD_HHMMSS.sql.gz

# استعادة قاعدة البيانات
mysql -u sclive_user -p sclive_db < /home/sclive/backups/db/sclive_db_YYYYMMDD_HHMMSS.sql
```

#### 2. استعادة الملفات

```bash
# استعادة الملفات
tar -xzf /home/sclive/backups/files/sclive_files_YYYYMMDD_HHMMSS.tar.gz -C /home/sclive/sclive
```

### تحديث النظام

#### 1. إنشاء سكريبت للتحديث

```bash
sudo nano /home/sclive/update.sh
```

أضف المحتوى التالي:

```bash
#!/bin/bash

# تعيين المتغيرات
APP_DIR="/home/sclive/sclive"
LOG_FILE="/home/sclive/logs/update.log"

# تسجيل بداية التحديث
echo "بدء التحديث في $(date)" >> $LOG_FILE

# الانتقال إلى مجلد التطبيق
cd $APP_DIR

# تحديث الكود من Git
echo "تحديث الكود من Git..." >> $LOG_FILE
git pull >> $LOG_FILE 2>&1

# تفعيل البيئة الافتراضية
source .venv/bin/activate

# تحديث المتطلبات
echo "تحديث المتطلبات..." >> $LOG_FILE
uv pip install -r requirements.txt >> $LOG_FILE 2>&1

# تطبيق الترحيلات
echo "تطبيق الترحيلات..." >> $LOG_FILE
python manage.py migrate >> $LOG_FILE 2>&1

# جمع الملفات الثابتة
echo "جمع الملفات الثابتة..." >> $LOG_FILE
python manage.py collectstatic --noinput >> $LOG_FILE 2>&1

# إعادة تشغيل الخدمة
echo "إعادة تشغيل الخدمة..." >> $LOG_FILE
sudo systemctl restart sclive >> $LOG_FILE 2>&1

# تسجيل نهاية التحديث
echo "اكتمال التحديث في $(date)" >> $LOG_FILE
echo "-----------------------------------" >> $LOG_FILE
```

تعيين صلاحيات التنفيذ:

```bash
sudo chmod +x /home/sclive/update.sh
```

#### 2. تنفيذ التحديث

```bash
sudo /home/sclive/update.sh
```

### مراقبة النظام

#### 1. مراقبة السجلات

```bash
# سجلات Gunicorn
tail -f /home/sclive/sclive/logs/gunicorn-error.log

# سجلات Nginx
tail -f /var/log/nginx/error.log

# سجلات النظام
tail -f /var/log/syslog
```

#### 2. مراقبة حالة الخدمات

```bash
# حالة خدمة Gunicorn
sudo systemctl status sclive

# حالة خدمة Nginx
sudo systemctl status nginx

# حالة خدمة MySQL
sudo systemctl status mysql
```

#### 3. مراقبة استخدام الموارد

```bash
# استخدام وحدة المعالجة المركزية والذاكرة
htop

# استخدام القرص
df -h
```

## استكشاف الأخطاء وإصلاحها

### 1. مشاكل الاتصال بقاعدة البيانات

```bash
# التحقق من حالة خدمة MySQL
sudo systemctl status mysql

# التحقق من إمكانية الاتصال بقاعدة البيانات
mysql -u sclive_user -p -e "SELECT 1"
```

### 2. مشاكل Gunicorn

```bash
# التحقق من حالة خدمة Gunicorn
sudo systemctl status sclive

# إعادة تشغيل خدمة Gunicorn
sudo systemctl restart sclive

# التحقق من سجلات Gunicorn
tail -f /home/sclive/sclive/logs/gunicorn-error.log
```

### 3. مشاكل Nginx

```bash
# التحقق من تكوين Nginx
sudo nginx -t

# إعادة تشغيل خدمة Nginx
sudo systemctl restart nginx

# التحقق من سجلات Nginx
tail -f /var/log/nginx/error.log
```

### 4. مشاكل الملفات الثابتة

```bash
# التحقق من وجود الملفات الثابتة
ls -la /home/sclive/sclive/staticfiles/

# إعادة جمع الملفات الثابتة
cd /home/sclive/sclive/
source .venv/bin/activate
python manage.py collectstatic --noinput
```

### 5. مشاكل الصلاحيات

```bash
# تعيين الصلاحيات الصحيحة للملفات
sudo chown -R sclive:www-data /home/sclive/sclive/
sudo chmod -R 755 /home/sclive/sclive/
sudo chmod -R 775 /home/sclive/sclive/media/
sudo chmod -R 775 /home/sclive/sclive/staticfiles/
```

## الخلاصة

هذا الدليل يوفر إرشادات شاملة لنشر نظام إدارة الإجازات المرضية على خادم الإنتاج وصيانته. اتبع هذه الإرشادات بعناية لضمان تشغيل النظام بشكل صحيح وآمن.

# دليل النسخ الاحتياطي واستعادة البيانات لنظام إدارة الإجازات المرضية

## مقدمة

هذا الدليل يشرح إجراءات النسخ الاحتياطي واستعادة البيانات لنظام إدارة الإجازات المرضية. يتضمن الدليل خطوات تفصيلية لإنشاء نسخ احتياطية منتظمة واستعادة البيانات في حالة حدوث مشكلة.

## أنواع البيانات التي تحتاج إلى نسخ احتياطي

1. **قاعدة البيانات**: تحتوي على جميع بيانات النظام مثل العملاء والإجازات والفواتير والمدفوعات.
2. **ملفات الوسائط**: تحتوي على الملفات التي تم تحميلها مثل الصور والمستندات.
3. **ملفات الإعدادات**: تحتوي على إعدادات النظام مثل ملف `.env`.

## استراتيجية النسخ الاحتياطي

### 1. النسخ الاحتياطي اليومي لقاعدة البيانات

يتم إنشاء نسخة احتياطية لقاعدة البيانات يوميًا في الساعة 2:00 صباحًا. يتم الاحتفاظ بآخر 30 نسخة احتياطية.

### 2. النسخ الاحتياطي الأسبوعي للملفات

يتم إنشاء نسخة احتياطية للملفات أسبوعيًا في الساعة 3:00 صباحًا يوم الأحد. يتم الاحتفاظ بآخر 7 نسخ احتياطية.

### 3. النسخ الاحتياطي اليدوي قبل التحديثات الكبيرة

يتم إنشاء نسخة احتياطية يدوية لقاعدة البيانات والملفات قبل إجراء أي تحديثات كبيرة على النظام.

## إعداد النسخ الاحتياطي التلقائي

### 1. إنشاء مجلدات النسخ الاحتياطي

```bash
sudo mkdir -p /home/sclive/backups/db
sudo mkdir -p /home/sclive/backups/files
sudo chown -R sclive:sclive /home/sclive/backups
```

### 2. إنشاء سكريبت النسخ الاحتياطي لقاعدة البيانات

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
LOG_FILE="/home/sclive/logs/backup.log"

# إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجودًا
mkdir -p $BACKUP_DIR

# تسجيل بداية النسخ الاحتياطي
echo "بدء النسخ الاحتياطي لقاعدة البيانات في $(date)" >> $LOG_FILE

# إنشاء نسخة احتياطية
echo "إنشاء نسخة احتياطية لقاعدة البيانات..." >> $LOG_FILE
mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > $BACKUP_FILE 2>> $LOG_FILE

# التحقق من نجاح النسخ الاحتياطي
if [ $? -eq 0 ]; then
    echo "تم إنشاء نسخة احتياطية لقاعدة البيانات بنجاح" >> $LOG_FILE
else
    echo "فشل إنشاء نسخة احتياطية لقاعدة البيانات" >> $LOG_FILE
    exit 1
fi

# ضغط النسخة الاحتياطية
echo "ضغط النسخة الاحتياطية..." >> $LOG_FILE
gzip $BACKUP_FILE 2>> $LOG_FILE

# التحقق من نجاح الضغط
if [ $? -eq 0 ]; then
    echo "تم ضغط النسخة الاحتياطية بنجاح" >> $LOG_FILE
else
    echo "فشل ضغط النسخة الاحتياطية" >> $LOG_FILE
    exit 1
fi

# الاحتفاظ بآخر 30 نسخة احتياطية فقط
echo "حذف النسخ الاحتياطية القديمة..." >> $LOG_FILE
ls -tp $BACKUP_DIR/*.sql.gz | grep -v '/$' | tail -n +31 | xargs -I {} rm -- {} 2>> $LOG_FILE

# حساب حجم النسخة الاحتياطية
BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)

# تسجيل نهاية النسخ الاحتياطي
echo "اكتمال النسخ الاحتياطي لقاعدة البيانات في $(date)" >> $LOG_FILE
echo "حجم النسخة الاحتياطية: $BACKUP_SIZE" >> $LOG_FILE
echo "مسار النسخة الاحتياطية: $BACKUP_FILE.gz" >> $LOG_FILE
echo "-----------------------------------" >> $LOG_FILE
```

تعيين صلاحيات التنفيذ:

```bash
sudo chmod +x /home/sclive/backup_db.sh
```

### 3. إنشاء سكريبت النسخ الاحتياطي للملفات

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
LOG_FILE="/home/sclive/logs/backup.log"

# إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجودًا
mkdir -p $BACKUP_DIR

# تسجيل بداية النسخ الاحتياطي
echo "بدء النسخ الاحتياطي للملفات في $(date)" >> $LOG_FILE

# إنشاء نسخة احتياطية
echo "إنشاء نسخة احتياطية للملفات..." >> $LOG_FILE
tar -czf $BACKUP_FILE -C $SOURCE_DIR media .env 2>> $LOG_FILE

# التحقق من نجاح النسخ الاحتياطي
if [ $? -eq 0 ]; then
    echo "تم إنشاء نسخة احتياطية للملفات بنجاح" >> $LOG_FILE
else
    echo "فشل إنشاء نسخة احتياطية للملفات" >> $LOG_FILE
    exit 1
fi

# الاحتفاظ بآخر 7 نسخ احتياطية فقط
echo "حذف النسخ الاحتياطية القديمة..." >> $LOG_FILE
ls -tp $BACKUP_DIR/*.tar.gz | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {} 2>> $LOG_FILE

# حساب حجم النسخة الاحتياطية
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

# تسجيل نهاية النسخ الاحتياطي
echo "اكتمال النسخ الاحتياطي للملفات في $(date)" >> $LOG_FILE
echo "حجم النسخة الاحتياطية: $BACKUP_SIZE" >> $LOG_FILE
echo "مسار النسخة الاحتياطية: $BACKUP_FILE" >> $LOG_FILE
echo "-----------------------------------" >> $LOG_FILE
```

تعيين صلاحيات التنفيذ:

```bash
sudo chmod +x /home/sclive/backup_files.sh
```

### 4. إضافة مهام cron للنسخ الاحتياطي التلقائي

```bash
sudo crontab -e
```

أضف السطور التالية:

```
# النسخ الاحتياطي اليومي لقاعدة البيانات (الساعة 2:00 صباحًا)
0 2 * * * /home/sclive/backup_db.sh

# النسخ الاحتياطي الأسبوعي للملفات (الساعة 3:00 صباحًا يوم الأحد)
0 3 * * 0 /home/sclive/backup_files.sh
```

## النسخ الاحتياطي اليدوي

### 1. النسخ الاحتياطي اليدوي لقاعدة البيانات

```bash
# تنفيذ سكريبت النسخ الاحتياطي لقاعدة البيانات
sudo /home/sclive/backup_db.sh
```

أو يمكنك إنشاء نسخة احتياطية يدويًا:

```bash
# تعيين المتغيرات
BACKUP_DIR="/home/sclive/backups/db"
MYSQL_USER="sclive_user"
MYSQL_PASSWORD="your-password"
MYSQL_DATABASE="sclive_db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sclive_db_manual_$DATE.sql"

# إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجودًا
mkdir -p $BACKUP_DIR

# إنشاء نسخة احتياطية
mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > $BACKUP_FILE

# ضغط النسخة الاحتياطية
gzip $BACKUP_FILE

# عرض مسار النسخة الاحتياطية
echo "تم إنشاء نسخة احتياطية لقاعدة البيانات: $BACKUP_FILE.gz"
```

### 2. النسخ الاحتياطي اليدوي للملفات

```bash
# تنفيذ سكريبت النسخ الاحتياطي للملفات
sudo /home/sclive/backup_files.sh
```

أو يمكنك إنشاء نسخة احتياطية يدويًا:

```bash
# تعيين المتغيرات
BACKUP_DIR="/home/sclive/backups/files"
SOURCE_DIR="/home/sclive/sclive"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sclive_files_manual_$DATE.tar.gz"

# إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجودًا
mkdir -p $BACKUP_DIR

# إنشاء نسخة احتياطية
tar -czf $BACKUP_FILE -C $SOURCE_DIR media .env

# عرض مسار النسخة الاحتياطية
echo "تم إنشاء نسخة احتياطية للملفات: $BACKUP_FILE"
```

## نقل النسخ الاحتياطية إلى موقع خارجي

من المهم نقل النسخ الاحتياطية إلى موقع خارجي لحمايتها من فقدان البيانات في حالة حدوث مشكلة في الخادم.

### 1. النقل إلى خادم FTP

```bash
sudo nano /home/sclive/backup_to_ftp.sh
```

أضف المحتوى التالي:

```bash
#!/bin/bash

# تعيين المتغيرات
FTP_HOST="ftp.example.com"
FTP_USER="your-ftp-username"
FTP_PASSWORD="your-ftp-password"
FTP_DIR="/backups"
LOCAL_BACKUP_DIR="/home/sclive/backups"
DATE=$(date +%Y%m%d)
LOG_FILE="/home/sclive/logs/backup.log"

# تسجيل بداية النقل
echo "بدء نقل النسخ الاحتياطية إلى خادم FTP في $(date)" >> $LOG_FILE

# نقل النسخ الاحتياطية لقاعدة البيانات
echo "نقل النسخ الاحتياطية لقاعدة البيانات..." >> $LOG_FILE
find $LOCAL_BACKUP_DIR/db -name "*.sql.gz" -type f -mtime -1 -exec curl -T {} -u $FTP_USER:$FTP_PASSWORD ftp://$FTP_HOST$FTP_DIR/db/ \; 2>> $LOG_FILE

# نقل النسخ الاحتياطية للملفات
echo "نقل النسخ الاحتياطية للملفات..." >> $LOG_FILE
find $LOCAL_BACKUP_DIR/files -name "*.tar.gz" -type f -mtime -1 -exec curl -T {} -u $FTP_USER:$FTP_PASSWORD ftp://$FTP_HOST$FTP_DIR/files/ \; 2>> $LOG_FILE

# تسجيل نهاية النقل
echo "اكتمال نقل النسخ الاحتياطية إلى خادم FTP في $(date)" >> $LOG_FILE
echo "-----------------------------------" >> $LOG_FILE
```

تعيين صلاحيات التنفيذ:

```bash
sudo chmod +x /home/sclive/backup_to_ftp.sh
```

إضافة مهمة cron للنقل اليومي:

```bash
sudo crontab -e
```

أضف السطر التالي:

```
# النقل اليومي للنسخ الاحتياطية إلى خادم FTP (الساعة 4:00 صباحًا)
0 4 * * * /home/sclive/backup_to_ftp.sh
```

### 2. النقل إلى خدمة تخزين سحابية (AWS S3)

تثبيت AWS CLI:

```bash
sudo apt install -y awscli
```

تكوين AWS CLI:

```bash
aws configure
```

إنشاء سكريبت النقل:

```bash
sudo nano /home/sclive/backup_to_s3.sh
```

أضف المحتوى التالي:

```bash
#!/bin/bash

# تعيين المتغيرات
S3_BUCKET="your-s3-bucket"
LOCAL_BACKUP_DIR="/home/sclive/backups"
DATE=$(date +%Y%m%d)
LOG_FILE="/home/sclive/logs/backup.log"

# تسجيل بداية النقل
echo "بدء نقل النسخ الاحتياطية إلى AWS S3 في $(date)" >> $LOG_FILE

# نقل النسخ الاحتياطية لقاعدة البيانات
echo "نقل النسخ الاحتياطية لقاعدة البيانات..." >> $LOG_FILE
find $LOCAL_BACKUP_DIR/db -name "*.sql.gz" -type f -mtime -1 -exec aws s3 cp {} s3://$S3_BUCKET/db/ \; 2>> $LOG_FILE

# نقل النسخ الاحتياطية للملفات
echo "نقل النسخ الاحتياطية للملفات..." >> $LOG_FILE
find $LOCAL_BACKUP_DIR/files -name "*.tar.gz" -type f -mtime -1 -exec aws s3 cp {} s3://$S3_BUCKET/files/ \; 2>> $LOG_FILE

# تسجيل نهاية النقل
echo "اكتمال نقل النسخ الاحتياطية إلى AWS S3 في $(date)" >> $LOG_FILE
echo "-----------------------------------" >> $LOG_FILE
```

تعيين صلاحيات التنفيذ:

```bash
sudo chmod +x /home/sclive/backup_to_s3.sh
```

إضافة مهمة cron للنقل اليومي:

```bash
sudo crontab -e
```

أضف السطر التالي:

```
# النقل اليومي للنسخ الاحتياطية إلى AWS S3 (الساعة 4:00 صباحًا)
0 4 * * * /home/sclive/backup_to_s3.sh
```

## استعادة البيانات

### 1. استعادة قاعدة البيانات

```bash
# فك ضغط ملف النسخ الاحتياطي
gunzip /home/sclive/backups/db/sclive_db_YYYYMMDD_HHMMSS.sql.gz

# استعادة قاعدة البيانات
mysql -u sclive_user -p sclive_db < /home/sclive/backups/db/sclive_db_YYYYMMDD_HHMMSS.sql
```

### 2. استعادة الملفات

```bash
# استعادة الملفات
tar -xzf /home/sclive/backups/files/sclive_files_YYYYMMDD_HHMMSS.tar.gz -C /home/sclive/sclive
```

### 3. استعادة النظام بالكامل

في حالة الحاجة إلى استعادة النظام بالكامل، اتبع الخطوات التالية:

1. تثبيت نظام التشغيل وإعداد الخادم كما هو موضح في دليل النشر.
2. تثبيت المتطلبات الأساسية (Python, MySQL, Nginx, etc.).
3. إنشاء قاعدة بيانات ومستخدم.
4. تنزيل أحدث إصدار من الكود من مستودع Git.
5. استعادة ملف `.env` من النسخة الاحتياطية.
6. استعادة قاعدة البيانات من النسخة الاحتياطية.
7. استعادة ملفات الوسائط من النسخة الاحتياطية.
8. تكوين Nginx و Gunicorn.
9. تشغيل الخدمات.

## اختبار النسخ الاحتياطي والاستعادة

من المهم اختبار عملية النسخ الاحتياطي والاستعادة بانتظام للتأكد من أنها تعمل بشكل صحيح.

### 1. اختبار النسخ الاحتياطي

```bash
# تنفيذ سكريبت النسخ الاحتياطي لقاعدة البيانات
sudo /home/sclive/backup_db.sh

# تنفيذ سكريبت النسخ الاحتياطي للملفات
sudo /home/sclive/backup_files.sh

# التحقق من وجود ملفات النسخ الاحتياطي
ls -la /home/sclive/backups/db/
ls -la /home/sclive/backups/files/
```

### 2. اختبار الاستعادة

يمكن إجراء اختبار الاستعادة على خادم اختبار منفصل لتجنب التأثير على النظام الحي.

```bash
# إنشاء قاعدة بيانات اختبار
mysql -u root -p -e "CREATE DATABASE sclive_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON sclive_test.* TO 'sclive_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# فك ضغط ملف النسخ الاحتياطي
gunzip -c /home/sclive/backups/db/sclive_db_YYYYMMDD_HHMMSS.sql.gz > /tmp/sclive_db_restore.sql

# استعادة قاعدة البيانات إلى قاعدة البيانات الاختبارية
mysql -u sclive_user -p sclive_test < /tmp/sclive_db_restore.sql

# التحقق من استعادة قاعدة البيانات
mysql -u sclive_user -p -e "SELECT COUNT(*) FROM sclive_test.auth_user;"

# حذف الملفات المؤقتة
rm /tmp/sclive_db_restore.sql

# حذف قاعدة البيانات الاختبارية بعد الانتهاء
mysql -u root -p -e "DROP DATABASE sclive_test;"
```

## جدول النسخ الاحتياطي

| النوع | التكرار | الوقت | الاحتفاظ | المسؤول |
|------|---------|------|---------|---------|
| قاعدة البيانات | يومي | 2:00 صباحًا | 30 يوم | النظام (cron) |
| الملفات | أسبوعي | 3:00 صباحًا (الأحد) | 7 أسابيع | النظام (cron) |
| النقل إلى موقع خارجي | يومي | 4:00 صباحًا | حسب إعدادات الموقع الخارجي | النظام (cron) |
| قبل التحديثات الكبيرة | عند الحاجة | قبل التحديث | دائم | مدير النظام |

## الخلاصة

هذا الدليل يوفر إرشادات شاملة لإجراءات النسخ الاحتياطي واستعادة البيانات لنظام إدارة الإجازات المرضية. اتبع هذه الإرشادات بعناية لضمان حماية بيانات النظام واستعادتها بسهولة في حالة حدوث مشكلة.

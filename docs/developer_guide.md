# دليل المطور لنظام إدارة الإجازات المرضية

## مقدمة

هذا الدليل مخصص للمطورين الذين يعملون على تطوير وصيانة نظام إدارة الإجازات المرضية. يحتوي هذا الدليل على معلومات حول بنية النظام وكيفية تثبيته وتكوينه وتطويره.

## متطلبات النظام

- Python 3.10 أو أحدث
- Django 5.0 أو أحدث
- MySQL 8.0 أو أحدث
- وحدات Python المطلوبة (مذكورة في ملف requirements.txt)

## تثبيت بيئة التطوير

### 1. تثبيت Python

قم بتنزيل وتثبيت Python من [الموقع الرسمي](https://www.python.org/downloads/).

### 2. تثبيت MySQL

قم بتنزيل وتثبيت MySQL من [الموقع الرسمي](https://dev.mysql.com/downloads/).

### 3. إنشاء قاعدة بيانات

```sql
CREATE DATABASE sclive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sclive_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON sclive_db.* TO 'sclive_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. تنزيل المشروع

```bash
git clone https://github.com/yourusername/sclive.git
cd sclive
```

### 5. إنشاء بيئة افتراضية

```bash
python -m venv .venv
```

### 6. تفعيل البيئة الافتراضية

في Windows:
```bash
.venv\Scripts\activate
```

في Linux/Mac:
```bash
source .venv/bin/activate
```

### 7. تثبيت المتطلبات

```bash
uv pip install -r requirements.txt
```

### 8. إنشاء ملف .env

قم بإنشاء ملف `.env` في المجلد الرئيسي للمشروع وأضف المتغيرات البيئية التالية:

```
# إعدادات المشروع
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# إعدادات قاعدة البيانات
DB_ENGINE=django.db.backends.mysql
DB_NAME=sclive_db
DB_USER=sclive_user
DB_PASSWORD=password
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
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### 9. تطبيق الترحيلات

```bash
python manage.py migrate
```

### 10. إنشاء مستخدم مسؤول

```bash
python manage.py createsuperuser
```

### 11. تشغيل الخادم المحلي

```bash
python manage.py runserver
```

## بنية المشروع

```
sclive/
├── core/                   # التطبيق الرئيسي
│   ├── migrations/         # ملفات ترحيل قاعدة البيانات
│   ├── static/             # الملفات الثابتة (CSS, JS, الصور)
│   ├── templates/          # قوالب HTML
│   ├── tests/              # اختبارات الوحدة
│   ├── admin.py            # تكوين لوحة الإدارة
│   ├── apps.py             # تكوين التطبيق
│   ├── forms.py            # نماذج الإدخال
│   ├── models.py           # نماذج قاعدة البيانات
│   ├── urls.py             # تكوين عناوين URL
│   ├── utils.py            # وظائف مساعدة
│   └── views.py            # وظائف العرض
├── docs/                   # وثائق المشروع
├── logs/                   # ملفات السجل
├── media/                  # ملفات الوسائط المحملة
├── sclive/                 # إعدادات المشروع
│   ├── settings.py         # إعدادات المشروع
│   ├── urls.py             # تكوين عناوين URL الرئيسية
│   └── wsgi.py             # تكوين WSGI
├── static/                 # الملفات الثابتة العامة
├── staticfiles/            # الملفات الثابتة المجمعة
├── .env                    # ملف المتغيرات البيئية
├── .gitignore              # ملف تجاهل Git
├── gunicorn_config.py      # تكوين Gunicorn
├── manage.py               # سكريبت إدارة Django
├── nginx_config.conf       # تكوين Nginx
├── performance_test.py     # اختبار الأداء
├── requirements.txt        # متطلبات Python
└── sclive.service          # ملف خدمة systemd
```

## نماذج قاعدة البيانات

### User

نموذج المستخدم المخصص الذي يمتد من `AbstractBaseUser` و `PermissionsMixin`.

```python
class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=64, unique=True, verbose_name='اسم المستخدم')
    email = models.EmailField(max_length=120, unique=True, verbose_name='البريد الإلكتروني')
    role = models.CharField(max_length=20, default='staff', verbose_name='الدور')  # admin, doctor, staff
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    is_staff = models.BooleanField(default=False, verbose_name='مسؤول')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
```

### Hospital

نموذج المستشفى.

```python
class Hospital(models.Model):
    name = models.CharField(max_length=100, verbose_name='اسم المستشفى')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    contact_info = models.CharField(max_length=100, blank=True, null=True, verbose_name='معلومات الاتصال')
```

### Employer

نموذج جهة العمل.

```python
class Employer(models.Model):
    name = models.CharField(max_length=100, verbose_name='اسم جهة العمل')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    contact_info = models.CharField(max_length=100, blank=True, null=True, verbose_name='معلومات الاتصال')
```

### Doctor

نموذج الطبيب.

```python
class Doctor(models.Model):
    national_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الهوية')
    name = models.CharField(max_length=100, verbose_name='اسم الطبيب')
    position = models.CharField(max_length=100, verbose_name='المنصب')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctors', verbose_name='المستشفى')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
```

### Patient

نموذج المريض.

```python
class Patient(models.Model):
    national_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الهوية')
    name = models.CharField(max_length=100, verbose_name='اسم المريض')
    nationality = models.CharField(max_length=50, verbose_name='الجنسية')
    employer = models.ForeignKey(Employer, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients', verbose_name='جهة العمل')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
```

### Client

نموذج العميل.

```python
class Client(models.Model):
    name = models.CharField(max_length=100, verbose_name='اسم العميل')
    phone = models.CharField(max_length=20, unique=True, verbose_name='رقم الهاتف')
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name='البريد الإلكتروني')
    address = models.CharField(max_length=200, blank=True, null=True, verbose_name='العنوان')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
```

### LeavePrice

نموذج سعر الإجازة.

```python
class LeavePrice(models.Model):
    leave_type = models.CharField(max_length=20, choices=[('sick_leave', 'إجازة مرضية'), ('companion_leave', 'إجازة مرافق')], verbose_name='نوع الإجازة')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='السعر')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
```

### SickLeave

نموذج الإجازة المرضية.

```python
class SickLeave(models.Model):
    leave_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الإجازة')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='المريض')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='sick_leaves', verbose_name='الطبيب')
    start_date = models.DateField(verbose_name='تاريخ البداية')
    end_date = models.DateField(verbose_name='تاريخ النهاية')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    admission_date = models.DateField(verbose_name='تاريخ الدخول')
    discharge_date = models.DateField(verbose_name='تاريخ الخروج')
    issue_date = models.DateField(verbose_name='تاريخ الإصدار')
    status = models.CharField(max_length=20, choices=[
        ('active', 'نشطة'),
        ('cancelled', 'ملغية'),
        ('expired', 'منتهية')
    ], default='active', verbose_name='الحالة')
```

### CompanionLeave

نموذج إجازة المرافق.

```python
class CompanionLeave(models.Model):
    leave_id = models.CharField(max_length=20, unique=True, verbose_name='رقم الإجازة')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='companion_leaves_as_patient', verbose_name='المريض')
    companion = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='companion_leaves_as_companion', verbose_name='المرافق')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='companion_leaves', verbose_name='الطبيب')
    start_date = models.DateField(verbose_name='تاريخ البداية')
    end_date = models.DateField(verbose_name='تاريخ النهاية')
    duration_days = models.IntegerField(verbose_name='المدة بالأيام')
    admission_date = models.DateField(verbose_name='تاريخ الدخول')
    discharge_date = models.DateField(verbose_name='تاريخ الخروج')
    issue_date = models.DateField(verbose_name='تاريخ الإصدار')
    status = models.CharField(max_length=20, choices=[
        ('active', 'نشطة'),
        ('cancelled', 'ملغية'),
        ('expired', 'منتهية')
    ], default='active', verbose_name='الحالة')
```

### LeaveInvoice

نموذج فاتورة الإجازة.

```python
class LeaveInvoice(models.Model):
    invoice_number = models.CharField(max_length=20, unique=True, verbose_name='رقم الفاتورة')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='leave_invoices', verbose_name='العميل')
    leave_type = models.CharField(max_length=20, choices=[
        ('sick_leave', 'إجازة مرضية'),
        ('companion_leave', 'إجازة مرافق')
    ], verbose_name='نوع الإجازة')
    leave_id = models.CharField(max_length=20, verbose_name='رقم الإجازة')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='المبلغ')
    status = models.CharField(max_length=20, choices=[
        ('unpaid', 'غير مدفوعة'),
        ('partially_paid', 'مدفوعة جزئيًا'),
        ('paid', 'مدفوعة بالكامل'),
        ('cancelled', 'ملغية')
    ], default='unpaid', verbose_name='الحالة')
    issue_date = models.DateField(default=timezone.now, verbose_name='تاريخ الإصدار')
    due_date = models.DateField(null=True, blank=True, verbose_name='تاريخ الاستحقاق')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
```

### Payment

نموذج الدفعة.

```python
class Payment(models.Model):
    payment_number = models.CharField(max_length=20, unique=True, verbose_name='رقم الدفعة')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments', verbose_name='العميل')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='المبلغ')
    payment_method = models.CharField(max_length=20, choices=[
        ('cash', 'نقدًا'),
        ('bank_transfer', 'تحويل بنكي'),
        ('check', 'شيك'),
        ('credit_card', 'بطاقة ائتمان')
    ], verbose_name='طريقة الدفع')
    payment_date = models.DateField(default=timezone.now, verbose_name='تاريخ الدفع')
    reference_number = models.CharField(max_length=50, blank=True, null=True, verbose_name='رقم المرجع')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
```

### PaymentDetail

نموذج تفاصيل الدفعة.

```python
class PaymentDetail(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payment_details', verbose_name='الدفعة')
    invoice = models.ForeignKey(LeaveInvoice, on_delete=models.CASCADE, related_name='payment_details', verbose_name='الفاتورة')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='المبلغ')
```

## الوظائف المساعدة

### generate_unique_number

وظيفة لتوليد رقم فريد للإجازات والفواتير والمدفوعات.

```python
def generate_unique_number(prefix, model=None):
    """
    توليد رقم فريد للإجازات والفواتير والمدفوعات
    
    المعلمات:
    - prefix: بادئة الرقم (SL للإجازات المرضية، CL لإجازات المرافقين، INV للفواتير، PAY للمدفوعات)
    - model: نموذج البيانات للتحقق من عدم وجود رقم مطابق
    
    يعيد:
    - رقم فريد بالتنسيق: PREFIX-YYYYMMDD-XXXXX
    """
```

## الاختبارات

### تشغيل اختبارات الوحدة

```bash
python manage.py test
```

### تشغيل اختبار الأداء

```bash
python performance_test.py
```

## النشر على بيئة الإنتاج

### 1. تحديث ملف .env

قم بتحديث ملف `.env` بإعدادات بيئة الإنتاج:

```
# إعدادات المشروع
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# إعدادات قاعدة البيانات
DB_ENGINE=django.db.backends.mysql
DB_NAME=sclive_db
DB_USER=sclive_user
DB_PASSWORD=your-production-password
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

### 2. جمع الملفات الثابتة

```bash
python manage.py collectstatic --noinput
```

### 3. تطبيق الترحيلات

```bash
python manage.py migrate
```

### 4. تكوين Nginx

قم بنسخ ملف `nginx_config.conf` إلى `/etc/nginx/sites-available/` وإنشاء رابط رمزي إلى `/etc/nginx/sites-enabled/`:

```bash
sudo cp nginx_config.conf /etc/nginx/sites-available/sclive
sudo ln -s /etc/nginx/sites-available/sclive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. تكوين Gunicorn

قم بنسخ ملف `sclive.service` إلى `/etc/systemd/system/`:

```bash
sudo cp sclive.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start sclive
sudo systemctl enable sclive
```

## الصيانة

### النسخ الاحتياطي لقاعدة البيانات

```bash
mysqldump -u sclive_user -p sclive_db > backup_$(date +%Y%m%d).sql
```

### استعادة قاعدة البيانات

```bash
mysql -u sclive_user -p sclive_db < backup_file.sql
```

### تحديث النظام

```bash
# تحديث الكود من Git
git pull

# تفعيل البيئة الافتراضية
source .venv/bin/activate

# تحديث المتطلبات
uv pip install -r requirements.txt

# تطبيق الترحيلات
python manage.py migrate

# جمع الملفات الثابتة
python manage.py collectstatic --noinput

# إعادة تشغيل الخدمة
sudo systemctl restart sclive
```

## المساهمة في المشروع

### 1. إنشاء فرع جديد

```bash
git checkout -b feature/your-feature-name
```

### 2. تطوير الميزة

قم بتطوير الميزة الجديدة وإضافة اختبارات لها.

### 3. تشغيل الاختبارات

```bash
python manage.py test
```

### 4. إرسال طلب السحب

قم بدفع التغييرات إلى المستودع وإنشاء طلب سحب.

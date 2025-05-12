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

## الترخيص

هذا المشروع مرخص بموجب رخصة MIT.

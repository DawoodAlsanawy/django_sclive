# وحدة المشروع الرئيسية (sclive)

## نظرة عامة

وحدة `sclive` هي الوحدة الرئيسية لمشروع Django الذي يبدو أنه نظام لإدارة الإجازات والموارد البشرية. هذه الوحدة تحتوي على الإعدادات الأساسية والتكوينات اللازمة لتشغيل التطبيق. تعمل كنقطة دخول رئيسية للمشروع وتحتوي على ملفات التكوين الأساسية.

## المكونات الرئيسية

### 1. ملف الإعدادات (settings.py)

ملف `settings.py` هو ملف التكوين الرئيسي للمشروع ويحتوي على جميع إعدادات Django. يتضمن:

#### إعدادات الأمان
- **المفتاح السري (SECRET_KEY)**: يتم تحميله من متغيرات البيئة لتعزيز الأمان.
- **وضع التصحيح (DEBUG)**: يتم تعيينه بناءً على متغيرات البيئة، مع تعطيله في بيئة الإنتاج.
- **المضيفين المسموح بهم (ALLOWED_HOSTS)**: قائمة بالمضيفين المسموح لهم بالوصول إلى التطبيق.

#### التطبيقات المثبتة
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    'ai_leaves.apps.AiLeavesConfig',  # تطبيق طلبات الإجازات الذكية
    'crispy_forms',
    'crispy_bootstrap4',
    'django_filters',
]
```

#### البرامج الوسيطة (Middleware)
تتضمن البرامج الوسيطة القياسية لـ Django بالإضافة إلى:
- `GZipMiddleware` لضغط الاستجابات
- `WhiteNoiseMiddleware` في بيئة الإنتاج لخدمة الملفات الثابتة بكفاءة

#### إعدادات قاعدة البيانات
يستخدم المشروع قاعدة بيانات MySQL مع إعدادات مخصصة لتحسين الأداء:
- تكوين الاتصال للبقاء مفتوحًا لمدة 60 ثانية
- تعطيل الطلبات الذرية لتحسين الأداء
- تمكين الالتزام التلقائي

#### إعدادات الملفات الثابتة والوسائط
```python
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

#### تكوين المصادقة
- يستخدم نموذج مستخدم مخصص: `core.User`
- تكوين URLs للدخول والخروج وإعادة التوجيه

#### تكوين Sentry لمراقبة الأخطاء
يتم تكوين Sentry في بيئة الإنتاج لتتبع الأخطاء وأداء التطبيق.

#### نظام تسجيل الأحداث
تكوين شامل لنظام تسجيل الأحداث مع:
- تنسيقات مختلفة للسجلات
- معالجات متعددة (وحدة التحكم، ملف، بريد إلكتروني، Sentry)
- مستويات تسجيل مخصصة لمكونات مختلفة

### 2. ملف عناوين URL (urls.py)

ملف `urls.py` يحدد جميع مسارات URL المتاحة في التطبيق:

#### المسارات الرئيسية
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('ai-leaves/', include('ai_leaves.urls')),  # مسارات طلبات الإجازات الذكية
    
    # مسارات المصادقة
    path('login/', auth_views.LoginView.as_view(
        template_name='core/auth/login.html',
        authentication_form=LoginForm
    ), name='login'),
    path('register/', register, name='register'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('password_change/', password_change, name='password_change'),
    path('password_change/done/', auth_views.PasswordChangeDoneView.as_view(
        template_name='core/auth/password_change_done.html'
    ), name='password_change_done'),
]
```

#### مسارات الملفات الثابتة في وضع التطوير
```python
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 3. ملف WSGI (wsgi.py)

ملف `wsgi.py` يكوّن نقطة الدخول لخادم WSGI:
```python
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings')
application = get_wsgi_application()
```

### 4. ملف ASGI (asgi.py)

ملف `asgi.py` يكوّن نقطة الدخول لخادم ASGI، مما يسمح بدعم البروتوكولات غير المتزامنة:
```python
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings')
application = get_asgi_application()
```

### 5. ملف __init__.py

ملف فارغ يشير إلى أن الدليل هو حزمة Python.

## العلاقة مع المكونات الأخرى

### التطبيقات المرتبطة

1. **تطبيق core**:
   - يبدو أنه التطبيق الرئيسي الذي يحتوي على نموذج المستخدم المخصص والوظائف الأساسية.
   - يتم تضمين مساراته في المسار الجذر للتطبيق.

2. **تطبيق ai_leaves**:
   - يبدو أنه تطبيق متخصص لإدارة طلبات الإجازات باستخدام الذكاء الاصطناعي.
   - يتم تضمين مساراته تحت المسار `/ai-leaves/`.

### المكتبات الخارجية

1. **crispy_forms و crispy_bootstrap4**:
   - تستخدم لتحسين عرض النماذج في واجهة المستخدم.

2. **django_filters**:
   - يستخدم لتوفير وظائف تصفية وبحث متقدمة.

3. **sentry_sdk**:
   - يستخدم لمراقبة الأخطاء وتتبع الأداء في بيئة الإنتاج.

4. **whitenoise**:
   - يستخدم في بيئة الإنتاج لخدمة الملفات الثابتة بكفاءة.

5. **dotenv**:
   - يستخدم لتحميل متغيرات البيئة من ملف `.env`.

## ميزات الأمان والأداء

### تحسينات الأمان
- استخدام متغيرات البيئة للمعلومات الحساسة
- تكوين مدققات كلمة المرور
- تعطيل وضع التصحيح في بيئة الإنتاج

### تحسينات الأداء
- ضغط الاستجابات باستخدام GZipMiddleware
- تخزين مؤقت للقوالب في بيئة الإنتاج
- تخزين مؤقت للجلسات
- تحسينات اتصال قاعدة البيانات

## الخلاصة

وحدة `sclive` هي العمود الفقري للمشروع، حيث توفر التكوين الأساسي والإعدادات اللازمة لتشغيل التطبيق. تتضمن إعدادات متقدمة للأمان والأداء، وتدمج مكونات مختلفة من المشروع في نظام متكامل.

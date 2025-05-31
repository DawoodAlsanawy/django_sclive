"""
ملف تكوين Gunicorn لمشروع نظام إدارة الإجازات المرضية
"""

import multiprocessing

# عدد العمليات المتزامنة (عادة ما يكون عدد النوى المتاحة * 2 + 1)
workers = multiprocessing.cpu_count() * 2 + 1

# نوع العمال (استخدم 'sync' للتبسيط، أو 'gevent' للأداء العالي)
worker_class = 'sync'

# المدة القصوى التي يمكن أن يستغرقها العامل لمعالجة الطلب (بالثواني)
timeout = 120

# عنوان IP والمنفذ للاستماع
bind = '0.0.0.0:8000'

# مستوى السجل
loglevel = 'info'

# ملف السجل
accesslog = 'logs/gunicorn-access.log'
errorlog = 'logs/gunicorn-error.log'

# تمكين إعادة تحميل التلقائي عند تغيير الكود (للتطوير فقط)
reload = False

# الحد الأقصى لعدد الطلبات التي يمكن معالجتها قبل إعادة تشغيل العامل
max_requests = 1000
max_requests_jitter = 50

# تمكين ضغط HTTP
forwarded_allow_ips = '*'

# تكوين الرأس الحقيقي للعميل
secure_scheme_headers = {
    'X-FORWARDED-PROTO': 'https',
}

# تكوين الرأس الحقيقي للعميل
proxy_protocol = True

# تكوين الرأس الحقيقي للعميل
proxy_allow_ips = '*'

# تكوين الرأس الحقيقي للعميل
forwarded_allow_ips = '*'

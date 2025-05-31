#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Django WSGI Application for Namecheap Deployment
نظام إدارة الإجازات المرضية - ملف WSGI للنشر على Namecheap
"""

import os
import sys
import django
from django.core.wsgi import get_wsgi_application

# ========================================
# إعدادات المسارات (Path Configuration)
# ========================================

# الحصول على اسم المستخدم من cPanel
# يجب تغيير 'cpanel_username' إلى اسم المستخدم الفعلي
CPANEL_USERNAME = 'cpanel_username'  # غير هذا إلى اسم المستخدم الخاص بك

# إعداد مسارات المشروع
PROJECT_ROOT = f'/home/{CPANEL_USERNAME}/public_html/sclive'
DJANGO_ROOT = f'/home/{CPANEL_USERNAME}/public_html/sclive/sclive'

# إضافة المسارات إلى Python path
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

if DJANGO_ROOT not in sys.path:
    sys.path.insert(0, DJANGO_ROOT)

# إضافة مسار site-packages للمستخدم
USER_SITE_PACKAGES = f'/home/{CPANEL_USERNAME}/.local/lib/python3.8/site-packages'
if USER_SITE_PACKAGES not in sys.path:
    sys.path.insert(0, USER_SITE_PACKAGES)

# ========================================
# إعدادات البيئة (Environment Settings)
# ========================================

# تعيين متغيرات البيئة
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings')

# تعيين مسار ملف .env
ENV_FILE = os.path.join(PROJECT_ROOT, '.env')
if os.path.exists(ENV_FILE):
    from dotenv import load_dotenv
    load_dotenv(ENV_FILE)

# ========================================
# إعدادات Django (Django Configuration)
# ========================================

try:
    # تهيئة Django
    django.setup()
    
    # الحصول على تطبيق WSGI
    application = get_wsgi_application()
    
except Exception as e:
    # في حالة حدوث خطأ، إنشاء تطبيق WSGI بسيط لعرض الخطأ
    def application(environ, start_response):
        status = '500 Internal Server Error'
        headers = [
            ('Content-Type', 'text/html; charset=utf-8'),
            ('Cache-Control', 'no-cache, no-store, must-revalidate'),
        ]
        start_response(status, headers)
        
        error_html = f"""
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>خطأ في الخادم - نظام إدارة الإجازات المرضية</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }}
                .error-container {{
                    background: white;
                    border-radius: 10px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 600px;
                    text-align: center;
                }}
                .error-icon {{
                    font-size: 64px;
                    color: #e74c3c;
                    margin-bottom: 20px;
                }}
                .error-title {{
                    color: #2c3e50;
                    font-size: 28px;
                    margin-bottom: 15px;
                }}
                .error-message {{
                    color: #7f8c8d;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }}
                .error-details {{
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: right;
                    font-family: monospace;
                    font-size: 14px;
                    color: #495057;
                    overflow-x: auto;
                }}
                .contact-info {{
                    background: #e8f4fd;
                    border: 1px solid #bee5eb;
                    border-radius: 5px;
                    padding: 15px;
                    margin-top: 20px;
                }}
                .btn {{
                    display: inline-block;
                    padding: 10px 20px;
                    background: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 5px;
                    transition: background 0.3s;
                }}
                .btn:hover {{
                    background: #2980b9;
                }}
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h1 class="error-title">خطأ في إعداد الخادم</h1>
                <p class="error-message">
                    عذراً، حدث خطأ أثناء تحميل نظام إدارة الإجازات المرضية.
                    يرجى التحقق من إعدادات الخادم والمحاولة مرة أخرى.
                </p>
                
                <div class="error-details">
                    <strong>تفاصيل الخطأ:</strong><br>
                    {str(e)}
                </div>
                
                <div class="contact-info">
                    <h3>خطوات استكشاف الأخطاء:</h3>
                    <ul style="text-align: right; display: inline-block;">
                        <li>تحقق من صحة ملف .env</li>
                        <li>تأكد من تثبيت جميع المتطلبات</li>
                        <li>تحقق من إعدادات قاعدة البيانات</li>
                        <li>راجع ملف error_log في cPanel</li>
                        <li>تأكد من صحة مسارات Python</li>
                    </ul>
                </div>
                
                <a href="/" class="btn">إعادة المحاولة</a>
                <a href="/admin/" class="btn">لوحة الإدارة</a>
            </div>
        </body>
        </html>
        """.encode('utf-8')
        
        return [error_html]

# ========================================
# معلومات إضافية للتشخيص
# ========================================

def get_system_info():
    """الحصول على معلومات النظام للتشخيص"""
    import platform
    import django
    
    info = {
        'python_version': platform.python_version(),
        'django_version': django.get_version(),
        'platform': platform.platform(),
        'project_root': PROJECT_ROOT,
        'django_root': DJANGO_ROOT,
        'python_path': sys.path[:5],  # أول 5 مسارات فقط
        'environment_variables': {
            'DJANGO_SETTINGS_MODULE': os.environ.get('DJANGO_SETTINGS_MODULE'),
            'DEBUG': os.environ.get('DEBUG'),
            'DATABASE_URL': os.environ.get('DATABASE_URL', 'Not Set')[:50] + '...' if os.environ.get('DATABASE_URL') else 'Not Set',
        }
    }
    return info

# ========================================
# تطبيق WSGI للتشخيص (اختياري)
# ========================================

def debug_application(environ, start_response):
    """تطبيق WSGI للتشخيص - يُستخدم فقط للاختبار"""
    if environ.get('PATH_INFO') == '/debug/':
        status = '200 OK'
        headers = [('Content-Type', 'application/json; charset=utf-8')]
        start_response(status, headers)
        
        import json
        debug_info = get_system_info()
        return [json.dumps(debug_info, indent=2, ensure_ascii=False).encode('utf-8')]
    
    # إعادة توجيه للتطبيق الرئيسي
    return application(environ, start_response)

# ========================================
# تصدير التطبيق
# ========================================

# للاستخدام في الإنتاج
# application = application

# للاستخدام في التطوير/التشخيص (قم بإلغاء التعليق عند الحاجة)
# application = debug_application

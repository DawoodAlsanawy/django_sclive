#!/usr/bin/env python
"""
أداة إدارة الملفات الثابتة لمشروع Django
تساعد في حل مشاكل الملفات الثابتة عند تحويل DEBUG إلى False
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.conf import settings

def setup_django():
    """إعداد Django للاستخدام"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings')
    django.setup()

def collect_static():
    """جمع الملفات الثابتة"""
    print("🔄 جاري جمع الملفات الثابتة...")
    try:
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
        print("✅ تم جمع الملفات الثابتة بنجاح")
        return True
    except Exception as e:
        print(f"❌ خطأ في جمع الملفات الثابتة: {e}")
        return False

def clear_static():
    """مسح الملفات الثابتة المجمعة"""
    print("🗑️ جاري مسح الملفات الثابتة...")
    try:
        execute_from_command_line(['manage.py', 'collectstatic', '--clear', '--noinput'])
        print("✅ تم مسح الملفات الثابتة بنجاح")
        return True
    except Exception as e:
        print(f"❌ خطأ في مسح الملفات الثابتة: {e}")
        return False

def check_static_files():
    """فحص الملفات الثابتة المطلوبة"""
    print("🔍 جاري فحص الملفات الثابتة...")
    
    required_files = [
        'js/modal_forms.js',
        'css/tailwind.min.css',
        'images/header_updated.png',
        'images/body-image-updated.png',
        'images/National_center_for_midical.png',
        'fonts/calibri-regular.ttf',
        'fonts/calibri-Bold.ttf',
        'fonts/calibri-italic.ttf',
        'fonts/calibri-bold-italic.ttf',
    ]
    
    missing_files = []
    
    for file_path in required_files:
        # فحص في STATICFILES_DIRS
        found = False
        for static_dir in settings.STATICFILES_DIRS:
            full_path = os.path.join(static_dir, file_path)
            if os.path.exists(full_path):
                found = True
                break
        
        if not found:
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ الملفات الثابتة المفقودة:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    else:
        print("✅ جميع الملفات الثابتة المطلوبة موجودة")
        return True

def create_missing_js():
    """إنشاء ملف JS مفقود إذا لم يكن موجوداً"""
    js_file = os.path.join(settings.STATICFILES_DIRS[0], 'js', 'modal_forms.js')
    
    if not os.path.exists(js_file):
        print("📝 إنشاء ملف modal_forms.js...")
        
        # إنشاء المجلد إذا لم يكن موجوداً
        os.makedirs(os.path.dirname(js_file), exist_ok=True)
        
        # محتوى أساسي للملف
        js_content = """
// Modal Forms JavaScript
// ملف JavaScript للنماذج المنبثقة

document.addEventListener('DOMContentLoaded', function() {
    console.log('Modal forms script loaded');
    
    // إضافة وظائف أساسية للنماذج المنبثقة
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }
    });
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});
"""
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print(f"✅ تم إنشاء {js_file}")
        return True
    
    return False

def main():
    """الدالة الرئيسية"""
    print("🚀 أداة إدارة الملفات الثابتة لمشروع Django")
    print("=" * 50)
    
    # إعداد Django
    setup_django()
    
    # فحص الملفات المطلوبة
    check_static_files()
    
    # إنشاء الملفات المفقودة
    create_missing_js()
    
    # مسح الملفات القديمة
    clear_static()
    
    # جمع الملفات الثابتة
    if collect_static():
        print("\n✅ تم إعداد الملفات الثابتة بنجاح!")
        print("يمكنك الآن تحويل DEBUG إلى False")
    else:
        print("\n❌ فشل في إعداد الملفات الثابتة")
        print("يرجى مراجعة الأخطاء أعلاه")

if __name__ == '__main__':
    main()

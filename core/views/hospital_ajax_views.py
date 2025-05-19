from django.http import JsonResponse
from django.views.decorators.http import require_POST

from core.models import Hospital


@require_POST
def hospital_create_ajax(request):
    """
    إنشاء مستشفى جديد عبر AJAX.
    """
    try:
        # الحصول على بيانات النموذج
        name = request.POST.get('name')
        address = request.POST.get('address', '')
        contact_info = request.POST.get('contact_info', '')
        logo = request.FILES.get('logo')

        # التحقق من البيانات المطلوبة
        if not name:
            return JsonResponse({
                'success': False,
                'message': 'يرجى ملء جميع الحقول المطلوبة',
                'errors': {
                    'name': ['هذا الحقل مطلوب']
                }
            })

        # التحقق مما إذا كان هناك مستشفى بنفس الاسم
        if Hospital.objects.filter(name=name).exists():
            return JsonResponse({
                'success': False,
                'message': 'يوجد مستشفى بنفس الاسم',
                'errors': {
                    'name': ['يوجد مستشفى بنفس الاسم']
                }
            })

        # التحقق من صحة ملف الشعار
        if logo:
            # التحقق من نوع الملف
            if not logo.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                return JsonResponse({
                    'success': False,
                    'message': 'يجب أن يكون الشعار بصيغة PNG أو JPG أو JPEG أو GIF',
                    'errors': {
                        'logo': ['يجب أن يكون الشعار بصيغة PNG أو JPG أو JPEG أو GIF']
                    }
                })

            # التحقق من حجم الملف (أقل من 2 ميجابايت)
            if logo.size > 2 * 1024 * 1024:
                return JsonResponse({
                    'success': False,
                    'message': 'يجب أن يكون حجم الشعار أقل من 2 ميجابايت',
                    'errors': {
                        'logo': ['يجب أن يكون حجم الشعار أقل من 2 ميجابايت']
                    }
                })

        # إنشاء المستشفى
        hospital = Hospital(
            name=name,
            address=address,
            contact_info=contact_info,
            logo=logo
        )
        # استخدام دالة save() لتفعيل الترجمة التلقائية
        hospital.save()

        # إرجاع استجابة ناجحة
        return JsonResponse({
            'success': True,
            'message': 'تم إضافة المستشفى بنجاح',
            'object_id': hospital.id,
            'object_text': hospital.name
        })

    except Exception as e:
        # معالجة الأخطاء
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}',
            'errors': {}
        })

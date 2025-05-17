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

        # إنشاء المستشفى
        hospital = Hospital.objects.create(
            name=name,
            address=address,
            contact_info=contact_info
        )

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

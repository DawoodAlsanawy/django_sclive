from django.http import JsonResponse
from django.views.decorators.http import require_POST

from core.models import Client


@require_POST
def client_create_ajax(request):
    """
    إنشاء عميل جديد عبر AJAX.
    """
    try:
        # الحصول على بيانات النموذج
        name = request.POST.get('name')
        phone = request.POST.get('phone', '')
        email = request.POST.get('email', '')
        address = request.POST.get('address', '')
        notes = request.POST.get('notes', '')

        # التحقق من البيانات المطلوبة
        if not name:
            return JsonResponse({
                'success': False,
                'message': 'يرجى ملء جميع الحقول المطلوبة',
                'errors': {
                    'name': ['هذا الحقل مطلوب']
                }
            })

        # التحقق مما إذا كان هناك عميل بنفس رقم الهاتف
        if phone and Client.objects.filter(phone=phone).exists():
            return JsonResponse({
                'success': False,
                'message': 'يوجد عميل بنفس رقم الهاتف',
                'errors': {
                    'phone': ['يوجد عميل بنفس رقم الهاتف']
                }
            })

        # إنشاء العميل
        client = Client.objects.create(
            name=name,
            phone=phone,
            email=email,
            address=address,
            notes=notes
        )

        # إرجاع استجابة ناجحة
        return JsonResponse({
            'success': True,
            'message': 'تم إضافة العميل بنجاح',
            'object_id': client.id,
            'object_text': client.name
        })

    except Exception as e:
        # معالجة الأخطاء
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}',
            'errors': {}
        })

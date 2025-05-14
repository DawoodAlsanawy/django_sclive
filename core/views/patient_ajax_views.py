from django.http import JsonResponse
from django.views.decorators.http import require_POST

from core.models import Patient


@require_POST
def patient_create_ajax(request):
    """
    إنشاء مريض جديد عبر AJAX.
    """
    try:
        # الحصول على بيانات النموذج
        national_id = request.POST.get('national_id')
        name = request.POST.get('name')
        phone = request.POST.get('phone', '')
        employer_name = request.POST.get('employer_name', '')
        address = request.POST.get('address', '')
        nationality = request.POST.get('nationality', '')
        email = request.POST.get('email', '')

        # التحقق من البيانات المطلوبة
        if not national_id or not name:
            return JsonResponse({
                'success': False,
                'message': 'يرجى ملء جميع الحقول المطلوبة',
                'errors': {
                    'national_id': ['هذا الحقل مطلوب'] if not national_id else [],
                    'name': ['هذا الحقل مطلوب'] if not name else []
                }
            })

        # التحقق مما إذا كان هناك مريض بنفس رقم الهوية
        if Patient.objects.filter(national_id=national_id).exists():
            return JsonResponse({
                'success': False,
                'message': 'يوجد مريض بنفس رقم الهوية',
                'errors': {
                    'national_id': ['يوجد مريض بنفس رقم الهوية']
                }
            })

        # إنشاء المريض
        patient = Patient.objects.create(
            national_id=national_id,
            name=name,
            phone=phone,
            employer_name=employer_name,
            address=address,
            nationality=nationality,
            email=email
        )

        # إرجاع استجابة ناجحة
        return JsonResponse({
            'success': True,
            'message': 'تم إضافة المريض بنجاح',
            'object_id': patient.id,
            'object_text': patient.name
        })

    except Exception as e:
        # معالجة الأخطاء
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}',
            'errors': {}
        })

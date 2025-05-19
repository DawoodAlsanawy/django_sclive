from django.http import JsonResponse
from django.views.decorators.http import require_POST

from core.models import Patient


@require_POST
def companion_create_ajax(request):
    """
    إنشاء مرافق جديد عبر AJAX.
    """
    try:
        # الحصول على بيانات النموذج
        national_id = request.POST.get('national_id')
        name = request.POST.get('name')
        phone = request.POST.get('phone', '')
        relation = request.POST.get('relation', '')  # نحتفظ بهذا الحقل للتوثيق فقط
        employer_name = request.POST.get('employer_name', '')
        address = request.POST.get('address', '')
        nationality = request.POST.get('nationality', '')

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

        # التحقق مما إذا كان هناك مرافق بنفس رقم الهوية
        if Patient.objects.filter(national_id=national_id).exists():
            return JsonResponse({
                'success': False,
                'message': 'يوجد مرافق بنفس رقم الهوية',
                'errors': {
                    'national_id': ['يوجد مرافق بنفس رقم الهوية']
                }
            })

        # إنشاء المرافق (المرافق هو مريض في النظام)
        # تخزين صلة القرابة في حقل الملاحظات
        notes = f"علاقة المرافق: {relation}" if relation else ""

        companion = Patient(
            national_id=national_id,
            name=name,
            phone=phone,
            employer_name=employer_name,
            address=address,
            nationality=nationality,
            notes=notes
        )
        # استخدام دالة save() لتفعيل الترجمة التلقائية
        companion.save()

        # إرجاع استجابة ناجحة
        return JsonResponse({
            'success': True,
            'message': 'تم إضافة المرافق بنجاح',
            'object_id': companion.id,
            'object_text': companion.name,
            'relation': relation  # إرجاع العلاقة في الاستجابة للاستخدام في واجهة المستخدم
        })

    except Exception as e:
        # معالجة الأخطاء
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}',
            'errors': {}
        })

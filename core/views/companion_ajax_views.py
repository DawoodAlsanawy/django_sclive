from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from core.models import Patient
from core.utils import translate_text


@login_required
@require_POST
def companion_create_ajax(request):
    """
    إنشاء مرافق جديد عبر AJAX.
    ملاحظة: المرافقون يتم تخزينهم كمرضى في نموذج Patient
    """
    try:
        # الحصول على بيانات النموذج
        national_id = request.POST.get('national_id')
        name = request.POST.get('name')
        name_en = request.POST.get('name_en', '')
        phone = request.POST.get('phone', '')
        relation = request.POST.get('relation', '')  # سيتم تخزينها في ملاحظات أو معالجتها بشكل منفصل
        # ملاحظة: relation_en غير مستخدم حاليًا لأن نموذج Patient لا يحتوي على هذا الحقل
        employer_name = request.POST.get('employer_name', '')
        employer_name_en = request.POST.get('employer_name_en', '')
        address = request.POST.get('address', '')
        address_en = request.POST.get('address_en', '')
        nationality = request.POST.get('nationality', '')
        nationality_en = request.POST.get('nationality_en', '')

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
            # تحديث بيانات المرافق الموجود
            companion = Patient.objects.get(national_id=national_id)
            companion.name = name
            if name_en:
                companion.name_en = name_en
            if phone:
                companion.phone = phone
            if employer_name:
                companion.employer_name = employer_name
            if employer_name_en:
                companion.employer_name_en = employer_name_en
            if address:
                companion.address = address
            if address_en:
                companion.address_en = address_en
            if nationality:
                companion.nationality = nationality
            if nationality_en:
                companion.nationality_en = nationality_en
            companion.save()

            return JsonResponse({
                'success': True,
                'message': 'تم تحديث بيانات المرافق بنجاح',
                'object_id': companion.id,
                'object_text': companion.name,
                'relation': relation  # إرجاع العلاقة للاستخدام في الواجهة
            })

        # إنشاء المرافق الجديد (كمريض)
        companion = Patient(
            national_id=national_id,
            name=name,
            name_en=name_en or translate_text(name) if name else '',
            phone=phone,
            employer_name=employer_name,
            employer_name_en=employer_name_en or translate_text(employer_name) if employer_name else '',
            address=address,
            address_en=address_en or translate_text(address) if address else '',
            nationality=nationality,
            nationality_en=nationality_en or translate_text(nationality) if nationality else ''
        )
        # استخدام دالة save() لتفعيل الترجمة التلقائية
        companion.save()

        # إرجاع استجابة ناجحة
        return JsonResponse({
            'success': True,
            'message': 'تم إضافة المرافق بنجاح',
            'object_id': companion.id,
            'object_text': companion.name,
            'relation': relation  # إرجاع العلاقة للاستخدام في الواجهة
        })

    except Exception as e:
        # معالجة الأخطاء
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}',
            'errors': {}
        })


@login_required
def get_companion_data(request, companion_id):
    """الحصول على بيانات المرافق للتعديل"""
    try:
        companion = Patient.objects.get(id=companion_id)
        return JsonResponse({
            'success': True,
            'companion': {
                'id': companion.id,
                'national_id': companion.national_id,
                'name': companion.name,
                'name_en': companion.name_en,
                'phone': companion.phone,
                'nationality': companion.nationality,
                'nationality_en': companion.nationality_en,
                'employer_name': companion.employer_name,
                'employer_name_en': companion.employer_name_en,
                'address': companion.address,
                'address_en': companion.address_en
            }
        })
    except Patient.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'المرافق غير موجود'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }, status=500)


@login_required
@csrf_exempt
@require_POST
def update_companion_ajax(request, companion_id):
    """تحديث بيانات المرافق عبر AJAX"""
    try:
        companion = Patient.objects.get(id=companion_id)

        # تحديث البيانات
        companion.national_id = request.POST.get('national_id', companion.national_id)
        companion.name = request.POST.get('name', companion.name)
        companion.name_en = request.POST.get('name_en', companion.name_en)
        companion.phone = request.POST.get('phone', companion.phone)
        companion.nationality = request.POST.get('nationality', companion.nationality)
        companion.nationality_en = request.POST.get('nationality_en', companion.nationality_en)
        companion.employer_name = request.POST.get('employer_name', companion.employer_name)
        companion.employer_name_en = request.POST.get('employer_name_en', companion.employer_name_en)
        companion.address = request.POST.get('address', companion.address)
        companion.address_en = request.POST.get('address_en', companion.address_en)

        companion.save()

        return JsonResponse({
            'success': True,
            'message': 'تم تحديث بيانات المرافق بنجاح',
            'object_id': companion.id,
            'object_text': companion.name
        })
    except Patient.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'المرافق غير موجود'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }, status=500)

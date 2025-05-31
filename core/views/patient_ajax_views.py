from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from core.models import Patient
from core.utils import translate_text


@login_required
@require_POST
def patient_create_ajax(request):
    """
    إنشاء مريض جديد عبر AJAX.
    """
    try:
        # الحصول على بيانات النموذج
        national_id = request.POST.get('national_id')
        name = request.POST.get('name')
        name_en = request.POST.get('name_en', '')
        phone = request.POST.get('phone', '')
        employer_name = request.POST.get('employer_name', '')
        employer_name_en = request.POST.get('employer_name_en', '')
        address = request.POST.get('address', '')
        address_en = request.POST.get('address_en', '')
        nationality = request.POST.get('nationality', '')
        nationality_en = request.POST.get('nationality_en', '')
        email = request.POST.get('email', '')

        # التحقق من البيانات المطلوبة
        if not name:
            return JsonResponse({
                'success': False,
                'message': 'يرجى ملء اسم المريض',
                'errors': {
                    'name': ['هذا الحقل مطلوب'] if not name else []
                }
            })

        # التحقق مما إذا كان هناك مريض بنفس رقم الهوية (فقط إذا تم إدخال رقم هوية)
        if national_id and Patient.objects.filter(national_id=national_id).exists():
            # تحديث بيانات المريض الموجود
            patient = Patient.objects.get(national_id=national_id)
            patient.name = name
            if name_en:
                patient.name_en = name_en
            if phone:
                patient.phone = phone
            if employer_name:
                patient.employer_name = employer_name
            if employer_name_en:
                patient.employer_name_en = employer_name_en
            if address:
                patient.address = address
            if address_en:
                patient.address_en = address_en
            if nationality:
                patient.nationality = nationality
            if nationality_en:
                patient.nationality_en = nationality_en
            if email:
                patient.email = email
            patient.save()

            return JsonResponse({
                'success': True,
                'message': 'تم تحديث بيانات المريض بنجاح',
                'object_id': patient.id,
                'object_text': patient.name
            })

        # إنشاء المريض
        patient = Patient(
            national_id=national_id,
            name=name,
            name_en=name_en,
            phone=phone,
            employer_name=employer_name,
            employer_name_en=employer_name_en,
            address=address,
            address_en=address_en,
            nationality=nationality,
            nationality_en=nationality_en,
            email=email
        )
        # استخدام دالة save() لتفعيل الترجمة التلقائية
        patient.save()

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


@login_required
def get_patient_data(request, patient_id):
    """الحصول على بيانات المريض للتعديل"""
    try:
        patient = Patient.objects.get(id=patient_id)
        return JsonResponse({
            'success': True,
            'patient': {
                'id': patient.id,
                'national_id': patient.national_id,
                'name': patient.name,
                'name_en': patient.name_en,
                'phone': patient.phone,
                'nationality': patient.nationality,
                'nationality_en': patient.nationality_en,
                'employer_name': patient.employer_name,
                'employer_name_en': patient.employer_name_en,
                'address': patient.address,
                'address_en': patient.address_en,
                'email': patient.email
            }
        })
    except Patient.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'المريض غير موجود'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }, status=500)


@login_required
@csrf_exempt
@require_POST
def update_patient_ajax(request, patient_id):
    """تحديث بيانات المريض عبر AJAX"""
    try:
        patient = Patient.objects.get(id=patient_id)

        # تحديث البيانات
        patient.national_id = request.POST.get('national_id', patient.national_id)
        patient.name = request.POST.get('name', patient.name)
        patient.name_en = request.POST.get('name_en', patient.name_en)
        patient.phone = request.POST.get('phone', patient.phone)
        patient.nationality = request.POST.get('nationality', patient.nationality)
        patient.nationality_en = request.POST.get('nationality_en', patient.nationality_en)
        patient.employer_name = request.POST.get('employer_name', patient.employer_name)
        patient.employer_name_en = request.POST.get('employer_name_en', patient.employer_name_en)
        patient.address = request.POST.get('address', patient.address)
        patient.address_en = request.POST.get('address_en', patient.address_en)
        patient.email = request.POST.get('email', patient.email)

        patient.save()

        return JsonResponse({
            'success': True,
            'message': 'تم تحديث بيانات المريض بنجاح',
            'object_id': patient.id,
            'object_text': patient.name
        })
    except Patient.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'المريض غير موجود'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }, status=500)

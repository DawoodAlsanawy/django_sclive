from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from core.forms import HospitalForm
from core.models import Doctor, Hospital
from core.utils import translate_text


@login_required
@require_POST
def hospital_create_ajax(request):
    """إنشاء مستشفى جديد عبر AJAX"""
    try:
        # الحصول على بيانات النموذج
        name = request.POST.get('name')
        name_en = request.POST.get('name_en', '')
        address = request.POST.get('address', '')
        address_en = request.POST.get('address_en', '')
        contact_info = request.POST.get('contact_info', '')

        # التحقق من البيانات المطلوبة
        if not name:
            return JsonResponse({
                'success': False,
                'message': 'يرجى ملء اسم المستشفى',
                'errors': {
                    'name': ['هذا الحقل مطلوب']
                }
            })

        # إنشاء المستشفى
        hospital = Hospital(
            name=name,
            name_en=name_en or translate_text(name),
            address=address,
            address_en=address_en or translate_text(address),
            contact_info=contact_info
        )
        hospital.save()

        # التحقق مما إذا تم إرسال معرف الدكتور
        doctor_id = request.POST.get('doctor_id')
        if doctor_id:
            try:
                doctor = Doctor.objects.get(id=doctor_id)
                # إضافة المستشفى إلى قائمة مستشفيات الدكتور
                doctor.hospitals.add(hospital)
                doctor.save()
            except Doctor.DoesNotExist:
                pass  # تجاهل إذا لم يتم العثور على الدكتور

        # إعداد الاستجابة
        response_data = {
            'success': True,
            'message': f'تم إنشاء المستشفى {hospital.name} بنجاح',
            'object_id': hospital.id,
            'object_text': hospital.name
        }

        # إضافة معلومات إضافية إذا تم ربط المستشفى بطبيب
        if doctor_id:
            try:
                doctor = Doctor.objects.get(id=doctor_id)
                response_data['doctor_name'] = doctor.name
                response_data['doctor_id'] = doctor.id
            except Doctor.DoesNotExist:
                pass

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}',
            'errors': {}
        })


@login_required
def get_hospital_data(request, hospital_id):
    """الحصول على بيانات المستشفى للتعديل"""
    try:
        hospital = Hospital.objects.get(id=hospital_id)
        return JsonResponse({
            'success': True,
            'hospital': {
                'id': hospital.id,
                'name': hospital.name,
                'name_en': hospital.name_en,
                'address': hospital.address,
                'address_en': hospital.address_en,
                'contact_info': hospital.contact_info,
                'logo': hospital.logo.url if hospital.logo else None
            }
        })
    except Hospital.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'المستشفى غير موجود'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }, status=500)


@login_required
@csrf_exempt
@require_POST
def update_hospital_ajax(request, hospital_id):
    """تحديث بيانات المستشفى عبر AJAX"""
    try:
        hospital = Hospital.objects.get(id=hospital_id)

        # تحديث البيانات
        hospital.name = request.POST.get('name', hospital.name)
        hospital.name_en = request.POST.get('name_en', hospital.name_en)
        hospital.address = request.POST.get('address', hospital.address)
        hospital.address_en = request.POST.get('address_en', hospital.address_en)
        hospital.contact_info = request.POST.get('contact_info', hospital.contact_info)

        hospital.save()

        return JsonResponse({
            'success': True,
            'message': 'تم تحديث بيانات المستشفى بنجاح',
            'object_id': hospital.id,
            'object_text': hospital.name
        })
    except Hospital.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'المستشفى غير موجود'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }, status=500)

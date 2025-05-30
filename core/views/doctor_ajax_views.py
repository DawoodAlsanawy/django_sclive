from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from core.models import Doctor, Hospital
from core.utils import translate_text


@login_required
@require_POST
def doctor_create_ajax(request):
    """
    إنشاء طبيب جديد عبر AJAX.
    """
    try:
        # الحصول على بيانات النموذج
        national_id = request.POST.get('national_id')
        name = request.POST.get('name')
        name_en = request.POST.get('name_en', '')
        position = request.POST.get('position', '')
        position_en = request.POST.get('position_en', '')
        hospital_id = request.POST.get('hospital')
        phone = request.POST.get('phone', '')
        email = request.POST.get('email', '')

        # التحقق من البيانات المطلوبة
        if not name:
            return JsonResponse({
                'success': False,
                'message': 'يرجى ملء اسم الطبيب',
                'errors': {
                    'name': ['هذا الحقل مطلوب'] if not name else []
                }
            })

        # التحقق مما إذا كان هناك طبيب بنفس رقم الهوية (فقط إذا تم إدخال رقم هوية)
        if national_id and Doctor.objects.filter(national_id=national_id).exists():
            # تحديث بيانات الطبيب الموجود
            doctor = Doctor.objects.get(national_id=national_id)
            doctor.name = name
            if name_en:
                doctor.name_en = name_en
            if position:
                doctor.position = position
            if position_en:
                doctor.position_en = position_en
            if phone:
                doctor.phone = phone
            if email:
                doctor.email = email

            # إضافة المستشفى إذا تم تحديده
            if hospital_id:
                try:
                    hospital = Hospital.objects.get(id=hospital_id)
                    if hospital not in doctor.hospitals.all():
                        doctor.hospitals.add(hospital)
                except Hospital.DoesNotExist:
                    pass

            doctor.save()

            return JsonResponse({
                'success': True,
                'message': 'تم تحديث بيانات الطبيب بنجاح',
                'object_id': doctor.id,
                'object_text': doctor.name
            })

        # الحصول على المستشفى (إذا تم تحديده)
        hospital = None
        if hospital_id:
            try:
                hospital = Hospital.objects.get(id=hospital_id)
            except Hospital.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'المستشفى غير موجود',
                    'errors': {
                        'hospital': ['المستشفى غير موجود']
                    }
                })

        # إنشاء الطبيب
        doctor = Doctor(
            name=name,
            name_en=name_en or translate_text(name),
            position=position,
            position_en=position_en or translate_text(position),
            national_id=national_id,
            phone=phone,
            email=email
        )

        # استخدام دالة save() لتفعيل الترجمة التلقائية
        doctor.save()

        # إضافة المستشفى إذا تم تحديده
        if hospital:
            doctor.hospitals.add(hospital)

        # إرجاع استجابة ناجحة
        return JsonResponse({
            'success': True,
            'message': 'تم إضافة الطبيب بنجاح',
            'object_id': doctor.id,
            'object_text': doctor.name
        })

    except Exception as e:
        # معالجة الأخطاء
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}',
            'errors': {}
        })


@login_required
def get_doctor_data(request, doctor_id):
    """الحصول على بيانات الطبيب للتعديل"""
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        hospitals = [{'id': h.id, 'name': h.name} for h in doctor.hospitals.all()]

        return JsonResponse({
            'success': True,
            'doctor': {
                'id': doctor.id,
                'national_id': doctor.national_id,
                'name': doctor.name,
                'name_en': doctor.name_en,
                'position': doctor.position,
                'position_en': doctor.position_en,
                'phone': doctor.phone,
                'email': doctor.email,
                'hospitals': hospitals
            }
        })
    except Doctor.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'الطبيب غير موجود'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }, status=500)


@login_required
@csrf_exempt
@require_POST
def update_doctor_ajax(request, doctor_id):
    """تحديث بيانات الطبيب عبر AJAX"""
    try:
        doctor = Doctor.objects.get(id=doctor_id)

        # تحديث البيانات
        doctor.national_id = request.POST.get('national_id', doctor.national_id)
        doctor.name = request.POST.get('name', doctor.name)
        doctor.name_en = request.POST.get('name_en', doctor.name_en)
        doctor.position = request.POST.get('position', doctor.position)
        doctor.position_en = request.POST.get('position_en', doctor.position_en)
        doctor.phone = request.POST.get('phone', doctor.phone)
        doctor.email = request.POST.get('email', doctor.email)

        # إضافة المستشفى إذا تم تحديده
        hospital_id = request.POST.get('hospital')
        if hospital_id:
            try:
                hospital = Hospital.objects.get(id=hospital_id)
                if hospital not in doctor.hospitals.all():
                    doctor.hospitals.add(hospital)
            except Hospital.DoesNotExist:
                pass

        doctor.save()

        return JsonResponse({
            'success': True,
            'message': 'تم تحديث بيانات الطبيب بنجاح',
            'object_id': doctor.id,
            'object_text': doctor.name
        })
    except Doctor.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'الطبيب غير موجود'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }, status=500)

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from core.forms import HospitalForm
from core.models import Doctor, Hospital


@login_required
@require_POST
def hospital_create_ajax(request):
    """إنشاء مستشفى جديد عبر AJAX"""
    form = HospitalForm(request.POST, request.FILES)
    if form.is_valid():
        hospital = form.save()

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
    else:
        return JsonResponse({
            'success': False,
            'message': 'حدث خطأ أثناء إنشاء المستشفى',
            'errors': form.errors
        })

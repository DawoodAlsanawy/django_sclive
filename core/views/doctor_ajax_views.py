from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST

from core.models import Doctor, Hospital


@require_POST
def doctor_create_ajax(request):
    """
    إنشاء طبيب جديد عبر AJAX.
    """
    try:
        # الحصول على بيانات النموذج
        national_id = request.POST.get('national_id')
        name = request.POST.get('name')
        position = request.POST.get('position', '')
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
            return JsonResponse({
                'success': False,
                'message': 'يوجد طبيب بنفس رقم الهوية',
                'errors': {
                    'national_id': ['يوجد طبيب بنفس رقم الهوية']
                }
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
            name=name
        )

        # إضافة البيانات الاختيارية إذا تم توفيرها
        if national_id:
            doctor.national_id = national_id
        if position:
            doctor.position = position
        if hospital:
            doctor.hospital = hospital
        if phone:
            doctor.phone = phone
        if email:
            doctor.email = email
        # استخدام دالة save() لتفعيل الترجمة التلقائية
        doctor.save()

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

from django.db.models import Q
from django.shortcuts import render

from core.models import CompanionLeave, SickLeave


def sick_leave_inquiry(request):
    """
    صفحة الاستعلام عن الإجازات المرضية وإجازات المرافقين
    تسمح للمستخدمين بالاستعلام عن الإجازات باستخدام رقم الإجازة ورقم الهوية
    """
    context = {}
    error = ''
    error_nodata = ''
    leave = None
    leave_type = None
    
    if request.method == 'POST':
        leave_id = request.POST.get('leave_id')
        national_id = request.POST.get('national_id')
        
        # التحقق من صحة البيانات المدخلة
        if not leave_id:
            error = 'فضلا اكتب الرمز '
        elif not national_id:
            error = 'رقم الهوية خاطئ'
        
        if not error:
            # البحث عن الإجازة المرضية
            sick_leave = SickLeave.objects.filter(
                leave_id=leave_id,
                patient__national_id=national_id
            ).first()
            
            # إذا لم يتم العثور على إجازة مرضية، ابحث عن إجازة مرافق
            if not sick_leave:
                companion_leave = CompanionLeave.objects.filter(
                    Q(leave_id=leave_id) & 
                    (Q(patient__national_id=national_id) | Q(companion__national_id=national_id))
                ).first()
                
                if companion_leave:
                    leave = companion_leave
                    leave_type = 'companion_leave'
                else:
                    error_nodata = 'لم يتم العثور على إجازة بهذه البيانات'
            else:
                leave = sick_leave
                leave_type = 'sick_leave'
    
    context = {
        'error': error,
        'error_nodata': error_nodata,
        'leave': leave,
        'leave_type': leave_type,
        'leave_id': request.POST.get('leave_id', ''),
        'national_id': request.POST.get('national_id', ''),
        'form_submitted': request.method == 'POST'
    }
    
    return render(request, 'core/inquiries/slenquiry/index.html', context)

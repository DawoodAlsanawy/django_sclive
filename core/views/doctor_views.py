from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import DoctorForm
from core.models import CompanionLeave, Doctor, Hospital, SickLeave


@login_required
def doctor_list(request):
    """قائمة الأطباء"""
    doctors = Doctor.objects.all().order_by('name')

    # تطبيق الفلاتر
    name = request.GET.get('name')
    position = request.GET.get('position')
    hospital_id = request.GET.get('hospital')

    if name:
        doctors = doctors.filter(name__icontains=name)

    if position:
        doctors = doctors.filter(position__icontains=position)

    if hospital_id:
        doctors = doctors.filter(hospitals__id=hospital_id)

    # الحصول على جميع المستشفيات للفلتر
    hospitals = Hospital.objects.all().order_by('name')

    return render(request, 'core/doctors/list.html', {
        'doctors': doctors,
        'hospitals': hospitals
    })


@login_required
def doctor_create(request):
    """إنشاء طبيب جديد"""
    if request.method == 'POST':
        form = DoctorForm(request.POST)
        if form.is_valid():
            doctor = form.save()
            messages.success(request, f'تم إنشاء الطبيب {doctor.name} بنجاح')
            return redirect('core:doctor_list')
    else:
        form = DoctorForm()

    return render(request, 'core/doctors/create.html', {'form': form})


@login_required
def doctor_edit(request, doctor_id):
    """تعديل طبيب"""
    doctor = get_object_or_404(Doctor, id=doctor_id)

    if request.method == 'POST':
        form = DoctorForm(request.POST, instance=doctor)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل الطبيب {doctor.name} بنجاح')
            return redirect('core:doctor_detail', doctor_id=doctor.id)
    else:
        form = DoctorForm(instance=doctor)

    return render(request, 'core/doctors/edit.html', {'form': form, 'doctor': doctor})


@login_required
def doctor_delete(request, doctor_id):
    """حذف طبيب"""
    doctor = get_object_or_404(Doctor, id=doctor_id)

    # التحقق من وجود إجازات مرتبطة بالطبيب
    sick_leaves_count = doctor.sick_leaves.count()
    companion_leaves_count = doctor.companion_leaves.count()

    if request.method == 'POST':
        doctor_name = doctor.name  # حفظ اسم الطبيب قبل الحذف
        doctor.delete()
        messages.success(request, f'تم حذف الطبيب {doctor_name} بنجاح')
        return redirect('core:doctor_list')

    context = {
        'doctor': doctor,
        'sick_leaves_count': sick_leaves_count,
        'companion_leaves_count': companion_leaves_count
    }

    return render(request, 'core/doctors/delete.html', context)


@login_required
def doctor_detail(request, doctor_id):
    """تفاصيل الطبيب"""
    doctor = get_object_or_404(Doctor, id=doctor_id)

    # الحصول على الإجازات المرضية للطبيب
    sick_leaves = SickLeave.objects.filter(doctor=doctor).order_by('-start_date')

    # الحصول على إجازات المرافقين للطبيب
    companion_leaves = CompanionLeave.objects.filter(doctor=doctor).order_by('-start_date')

    context = {
        'doctor': doctor,
        'sick_leaves': sick_leaves,
        'companion_leaves': companion_leaves
    }

    return render(request, 'core/doctors/detail.html', context)

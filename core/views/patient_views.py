from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import PatientForm
from core.models import CompanionLeave, Employer, Patient, SickLeave


@login_required
def patient_list(request):
    """قائمة المرضى"""
    patients = Patient.objects.all().order_by('name')

    # تطبيق الفلاتر
    name = request.GET.get('name')
    national_id = request.GET.get('national_id')
    employer_id = request.GET.get('employer')

    if name:
        patients = patients.filter(name__icontains=name)

    if national_id:
        patients = patients.filter(national_id__icontains=national_id)

    if employer_id:
        patients = patients.filter(employer_id=employer_id)

    # الحصول على جميع جهات العمل للفلتر
    employers = Employer.objects.all().order_by('name')

    return render(request, 'core/patients/list.html', {
        'patients': patients,
        'employers': employers
    })


@login_required
def patient_create(request):
    """إنشاء مريض جديد"""
    if request.method == 'POST':
        form = PatientForm(request.POST)
        if form.is_valid():
            patient = form.save()
            messages.success(request, f'تم إنشاء المريض {patient.name} بنجاح')
            return redirect('core:patient_list')
    else:
        form = PatientForm()

    return render(request, 'core/patients/create.html', {'form': form})


@login_required
def patient_edit(request, patient_id):
    """تعديل مريض"""
    patient = get_object_or_404(Patient, id=patient_id)

    if request.method == 'POST':
        form = PatientForm(request.POST, instance=patient)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل المريض {patient.name} بنجاح')
            return redirect('core:patient_detail', patient_id=patient.id)
    else:
        form = PatientForm(instance=patient)

    return render(request, 'core/patients/edit.html', {'form': form, 'patient': patient})


@login_required
def patient_delete(request, patient_id):
    """حذف مريض"""
    patient = get_object_or_404(Patient, id=patient_id)

    # التحقق من وجود إجازات مرتبطة بالمريض
    sick_leaves_count = patient.sick_leaves.count()
    companion_leaves_count = patient.companion_leaves.count()

    if request.method == 'POST':
        patient_name = patient.name  # حفظ اسم المريض قبل الحذف
        patient.delete()
        messages.success(request, f'تم حذف المريض {patient_name} بنجاح')
        return redirect('core:patient_list')

    context = {
        'patient': patient,
        'sick_leaves_count': sick_leaves_count,
        'companion_leaves_count': companion_leaves_count
    }

    return render(request, 'core/patients/delete.html', context)


@login_required
def patient_detail(request, patient_id):
    """تفاصيل المريض"""
    patient = get_object_or_404(Patient, id=patient_id)

    # الحصول على الإجازات المرضية للمريض
    sick_leaves = SickLeave.objects.filter(patient=patient).order_by('-start_date')

    # الحصول على إجازات المرافقين للمريض
    companion_leaves = CompanionLeave.objects.filter(patient=patient).order_by('-start_date')

    context = {
        'patient': patient,
        'sick_leaves': sick_leaves,
        'companion_leaves': companion_leaves
    }

    return render(request, 'core/patients/detail.html', context)

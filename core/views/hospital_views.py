from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import HospitalForm
from core.models import Hospital


@login_required
def hospital_list(request):
    """قائمة المستشفيات"""
    hospitals = Hospital.objects.all().order_by('name')

    # تطبيق الفلاتر إذا تم إضافتها في المستقبل
    name = request.GET.get('name')
    if name:
        hospitals = hospitals.filter(name__icontains=name)

    return render(request, 'core/hospitals/list.html', {'hospitals': hospitals})


@login_required
def hospital_create(request):
    """إنشاء مستشفى جديد"""
    # التحقق من صلاحيات المستخدم
    if not request.user.is_admin() and not request.user.is_staff:
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    if request.method == 'POST':
        form = HospitalForm(request.POST, request.FILES)
        if form.is_valid():
            hospital = form.save()
            messages.success(request, f'تم إنشاء المستشفى {hospital.name} بنجاح')
            return redirect('core:hospital_list')
    else:
        form = HospitalForm()

    return render(request, 'core/hospitals/create.html', {'form': form})


@login_required
def hospital_edit(request, hospital_id):
    """تعديل مستشفى"""
    # التحقق من صلاحيات المستخدم
    if not request.user.is_admin() and not request.user.is_staff:
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    hospital = get_object_or_404(Hospital, id=hospital_id)

    if request.method == 'POST':
        form = HospitalForm(request.POST, request.FILES, instance=hospital)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل المستشفى {hospital.name} بنجاح')
            return redirect('core:hospital_list')
    else:
        form = HospitalForm(instance=hospital)

    return render(request, 'core/hospitals/edit.html', {'form': form, 'hospital': hospital})


@login_required
def hospital_delete(request, hospital_id):
    """حذف مستشفى"""
    # التحقق من صلاحيات المستخدم
    if not request.user.is_admin() and not request.user.is_staff:
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    hospital = get_object_or_404(Hospital, id=hospital_id)

    # التحقق من وجود أطباء مرتبطين بالمستشفى
    doctors_count = hospital.doctors.count()

    if request.method == 'POST':
        hospital_name = hospital.name  # حفظ اسم المستشفى قبل الحذف

        # حذف ملف الشعار إذا كان موجودًا
        if hospital.logo:
            if hospital.logo.storage.exists(hospital.logo.name):
                hospital.logo.delete()

        hospital.delete()
        messages.success(request, f'تم حذف المستشفى {hospital_name} بنجاح')
        return redirect('core:hospital_list')

    return render(request, 'core/hospitals/delete.html', {'hospital': hospital, 'doctors_count': doctors_count})

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import EmployerForm
from core.models import Employer


@login_required
def employer_list(request):
    """قائمة جهات العمل"""
    employers = Employer.objects.all().order_by('name')

    # تطبيق الفلاتر
    name = request.GET.get('name')
    phone = request.GET.get('phone')
    email = request.GET.get('email')

    if name:
        employers = employers.filter(name__icontains=name)
    if phone:
        employers = employers.filter(phone__icontains=phone)
    if email:
        employers = employers.filter(email__icontains=email)

    return render(request, 'core/employers/list.html', {'employers': employers})


@login_required
def employer_detail(request, employer_id):
    """عرض تفاصيل جهة العمل"""
    employer = get_object_or_404(Employer, id=employer_id)
    return render(request, 'core/employers/detail.html', {'employer': employer})


@login_required
def employer_create(request):
    """إنشاء جهة عمل جديدة"""
    if request.method == 'POST':
        form = EmployerForm(request.POST)
        if form.is_valid():
            employer = form.save()
            messages.success(request, f'تم إنشاء جهة العمل {employer.name} بنجاح')
            return redirect('core:employer_list')
    else:
        form = EmployerForm()

    return render(request, 'core/employers/create.html', {'form': form})


@login_required
def employer_edit(request, employer_id):
    """تعديل جهة عمل"""
    employer = get_object_or_404(Employer, id=employer_id)

    if request.method == 'POST':
        form = EmployerForm(request.POST, instance=employer)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل جهة العمل {employer.name} بنجاح')
            return redirect('core:employer_detail', employer_id=employer.id)
    else:
        form = EmployerForm(instance=employer)

    return render(request, 'core/employers/edit.html', {'form': form, 'employer': employer})


@login_required
def employer_delete(request, employer_id):
    """حذف جهة عمل"""
    employer = get_object_or_404(Employer, id=employer_id)

    # التحقق من وجود موظفين مرتبطين بجهة العمل
    patients_count = employer.patients.count()

    if request.method == 'POST':
        employer_name = employer.name  # حفظ اسم جهة العمل قبل الحذف
        employer.delete()
        messages.success(request, f'تم حذف جهة العمل {employer_name} بنجاح')
        return redirect('core:employer_list')

    return render(request, 'core/employers/delete.html', {'employer': employer})

from datetime import timedelta

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from core.forms import CompanionLeaveForm, CompanionLeaveWithInvoiceForm
from core.models import (CompanionLeave, Doctor, Hospital, LeaveInvoice,
                         LeavePrice, Patient)
from core.utils import generate_unique_number


@login_required
def companion_leave_list(request):
    """قائمة إجازات المرافقين"""
    # تطبيق الفلاتر مع تحسين الاستعلامات باستخدام select_related
    companion_leaves = CompanionLeave.objects.select_related('patient', 'companion', 'doctor').all()

    # فلتر رقم الإجازة
    leave_id = request.GET.get('leave_id')
    if leave_id:
        companion_leaves = companion_leaves.filter(leave_id__icontains=leave_id)

    # فلتر المريض
    patient = request.GET.get('patient')
    if patient:
        companion_leaves = companion_leaves.filter(patient__name__icontains=patient)

    # فلتر المرافق
    companion = request.GET.get('companion')
    if companion:
        companion_leaves = companion_leaves.filter(companion__name__icontains=companion)

    # فلتر الطبيب
    doctor = request.GET.get('doctor')
    if doctor:
        companion_leaves = companion_leaves.filter(doctor__name__icontains=doctor)

    # فلتر الحالة
    status = request.GET.get('status')
    if status:
        companion_leaves = companion_leaves.filter(status=status)

    # فلتر تاريخ البداية (من)
    start_date_from = request.GET.get('start_date_from')
    if start_date_from:
        companion_leaves = companion_leaves.filter(start_date__gte=start_date_from)

    # فلتر تاريخ البداية (إلى)
    start_date_to = request.GET.get('start_date_to')
    if start_date_to:
        companion_leaves = companion_leaves.filter(start_date__lte=start_date_to)

    # فلتر تاريخ النهاية (من)
    end_date_from = request.GET.get('end_date_from')
    if end_date_from:
        companion_leaves = companion_leaves.filter(end_date__gte=end_date_from)

    # فلتر تاريخ النهاية (إلى)
    end_date_to = request.GET.get('end_date_to')
    if end_date_to:
        companion_leaves = companion_leaves.filter(end_date__lte=end_date_to)

    # الترتيب
    sort_by = request.GET.get('sort', '-created_at')
    if sort_by not in ['leave_id', '-leave_id', 'patient__name', '-patient__name', 'companion__name', '-companion__name',
                      'doctor__name', '-doctor__name', 'start_date', '-start_date', 'end_date', '-end_date',
                      'duration_days', '-duration_days', 'status', '-status', 'created_at', '-created_at']:
        sort_by = '-created_at'

    companion_leaves = companion_leaves.order_by(sort_by)

    # الترقيم الصفحي
    paginator = Paginator(companion_leaves, 10)  # 10 إجازات في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'companion_leaves': page_obj,
        'leave_id': leave_id,
        'patient': patient,
        'companion': companion,
        'doctor': doctor,
        'status': status,
        'start_date_from': start_date_from,
        'start_date_to': start_date_to,
        'end_date_from': end_date_from,
        'end_date_to': end_date_to,
        'sort': sort_by
    }

    return render(request, 'core/companion_leaves/list.html', context)


@login_required
def companion_leave_create(request):
    """إنشاء إجازة مرافق جديدة"""
    if request.method == 'POST':
        form = CompanionLeaveForm(request.POST)
        if form.is_valid():
            companion_leave = form.save()
            messages.success(request, f'تم إنشاء إجازة المرافق رقم {companion_leave.leave_id} بنجاح')
            return redirect('core:companion_leave_detail', companion_leave_id=companion_leave.id)
    else:
        # توليد رقم إجازة تلقائي
        leave_id = generate_unique_number('CL', CompanionLeave)

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        import datetime
        today = datetime.date.today()
        initial_data = {
            'leave_id': leave_id,
            'issue_date': today
        }
        form = CompanionLeaveForm(initial=initial_data)

    return render(request, 'core/companion_leaves/create.html', {'form': form})


@login_required
def companion_leave_create_with_invoice(request):
    """إنشاء إجازة مرافق مع فاتورة في خطوة واحدة"""
    if request.method == 'POST':
        form = CompanionLeaveWithInvoiceForm(request.POST)
        if form.is_valid():
            companion_leave = form.save(commit=False)

            # حفظ الإجازة
            companion_leave.save()

            # إنشاء فاتورة تلقائياً إذا تم اختيار ذلك
            invoice = None
            if form.cleaned_data.get('create_invoice') and form.cleaned_data.get('client'):
                client = form.cleaned_data['client']

                # حساب المبلغ بناءً على نوع الإجازة ومدتها والعميل
                price = LeavePrice.get_price('companion_leave', companion_leave.duration_days, client)

                # إنشاء رقم فاتورة فريد
                invoice_number = generate_unique_number('INV', LeaveInvoice)

                # تعيين تاريخ استحقاق افتراضي (بعد 30 يومًا من تاريخ الإصدار)
                due_date = companion_leave.issue_date + timedelta(days=30)

                # إنشاء الفاتورة
                invoice = LeaveInvoice.objects.create(
                    invoice_number=invoice_number,
                    client=client,
                    leave_type='companion_leave',
                    leave_id=companion_leave.leave_id,
                    amount=price,
                    issue_date=companion_leave.issue_date,
                    due_date=due_date
                )

                messages.success(request, f'تم إنشاء إجازة المرافق رقم {companion_leave.leave_id} والفاتورة رقم {invoice_number} بنجاح')
            else:
                messages.success(request, f'تم إنشاء إجازة المرافق رقم {companion_leave.leave_id} بنجاح')

            # توجيه المستخدم مباشرة إلى صفحة الطباعة
            return redirect('core:companion_leave_print', companion_leave_id=companion_leave.id)
    else:
        # توليد رقم إجازة تلقائي
        leave_id = generate_unique_number('CL', CompanionLeave)

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        import datetime
        today = datetime.date.today()
        initial_data = {
            'leave_id': leave_id,
            'issue_date': today
        }
        form = CompanionLeaveWithInvoiceForm(initial=initial_data)

    return render(request, 'core/companion_leaves/create_with_invoice.html', {'form': form})


@login_required
def companion_leave_detail(request, companion_leave_id):
    """تفاصيل إجازة مرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    invoices = LeaveInvoice.objects.filter(leave_type='companion_leave', leave_id=companion_leave.leave_id)

    context = {
        'companion_leave': companion_leave,
        'invoices': invoices
    }

    return render(request, 'core/companion_leaves/detail.html', context)


@login_required
def companion_leave_edit(request, companion_leave_id):
    """تعديل إجازة مرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    if request.method == 'POST':
        form = CompanionLeaveForm(request.POST, instance=companion_leave)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل إجازة المرافق رقم {companion_leave.leave_id} بنجاح')
            return redirect('core:companion_leave_detail', companion_leave_id=companion_leave.id)
    else:
        form = CompanionLeaveForm(instance=companion_leave)

    return render(request, 'core/companion_leaves/edit.html', {'form': form, 'companion_leave': companion_leave})


@login_required
def companion_leave_delete(request, companion_leave_id):
    """حذف إجازة مرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    # التحقق من وجود فواتير مرتبطة بالإجازة
    invoices = LeaveInvoice.objects.filter(leave_type='companion_leave', leave_id=companion_leave.leave_id)

    if request.method == 'POST':
        leave_id = companion_leave.leave_id  # حفظ رقم الإجازة قبل الحذف
        companion_leave.delete()
        messages.success(request, f'تم حذف إجازة المرافق رقم {leave_id} بنجاح')
        return redirect('core:companion_leave_list')

    context = {
        'companion_leave': companion_leave,
        'invoices': invoices
    }

    return render(request, 'core/companion_leaves/delete.html', context)


@login_required
def companion_leave_print(request, companion_leave_id):
    """طباعة إجازة المرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    invoices = LeaveInvoice.objects.filter(leave_type='companion_leave', leave_id=companion_leave.leave_id)

    context = {
        'companion_leave': companion_leave,
        'invoices': invoices,
        'print_mode': True
    }

    return render(request, 'core/companion_leaves/print.html', context)

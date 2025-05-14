from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404, redirect, render
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import timedelta

from core.forms import LeaveInvoiceForm
from core.models import LeaveInvoice, Client, SickLeave, CompanionLeave
from core.utils import generate_unique_number


@login_required
def leave_invoice_list(request):
    """قائمة فواتير الإجازات"""
    # تطبيق الفلاتر مع تحسين الاستعلامات باستخدام select_related
    invoices = LeaveInvoice.objects.select_related('client').all()

    # فلتر رقم الفاتورة
    invoice_number = request.GET.get('invoice_number')
    if invoice_number:
        invoices = invoices.filter(invoice_number__icontains=invoice_number)

    # فلتر العميل
    client = request.GET.get('client')
    if client:
        invoices = invoices.filter(client__name__icontains=client)

    # فلتر نوع الإجازة
    leave_type = request.GET.get('leave_type')
    if leave_type:
        invoices = invoices.filter(leave_type=leave_type)

    # فلتر رقم الإجازة
    leave_id = request.GET.get('leave_id')
    if leave_id:
        invoices = invoices.filter(leave_id__icontains=leave_id)

    # فلتر الحالة
    status = request.GET.get('status')
    if status:
        invoices = invoices.filter(status=status)

    # فلتر تاريخ الإصدار (من)
    issue_date_from = request.GET.get('issue_date_from')
    if issue_date_from:
        invoices = invoices.filter(issue_date__gte=issue_date_from)

    # فلتر تاريخ الإصدار (إلى)
    issue_date_to = request.GET.get('issue_date_to')
    if issue_date_to:
        invoices = invoices.filter(issue_date__lte=issue_date_to)

    # فلتر تاريخ الاستحقاق (من)
    due_date_from = request.GET.get('due_date_from')
    if due_date_from:
        invoices = invoices.filter(due_date__gte=due_date_from)

    # فلتر تاريخ الاستحقاق (إلى)
    due_date_to = request.GET.get('due_date_to')
    if due_date_to:
        invoices = invoices.filter(due_date__lte=due_date_to)

    # الترتيب
    sort_by = request.GET.get('sort', '-created_at')
    if sort_by not in ['invoice_number', '-invoice_number', 'client__name', '-client__name',
                      'leave_type', '-leave_type', 'leave_id', '-leave_id',
                      'amount', '-amount', 'issue_date', '-issue_date',
                      'due_date', '-due_date', 'status', '-status',
                      'created_at', '-created_at']:
        sort_by = '-created_at'

    invoices = invoices.order_by(sort_by)

    # الترقيم الصفحي
    paginator = Paginator(invoices, 10)  # 10 فواتير في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # حساب إجمالي المبالغ
    total_amount = invoices.aggregate(total=Sum('amount'))['total'] or 0

    context = {
        'invoices': page_obj,
        'invoice_number': invoice_number,
        'client': client,
        'leave_type': leave_type,
        'leave_id': leave_id,
        'status': status,
        'issue_date_from': issue_date_from,
        'issue_date_to': issue_date_to,
        'due_date_from': due_date_from,
        'due_date_to': due_date_to,
        'sort': sort_by,
        'total_amount': total_amount
    }

    return render(request, 'core/leave_invoices/list.html', context)


@login_required
def leave_invoice_create(request):
    """إنشاء فاتورة إجازة جديدة"""
    if request.method == 'POST':
        form = LeaveInvoiceForm(request.POST)
        if form.is_valid():
            # إنشاء رقم فاتورة فريد إذا لم يتم تحديده
            if not form.cleaned_data.get('invoice_number'):
                form.instance.invoice_number = generate_unique_number('INV', LeaveInvoice)

            invoice = form.save()
            messages.success(request, f'تم إنشاء الفاتورة رقم {invoice.invoice_number} بنجاح')
            return redirect('core:leave_invoice_detail', leave_invoice_id=invoice.id)
    else:
        # توليد رقم فاتورة تلقائي
        invoice_number = generate_unique_number('INV', LeaveInvoice)

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        import datetime
        today = datetime.date.today()
        due_date = today + timedelta(days=30)  # تاريخ استحقاق افتراضي بعد 30 يوم
        
        initial_data = {
            'invoice_number': invoice_number,
            'issue_date': today,
            'due_date': due_date
        }
        form = LeaveInvoiceForm(initial=initial_data)

    return render(request, 'core/leave_invoices/create.html', {'form': form})


@login_required
def leave_invoice_detail(request, leave_invoice_id):
    """تفاصيل فاتورة إجازة"""
    invoice = get_object_or_404(LeaveInvoice, id=leave_invoice_id)
    
    # الحصول على معلومات الإجازة المرتبطة بالفاتورة
    leave_info = None
    if invoice.leave_type == 'sick_leave':
        try:
            leave = SickLeave.objects.get(leave_id=invoice.leave_id)
            leave_info = {
                'type': 'sick_leave',
                'type_display': 'إجازة مرضية',
                'leave': leave,
                'patient': leave.patient,
                'doctor': leave.doctor
            }
        except SickLeave.DoesNotExist:
            pass
    elif invoice.leave_type == 'companion_leave':
        try:
            leave = CompanionLeave.objects.get(leave_id=invoice.leave_id)
            leave_info = {
                'type': 'companion_leave',
                'type_display': 'إجازة مرافق',
                'leave': leave,
                'patient': leave.patient,
                'companion': leave.companion,
                'doctor': leave.doctor
            }
        except CompanionLeave.DoesNotExist:
            pass
    
    # الحصول على المدفوعات المرتبطة بالفاتورة
    payments = invoice.payments.all().order_by('-payment_date')
    
    # حساب المبلغ المدفوع والمتبقي
    paid_amount = sum(payment.amount for payment in payments)
    remaining_amount = invoice.amount - paid_amount
    
    context = {
        'invoice': invoice,
        'leave_info': leave_info,
        'payments': payments,
        'paid_amount': paid_amount,
        'remaining_amount': remaining_amount
    }
    
    return render(request, 'core/leave_invoices/detail.html', context)


@login_required
def leave_invoice_edit(request, leave_invoice_id):
    """تعديل فاتورة إجازة"""
    invoice = get_object_or_404(LeaveInvoice, id=leave_invoice_id)
    
    if request.method == 'POST':
        form = LeaveInvoiceForm(request.POST, instance=invoice)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل الفاتورة رقم {invoice.invoice_number} بنجاح')
            return redirect('core:leave_invoice_detail', leave_invoice_id=invoice.id)
    else:
        form = LeaveInvoiceForm(instance=invoice)
    
    return render(request, 'core/leave_invoices/edit.html', {'form': form, 'invoice': invoice})


@login_required
def leave_invoice_delete(request, leave_invoice_id):
    """حذف فاتورة إجازة"""
    invoice = get_object_or_404(LeaveInvoice, id=leave_invoice_id)
    
    # التحقق من وجود مدفوعات مرتبطة بالفاتورة
    payments_count = invoice.payments.count()
    
    if request.method == 'POST':
        invoice_number = invoice.invoice_number  # حفظ رقم الفاتورة قبل الحذف
        invoice.delete()
        messages.success(request, f'تم حذف الفاتورة رقم {invoice_number} بنجاح')
        return redirect('core:leave_invoice_list')
    
    context = {
        'invoice': invoice,
        'payments_count': payments_count
    }
    
    return render(request, 'core/leave_invoices/delete.html', context)

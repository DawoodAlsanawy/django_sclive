from datetime import timedelta

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from core.forms import LeaveInvoiceForm
from core.models import Client, CompanionLeave, LeaveInvoice, SickLeave
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

    # حساب الإحصائيات
    total_invoices = invoices.count()
    total_amount = invoices.aggregate(total=Sum('amount'))['total'] or 0

    # حساب إجمالي المدفوعات والمتبقي
    total_paid = 0
    total_remaining = 0

    # نستخدم عينة من الفواتير لحساب الإحصائيات لتجنب استهلاك الذاكرة
    sample_invoices = invoices[:100]  # نأخذ أول 100 فاتورة كعينة
    for invoice in sample_invoices:
        total_paid += invoice.get_total_paid()
        total_remaining += invoice.get_remaining()

    # تقدير القيم الإجمالية بناءً على العينة إذا كان عدد الفواتير كبيرًا
    if total_invoices > 100:
        ratio = total_invoices / 100
        total_paid *= ratio
        total_remaining *= ratio

    context = {
        'leave_invoices': page_obj,  # تغيير الاسم ليتوافق مع القالب
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
        'total_amount': total_amount,
        'total_invoices': total_invoices,
        'total_paid': total_paid,
        'total_remaining': total_remaining
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

            # تحديث حالة الفاتورة بناءً على المدفوعات
            invoice.update_status()

            messages.success(request, f'تم إنشاء الفاتورة رقم {invoice.invoice_number} بنجاح للعميل {invoice.client.name} بمبلغ {invoice.amount} ريال')
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

        # استخدام معلمات URL لملء البيانات تلقائيًا
        leave_type = request.GET.get('leave_type')
        leave_id = request.GET.get('leave_id')
        client_id = request.GET.get('client_id')
        amount = request.GET.get('amount')

        if leave_type:
            initial_data['leave_type'] = leave_type

        if leave_id:
            initial_data['leave_id'] = leave_id

            # البحث عن الإجازة المرتبطة
            leave_obj = None
            if leave_type == 'sick_leave':
                try:
                    leave_obj = SickLeave.objects.get(leave_id=leave_id)
                    # إذا كان المريض لديه جهة عمل، استخدمها كعميل
                    if leave_obj.patient and leave_obj.patient.employer_name:
                        # البحث عن عميل بنفس الاسم
                        try:
                            client = Client.objects.get(name=leave_obj.patient.employer_name)
                            initial_data['client'] = client.id
                        except Client.DoesNotExist:
                            pass
                except SickLeave.DoesNotExist:
                    pass
            elif leave_type == 'companion_leave':
                try:
                    leave_obj = CompanionLeave.objects.get(leave_id=leave_id)
                    # إذا كان المريض لديه جهة عمل، استخدمها كعميل
                    if leave_obj.patient and leave_obj.patient.employer_name:
                        # البحث عن عميل بنفس الاسم
                        try:
                            client = Client.objects.get(name=leave_obj.patient.employer_name)
                            initial_data['client'] = client.id
                        except Client.DoesNotExist:
                            pass
                except CompanionLeave.DoesNotExist:
                    pass

        if client_id:
            try:
                client = Client.objects.get(id=client_id)
                initial_data['client'] = client.id
            except Client.DoesNotExist:
                pass

        if amount:
            try:
                initial_data['amount'] = float(amount)
            except (ValueError, TypeError):
                pass

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
            # استخدام select_related لتحسين الأداء
            leave = SickLeave.objects.select_related('patient', 'doctor', 'doctor__hospital').get(leave_id=invoice.leave_id)
            leave_info = {
                'type': 'sick_leave',
                'type_display': 'إجازة مرضية',
                'leave': leave,
                'id': leave.id,  # إضافة معرف الإجازة للاستخدام في الروابط
                'leave_id': leave.leave_id,
                'patient': leave.patient,
                'doctor': leave.doctor,
                'start_date': leave.start_date,
                'end_date': leave.end_date,
                'duration_days': leave.duration_days,
                'status': leave.status
            }
        except SickLeave.DoesNotExist:
            pass
    elif invoice.leave_type == 'companion_leave':
        try:
            # استخدام select_related لتحسين الأداء
            leave = CompanionLeave.objects.select_related('patient', 'companion', 'doctor', 'doctor__hospital').get(leave_id=invoice.leave_id)
            leave_info = {
                'type': 'companion_leave',
                'type_display': 'إجازة مرافق',
                'leave': leave,
                'id': leave.id,  # إضافة معرف الإجازة للاستخدام في الروابط
                'leave_id': leave.leave_id,
                'patient': leave.patient,
                'companion': leave.companion,
                'doctor': leave.doctor,
                'start_date': leave.start_date,
                'end_date': leave.end_date,
                'duration_days': leave.duration_days,
                'status': leave.status
            }
        except CompanionLeave.DoesNotExist:
            pass

    # الحصول على تفاصيل المدفوعات المرتبطة بالفاتورة
<<<<<<< HEAD
    payment_details = invoice.payment_details.all().select_related('payment').order_by('-payment__payment_date')
=======
    payment_details = invoice.get_payments()

    # طباعة عدد المدفوعات للتأكد من استدعائها بشكل صحيح
    print(f"عدد المدفوعات المرتبطة بالفاتورة: {payment_details.count()}")
>>>>>>> settings

    # حساب المبلغ المدفوع والمتبقي باستخدام الدوال المعرفة في النموذج
    paid_amount = invoice.get_total_paid()
    remaining_amount = invoice.get_remaining()

    context = {
        'leave_invoice': invoice,  # تغيير الاسم ليتوافق مع القالب
        'leave_info': leave_info,
        'payment_details': payment_details,
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
            updated_invoice = form.save()

            # تحديث حالة الفاتورة بناءً على المدفوعات
            updated_invoice.update_status()

            messages.success(request, f'تم تعديل الفاتورة رقم {updated_invoice.invoice_number} بنجاح')
            return redirect('core:leave_invoice_detail', leave_invoice_id=updated_invoice.id)
    else:
        form = LeaveInvoiceForm(instance=invoice)

    return render(request, 'core/leave_invoices/edit.html', {'form': form, 'leave_invoice': invoice})


@login_required
def leave_invoice_delete(request, leave_invoice_id):
    """حذف فاتورة إجازة"""
    invoice = get_object_or_404(LeaveInvoice, id=leave_invoice_id)

    # التحقق من وجود مدفوعات مرتبطة بالفاتورة
<<<<<<< HEAD
    payment_details = invoice.payment_details.all()
=======
    payment_details = invoice.get_payments()
>>>>>>> settings

    if request.method == 'POST':
        invoice_number = invoice.invoice_number  # حفظ رقم الفاتورة قبل الحذف
        invoice.delete()
        messages.success(request, f'تم حذف الفاتورة رقم {invoice_number} بنجاح')
        return redirect('core:leave_invoice_list')

    context = {
        'leave_invoice': invoice,  # تغيير الاسم ليتوافق مع القالب
        'payment_details': payment_details
    }

    return render(request, 'core/leave_invoices/delete.html', context)


@login_required
def leave_invoice_print(request, leave_invoice_id):
    """طباعة فاتورة إجازة"""
    invoice = get_object_or_404(LeaveInvoice, id=leave_invoice_id)

    # الحصول على معلومات الإجازة المرتبطة بالفاتورة
    leave_info = None
    if invoice.leave_type == 'sick_leave':
        try:
            # استخدام select_related لتحسين الأداء
            leave = SickLeave.objects.select_related('patient', 'doctor', 'doctor__hospital').get(leave_id=invoice.leave_id)
            leave_info = {
                'type': 'sick_leave',
                'type_display': 'إجازة مرضية',
                'leave': leave,
                'id': leave.id,
                'leave_id': leave.leave_id,
                'patient': leave.patient,
                'doctor': leave.doctor,
                'start_date': leave.start_date,
                'end_date': leave.end_date,
                'duration_days': leave.duration_days,
                'status': leave.status
            }
        except SickLeave.DoesNotExist:
            pass
    elif invoice.leave_type == 'companion_leave':
        try:
            # استخدام select_related لتحسين الأداء
            leave = CompanionLeave.objects.select_related('patient', 'companion', 'doctor', 'doctor__hospital').get(leave_id=invoice.leave_id)
            leave_info = {
                'type': 'companion_leave',
                'type_display': 'إجازة مرافق',
                'leave': leave,
                'id': leave.id,
                'leave_id': leave.leave_id,
                'patient': leave.patient,
                'companion': leave.companion,
                'doctor': leave.doctor,
                'start_date': leave.start_date,
                'end_date': leave.end_date,
                'duration_days': leave.duration_days,
                'status': leave.status
            }
        except CompanionLeave.DoesNotExist:
            pass

    # الحصول على تفاصيل المدفوعات المرتبطة بالفاتورة
<<<<<<< HEAD
    payment_details = invoice.payment_details.all().select_related('payment').order_by('-payment__payment_date')
=======
    payment_details = invoice.get_payments()
>>>>>>> settings

    # حساب المبلغ المدفوع والمتبقي باستخدام الدوال المعرفة في النموذج
    paid_amount = invoice.get_total_paid()
    remaining_amount = invoice.get_remaining()

    context = {
        'invoice': invoice,
        'leave_info': leave_info,
        'payment_details': payment_details,
        'paid_amount': paid_amount,
        'remaining_amount': remaining_amount,
        'print_mode': True
    }

    return render(request, 'core/leave_invoices/print.html', context)

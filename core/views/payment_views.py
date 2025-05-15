from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from core.forms import PaymentDetailForm, PaymentForm
from core.models import Client, LeaveInvoice, Payment, PaymentDetail
from core.utils import generate_unique_number


@login_required
def payment_list(request):
    """قائمة المدفوعات"""
    # تطبيق الفلاتر مع تحسين الاستعلامات باستخدام select_related
    payments = Payment.objects.select_related('client').all()

    # فلتر رقم المدفوعة
    payment_number = request.GET.get('payment_number')
    if payment_number:
        payments = payments.filter(payment_number__icontains=payment_number)

    # فلتر العميل
    client = request.GET.get('client')
    if client:
        payments = payments.filter(client__name__icontains=client)

    # فلتر طريقة الدفع
    payment_method = request.GET.get('payment_method')
    if payment_method:
        payments = payments.filter(payment_method=payment_method)

    # فلتر تاريخ الدفع (من)
    payment_date_from = request.GET.get('payment_date_from')
    if payment_date_from:
        payments = payments.filter(payment_date__gte=payment_date_from)

    # فلتر تاريخ الدفع (إلى)
    payment_date_to = request.GET.get('payment_date_to')
    if payment_date_to:
        payments = payments.filter(payment_date__lte=payment_date_to)

    # الترتيب
    sort_by = request.GET.get('sort', '-payment_date')
    if sort_by not in ['payment_number', '-payment_number', 'client__name', '-client__name',
                      'payment_method', '-payment_method', 'amount', '-amount',
                      'payment_date', '-payment_date', 'created_at', '-created_at']:
        sort_by = '-payment_date'

    payments = payments.order_by(sort_by)

    # الترقيم الصفحي
    paginator = Paginator(payments, 10)  # 10 مدفوعات في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # حساب إجمالي المبالغ
    total_amount = payments.aggregate(total=Sum('amount'))['total'] or 0

    context = {
        'payments': page_obj,
        'payment_number': payment_number,
        'client': client,
        'payment_method': payment_method,
        'payment_date_from': payment_date_from,
        'payment_date_to': payment_date_to,
        'sort': sort_by,
        'total_amount': total_amount
    }

    return render(request, 'core/payments/list.html', context)


@login_required
def payment_create(request):
    """إنشاء مدفوعة جديدة"""
    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            # إنشاء رقم مدفوعة فريد إذا لم يتم تحديده
            if not form.cleaned_data.get('payment_number'):
                form.instance.payment_number = generate_unique_number('PAY', Payment)

            payment = form.save()

            # إذا تم تحديد فواتير، قم بإنشاء تفاصيل الدفع
            invoices = form.cleaned_data.get('invoices')
            if invoices:
                for invoice in invoices:
                    # حساب المبلغ المتبقي للفاتورة
                    remaining_amount = invoice.get_remaining_amount()

                    # إذا كان المبلغ المتبقي أكبر من الصفر، قم بإنشاء تفصيل دفع
                    if remaining_amount > 0:
                        # إذا كان المبلغ المتبقي أكبر من مبلغ الدفع، استخدم مبلغ الدفع
                        amount = min(remaining_amount, payment.amount)

                        PaymentDetail.objects.create(
                            payment=payment,
                            invoice=invoice,
                            amount=amount
                        )

                        # تحديث حالة الفاتورة
                        invoice.update_status()

            messages.success(request, f'تم إنشاء المدفوعة رقم {payment.payment_number} بنجاح')
            return redirect('core:payment_detail', payment_id=payment.id)
    else:
        # توليد رقم مدفوعة تلقائي
        payment_number = generate_unique_number('PAY', Payment)

        # تعيين تاريخ اليوم كتاريخ افتراضي للدفع
        import datetime
        today = datetime.date.today()

        initial_data = {
            'payment_number': payment_number,
            'payment_date': today
        }

        # إذا تم تحديد عميل في الاستعلام، قم بتعيينه
        client_id = request.GET.get('client_id')
        if client_id:
            try:
                client = Client.objects.get(id=client_id)
                initial_data['client'] = client
            except Client.DoesNotExist:
                pass

        # إذا تم تحديد مبلغ في الاستعلام، قم بتعيينه
        amount = request.GET.get('amount')
        if amount:
            try:
                initial_data['amount'] = float(amount)
            except (ValueError, TypeError):
                pass

        # إنشاء النموذج مع البيانات الأولية
        form = PaymentForm(initial=initial_data)

        # إذا تم تحديد فاتورة في الاستعلام، قم بتحميلها
        invoice_id = request.GET.get('invoice_id')
        if invoice_id and client_id:
            try:
                invoice = LeaveInvoice.objects.get(id=invoice_id, client_id=client_id)
                # سنستخدم هذه المعلومات في القالب
                form.invoice_to_prefill = invoice
            except LeaveInvoice.DoesNotExist:
                pass

    return render(request, 'core/payments/create.html', {'form': form})


@login_required
def payment_detail(request, payment_id):
    """تفاصيل مدفوعة"""
    payment = get_object_or_404(Payment, id=payment_id)

    # الحصول على تفاصيل الدفع
    payment_details = payment.payment_details.select_related('invoice').all()

    # إذا كان هناك تفاصيل دفع، احسب المبلغ المخصص
    allocated_amount = sum(detail.amount for detail in payment_details)
    unallocated_amount = payment.amount - allocated_amount

    # إذا تم إرسال نموذج إضافة تفصيل دفع
    if request.method == 'POST':
        detail_form = PaymentDetailForm(request.POST)
        if detail_form.is_valid():
            invoice = detail_form.cleaned_data['invoice']
            amount = detail_form.cleaned_data['amount']

            # التحقق من أن المبلغ لا يتجاوز المبلغ غير المخصص
            if amount <= unallocated_amount:
                # التحقق من أن المبلغ لا يتجاوز المبلغ المتبقي للفاتورة
                remaining_amount = invoice.get_remaining_amount()
                if amount <= remaining_amount:
                    # إنشاء تفصيل الدفع
                    PaymentDetail.objects.create(
                        payment=payment,
                        invoice=invoice,
                        amount=amount
                    )

                    # تحديث حالة الفاتورة
                    invoice.update_status()

                    messages.success(request, f'تم إضافة تفصيل الدفع بنجاح')
                    return redirect('core:payment_detail', payment_id=payment.id)
                else:
                    messages.error(request, f'المبلغ يتجاوز المبلغ المتبقي للفاتورة ({remaining_amount})')
            else:
                messages.error(request, f'المبلغ يتجاوز المبلغ غير المخصص ({unallocated_amount})')
    else:
        # إذا كان هناك مبلغ غير مخصص، قم بإنشاء نموذج لإضافة تفصيل دفع
        detail_form = PaymentDetailForm(initial={'payment': payment})

        # تقييد الفواتير المتاحة للعميل وغير المدفوعة بالكامل
        if payment.client:
            detail_form.fields['invoice'].queryset = LeaveInvoice.objects.filter(
                client=payment.client,
                status__in=['unpaid', 'partially_paid']
            )

    context = {
        'payment': payment,
        'payment_details': payment_details,
        'allocated_amount': allocated_amount,
        'unallocated_amount': unallocated_amount,
        'detail_form': detail_form if unallocated_amount > 0 else None
    }

    return render(request, 'core/payments/detail.html', context)


@login_required
def payment_edit(request, payment_id):
    """تعديل مدفوعة"""
    payment = get_object_or_404(Payment, id=payment_id)

    # التحقق من وجود تفاصيل دفع
    has_details = payment.payment_details.exists()

    if request.method == 'POST':
        form = PaymentForm(request.POST, instance=payment)
        if form.is_valid():
            # إذا كان هناك تفاصيل دفع، لا تسمح بتغيير المبلغ أو العميل
            if has_details:
                if form.cleaned_data['amount'] != payment.amount:
                    form.add_error('amount', 'لا يمكن تغيير المبلغ لأن هناك تفاصيل دفع مرتبطة')
                    return render(request, 'core/payments/edit.html', {'form': form, 'payment': payment, 'has_details': has_details})

                if form.cleaned_data['client'] != payment.client:
                    form.add_error('client', 'لا يمكن تغيير العميل لأن هناك تفاصيل دفع مرتبطة')
                    return render(request, 'core/payments/edit.html', {'form': form, 'payment': payment, 'has_details': has_details})

            form.save()
            messages.success(request, f'تم تعديل المدفوعة رقم {payment.payment_number} بنجاح')
            return redirect('core:payment_detail', payment_id=payment.id)
    else:
        form = PaymentForm(instance=payment)

    return render(request, 'core/payments/edit.html', {'form': form, 'payment': payment, 'has_details': has_details})


@login_required
def payment_delete(request, payment_id):
    """حذف مدفوعة"""
    payment = get_object_or_404(Payment, id=payment_id)

    # التحقق من وجود تفاصيل دفع
    payment_details = payment.payment_details.all()

    if request.method == 'POST':
        # حفظ الفواتير المرتبطة لتحديث حالتها بعد الحذف
        invoices = [detail.invoice for detail in payment_details]

        payment_number = payment.payment_number  # حفظ رقم المدفوعة قبل الحذف
        payment.delete()

        # تحديث حالة الفواتير
        for invoice in invoices:
            invoice.update_status()

        messages.success(request, f'تم حذف المدفوعة رقم {payment_number} بنجاح')
        return redirect('core:payment_list')

    context = {
        'payment': payment,
        'payment_details': payment_details
    }

    return render(request, 'core/payments/delete.html', context)


@login_required
def payment_print(request, payment_id):
    """طباعة إيصال الدفع"""
    payment = get_object_or_404(Payment, id=payment_id)

    # الحصول على تفاصيل الدفع
    payment_details = payment.payment_details.select_related('invoice').all()

    # حساب المبلغ المخصص وغير المخصص
    allocated_amount = sum(detail.amount for detail in payment_details)
    unallocated_amount = payment.amount - allocated_amount

    context = {
        'payment': payment,
        'payment_details': payment_details,
        'allocated_amount': allocated_amount,
        'unallocated_amount': unallocated_amount,
        'print_mode': True
    }

    return render(request, 'core/payments/print.html', context)

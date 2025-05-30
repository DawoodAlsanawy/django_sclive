from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import ClientForm
from core.models import Client, LeaveInvoice, Payment


@login_required
def client_list(request):
    """قائمة العملاء"""
    clients = Client.objects.all().order_by('name')

    # تطبيق الفلاتر
    name = request.GET.get('name')
    phone = request.GET.get('phone')
    email = request.GET.get('email')

    if name:
        clients = clients.filter(name__icontains=name)

    if phone:
        clients = clients.filter(phone__icontains=phone)

    if email:
        clients = clients.filter(email__icontains=email)

    return render(request, 'core/clients/list.html', {'clients': clients})


@login_required
def client_create(request):
    """إنشاء عميل جديد"""
    if request.method == 'POST':
        form = ClientForm(request.POST)
        if form.is_valid():
            client = form.save()
            messages.success(request, f'تم إنشاء العميل {client.name} بنجاح')
            return redirect('core:client_list')
    else:
        form = ClientForm()

    return render(request, 'core/clients/create.html', {'form': form})


@login_required
def client_edit(request, client_id):
    """تعديل عميل"""
    client = get_object_or_404(Client, id=client_id)

    if request.method == 'POST':
        form = ClientForm(request.POST, instance=client)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل العميل {client.name} بنجاح')
            return redirect('core:client_detail', client_id=client.id)
    else:
        form = ClientForm(instance=client)

    return render(request, 'core/clients/edit.html', {'form': form, 'client': client})


@login_required
def client_delete(request, client_id):
    """حذف عميل"""
    client = get_object_or_404(Client, id=client_id)

    # التحقق من وجود فواتير مرتبطة بالعميل
    invoices_count = client.invoices.count()

    if request.method == 'POST':
        client_name = client.name  # حفظ اسم العميل قبل الحذف
        client.delete()
        messages.success(request, f'تم حذف العميل {client_name} بنجاح')
        return redirect('core:client_list')

    context = {
        'client': client,
        'invoices_count': invoices_count
    }

    return render(request, 'core/clients/delete.html', context)


@login_required
def client_detail(request, client_id):
    """تفاصيل العميل"""
    client = get_object_or_404(Client, id=client_id)

    # الحصول على الفواتير للعميل
    invoices = LeaveInvoice.objects.filter(client=client).order_by('-issue_date')

    # الحصول على المدفوعات للعميل
    payments = Payment.objects.filter(client=client).order_by('-payment_date')

    # حساب إجمالي المبالغ
    total_invoices = sum(invoice.amount for invoice in invoices)
    total_payments = sum(payment.amount for payment in payments)
    balance = total_invoices - total_payments

    context = {
        'client': client,
        'invoices': invoices,
        'payments': payments,
        'total_invoices': total_invoices,
        'total_payments': total_payments,
        'balance': balance
    }

    return render(request, 'core/clients/detail.html', context)

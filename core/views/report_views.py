from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum
from django.shortcuts import render

from core.models import (Client, CompanionLeave, LeaveInvoice, Payment,
                         SickLeave)


@login_required
def report_index(request):
    """صفحة فهرس التقارير"""
    return render(request, 'core/reports/index.html')


@login_required
def report_sick_leaves(request):
    """تقرير الإجازات المرضية"""
    # الحصول على جميع الإجازات المرضية
    sick_leaves = SickLeave.objects.all().order_by('-start_date')

    # تطبيق الفلاتر
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    status = request.GET.get('status')

    if start_date:
        sick_leaves = sick_leaves.filter(start_date__gte=start_date)

    if end_date:
        sick_leaves = sick_leaves.filter(end_date__lte=end_date)

    if status:
        sick_leaves = sick_leaves.filter(status=status)

    # إحصائيات
    total_leaves = sick_leaves.count()
    active_leaves = sick_leaves.filter(status='active').count()
    expired_leaves = sick_leaves.filter(status='expired').count()
    cancelled_leaves = sick_leaves.filter(status='cancelled').count()

    # إحصائيات حسب المدة
    duration_stats = sick_leaves.values('duration_days').annotate(count=Count('id')).order_by('duration_days')

    context = {
        'sick_leaves': sick_leaves,
        'total_leaves': total_leaves,
        'active_leaves': active_leaves,
        'expired_leaves': expired_leaves,
        'cancelled_leaves': cancelled_leaves,
        'duration_stats': duration_stats,
        'filters': {
            'start_date': start_date,
            'end_date': end_date,
            'status': status
        }
    }

    return render(request, 'core/reports/sick_leaves.html', context)


@login_required
def report_companion_leaves(request):
    """تقرير إجازات المرافقين"""
    # الحصول على جميع إجازات المرافقين
    companion_leaves = CompanionLeave.objects.all().order_by('-start_date')

    # تطبيق الفلاتر
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    status = request.GET.get('status')

    if start_date:
        companion_leaves = companion_leaves.filter(start_date__gte=start_date)

    if end_date:
        companion_leaves = companion_leaves.filter(end_date__lte=end_date)

    if status:
        companion_leaves = companion_leaves.filter(status=status)

    # إحصائيات
    total_leaves = companion_leaves.count()
    active_leaves = companion_leaves.filter(status='active').count()
    expired_leaves = companion_leaves.filter(status='expired').count()
    cancelled_leaves = companion_leaves.filter(status='cancelled').count()

    # إحصائيات حسب المدة
    duration_stats = companion_leaves.values('duration_days').annotate(count=Count('id')).order_by('duration_days')

    context = {
        'companion_leaves': companion_leaves,
        'total_leaves': total_leaves,
        'active_leaves': active_leaves,
        'expired_leaves': expired_leaves,
        'cancelled_leaves': cancelled_leaves,
        'duration_stats': duration_stats,
        'filters': {
            'start_date': start_date,
            'end_date': end_date,
            'status': status
        }
    }

    return render(request, 'core/reports/companion_leaves.html', context)


@login_required
def report_invoices(request):
    """تقرير الفواتير"""
    # الحصول على جميع الفواتير
    invoices = LeaveInvoice.objects.all().order_by('-issue_date')

    # تطبيق الفلاتر
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    status = request.GET.get('status')
    client_id = request.GET.get('client_id')
    leave_type = request.GET.get('leave_type')

    if start_date:
        invoices = invoices.filter(issue_date__gte=start_date)

    if end_date:
        invoices = invoices.filter(issue_date__lte=end_date)

    if status:
        invoices = invoices.filter(status=status)

    if client_id:
        invoices = invoices.filter(client_id=client_id)

    if leave_type:
        invoices = invoices.filter(leave_type=leave_type)

    # إحصائيات
    total_invoices = invoices.count()
    total_amount = invoices.aggregate(total=Sum('amount'))['total'] or 0
    paid_invoices = invoices.filter(status='paid').count()
    paid_amount = invoices.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
    unpaid_invoices = invoices.filter(status='unpaid').count()
    unpaid_amount = invoices.filter(status='unpaid').aggregate(total=Sum('amount'))['total'] or 0
    partially_paid_invoices = invoices.filter(status='partially_paid').count()
    partially_paid_amount = invoices.filter(status='partially_paid').aggregate(total=Sum('amount'))['total'] or 0

    # إحصائيات حسب نوع الإجازة
    leave_type_stats = invoices.values('leave_type').annotate(
        count=Count('id'),
        total=Sum('amount')
    ).order_by('leave_type')

    # إحصائيات حسب العميل
    client_stats = invoices.values('client__name').annotate(
        count=Count('id'),
        total=Sum('amount')
    ).order_by('-total')[:10]

    context = {
        'invoices': invoices,
        'total_invoices': total_invoices,
        'total_amount': total_amount,
        'paid_invoices': paid_invoices,
        'paid_amount': paid_amount,
        'unpaid_invoices': unpaid_invoices,
        'unpaid_amount': unpaid_amount,
        'partially_paid_invoices': partially_paid_invoices,
        'partially_paid_amount': partially_paid_amount,
        'leave_type_stats': leave_type_stats,
        'client_stats': client_stats,
        'filters': {
            'start_date': start_date,
            'end_date': end_date,
            'status': status,
            'client_id': client_id,
            'leave_type': leave_type
        }
    }

    return render(request, 'core/reports/invoices.html', context)


@login_required
def report_payments(request):
    """تقرير المدفوعات"""
    # الحصول على جميع المدفوعات
    payments = Payment.objects.all().order_by('-payment_date')

    # تطبيق الفلاتر
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    payment_method = request.GET.get('payment_method')
    client_id = request.GET.get('client_id')

    if start_date:
        payments = payments.filter(payment_date__gte=start_date)

    if end_date:
        payments = payments.filter(payment_date__lte=end_date)

    if payment_method:
        payments = payments.filter(payment_method=payment_method)

    if client_id:
        payments = payments.filter(client_id=client_id)

    # إحصائيات
    total_payments = payments.count()
    total_amount = payments.aggregate(total=Sum('amount'))['total'] or 0

    # إحصائيات حسب طريقة الدفع
    payment_method_stats = payments.values('payment_method').annotate(
        count=Count('id'),
        total=Sum('amount')
    ).order_by('payment_method')

    # إحصائيات حسب العميل
    client_stats = payments.values('client__name').annotate(
        count=Count('id'),
        total=Sum('amount')
    ).order_by('-total')[:10]

    context = {
        'payments': payments,
        'total_payments': total_payments,
        'total_amount': total_amount,
        'payment_method_stats': payment_method_stats,
        'client_stats': client_stats,
        'filters': {
            'start_date': start_date,
            'end_date': end_date,
            'payment_method': payment_method,
            'client_id': client_id
        }
    }

    return render(request, 'core/reports/payments.html', context)


@login_required
def report_clients(request):
    """تقرير العملاء"""
    # الحصول على جميع العملاء
    clients = Client.objects.all().order_by('name')

    # إحصائيات
    total_clients = clients.count()

    # إحصائيات الفواتير والمدفوعات لكل عميل
    client_stats = []
    for client in clients:
        invoices = LeaveInvoice.objects.filter(client=client)
        payments = Payment.objects.filter(client=client)
        
        total_invoices = invoices.count()
        total_invoices_amount = invoices.aggregate(total=Sum('amount'))['total'] or 0
        
        total_payments = payments.count()
        total_payments_amount = payments.aggregate(total=Sum('amount'))['total'] or 0
        
        balance = total_invoices_amount - total_payments_amount
        
        client_stats.append({
            'client': client,
            'total_invoices': total_invoices,
            'total_invoices_amount': total_invoices_amount,
            'total_payments': total_payments,
            'total_payments_amount': total_payments_amount,
            'balance': balance
        })
    
    # ترتيب العملاء حسب الرصيد
    client_stats.sort(key=lambda x: x['balance'], reverse=True)

    context = {
        'clients': clients,
        'total_clients': total_clients,
        'client_stats': client_stats
    }

    return render(request, 'core/reports/clients.html', context)

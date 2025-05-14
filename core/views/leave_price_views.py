from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import LeavePriceForm
from core.models import LeavePrice, LeaveInvoice


@login_required
def leave_price_list(request):
    """قائمة أسعار الإجازات"""
    # تطبيق الفلاتر
    leave_prices = LeavePrice.objects.all()

    # فلتر نوع الإجازة
    leave_type = request.GET.get('leave_type')
    if leave_type:
        leave_prices = leave_prices.filter(leave_type=leave_type)

    # فلتر المدة
    duration_days = request.GET.get('duration_days')
    if duration_days:
        try:
            duration_days = int(duration_days)
            leave_prices = leave_prices.filter(duration_days=duration_days)
        except ValueError:
            pass

    # فلتر الحالة
    is_active = request.GET.get('is_active')
    if is_active == 'true':
        leave_prices = leave_prices.filter(is_active=True)
    elif is_active == 'false':
        leave_prices = leave_prices.filter(is_active=False)

    # الترتيب
    sort_by = request.GET.get('sort', 'duration_days')
    if sort_by not in ['leave_type', '-leave_type', 'duration_days', '-duration_days', 'price', '-price', 'is_active', '-is_active']:
        sort_by = 'duration_days'

    leave_prices = leave_prices.order_by(sort_by)

    context = {
        'leave_prices': leave_prices,
        'leave_type': leave_type,
        'duration_days': duration_days,
        'is_active': is_active,
        'sort': sort_by
    }

    return render(request, 'core/leave_prices/list.html', context)


@login_required
def leave_price_create(request):
    """إنشاء سعر إجازة جديد"""
    if request.method == 'POST':
        form = LeavePriceForm(request.POST)
        if form.is_valid():
            leave_price = form.save()
            leave_type_display = 'إجازة مرضية' if leave_price.leave_type == 'sick_leave' else 'إجازة مرافق'
            messages.success(request, f'تم إنشاء سعر {leave_type_display} لمدة {leave_price.duration_days} يوم بمبلغ {leave_price.price} ريال بنجاح')
            return redirect('core:leave_price_list')
    else:
        form = LeavePriceForm()

    return render(request, 'core/leave_prices/create.html', {'form': form})


@login_required
def leave_price_edit(request, leave_price_id):
    """تعديل سعر إجازة"""
    leave_price = get_object_or_404(LeavePrice, id=leave_price_id)

    if request.method == 'POST':
        form = LeavePriceForm(request.POST, instance=leave_price)
        if form.is_valid():
            leave_price = form.save()
            leave_type_display = 'إجازة مرضية' if leave_price.leave_type == 'sick_leave' else 'إجازة مرافق'
            messages.success(request, f'تم تعديل سعر {leave_type_display} لمدة {leave_price.duration_days} يوم بمبلغ {leave_price.price} ريال بنجاح')
            return redirect('core:leave_price_list')
    else:
        form = LeavePriceForm(instance=leave_price)

    return render(request, 'core/leave_prices/edit.html', {'form': form, 'leave_price': leave_price})


@login_required
def leave_price_delete(request, leave_price_id):
    """حذف سعر إجازة"""
    leave_price = get_object_or_404(LeavePrice, id=leave_price_id)

    # التحقق من استخدام السعر في الفواتير
    invoices_count = LeaveInvoice.objects.filter(
        Q(leave_type=leave_price.leave_type) &
        Q(amount=leave_price.price)
    ).count()

    if request.method == 'POST':
        leave_type_display = 'إجازة مرضية' if leave_price.leave_type == 'sick_leave' else 'إجازة مرافق'
        duration_days = leave_price.duration_days
        price = leave_price.price
        leave_price.delete()
        messages.success(request, f'تم حذف سعر {leave_type_display} لمدة {duration_days} يوم بمبلغ {price} ريال بنجاح')
        return redirect('core:leave_price_list')

    context = {
        'leave_price': leave_price,
        'invoices_count': invoices_count
    }

    return render(request, 'core/leave_prices/delete.html', context)

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import LeavePriceForm
from core.models import LeaveInvoice, LeavePrice


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

    # التحقق من استخدام السعر في الفواتير بشكل أكثر دقة
    # نبحث عن الفواتير التي تم إنشاؤها باستخدام هذا السعر
    # نحتاج إلى تحسين هذا البحث لأن السعر قد يكون تم حسابه بناءً على هذا السعر
    # وليس بالضرورة أن يكون مطابقًا تمامًا

    # البحث عن الفواتير بناءً على نوع الإجازة والسعر
    invoices = LeaveInvoice.objects.filter(
        leave_type=leave_price.leave_type
    )

    # إذا كان السعر ثابتًا، نبحث عن الفواتير التي لها نفس المبلغ
    if leave_price.pricing_type == 'fixed':
        invoices = invoices.filter(amount=leave_price.price)
    else:
        # إذا كان السعر يوميًا، نبحث عن الفواتير التي قد تكون استخدمت هذا السعر
        # نحتاج إلى تحسين هذا البحث في المستقبل
        # حاليًا نبحث عن الفواتير التي لها مبلغ قريب من السعر اليومي × المدة
        daily_price = leave_price.price / leave_price.duration_days if leave_price.duration_days > 0 else 0

        # نبحث عن الفواتير التي لها مبلغ يساوي السعر اليومي مضروبًا في أي مدة
        # هذا بحث تقريبي وليس دقيقًا 100%
        if daily_price > 0:
            invoices = invoices.filter(
                Q(amount__gte=daily_price) &  # المبلغ أكبر من أو يساوي السعر اليومي
                Q(amount__lt=daily_price * 100)  # المبلغ أقل من السعر اليومي × 100 (حد أقصى معقول)
            )

    invoices_count = invoices.count()

    if request.method == 'POST':
        leave_type_display = 'إجازة مرضية' if leave_price.leave_type == 'sick_leave' else 'إجازة مرافق'
        pricing_type_display = 'ثابت' if leave_price.pricing_type == 'fixed' else 'يومي'
        duration_days = leave_price.duration_days
        price = leave_price.price

        # تعطيل السعر بدلاً من حذفه إذا كان مستخدمًا في فواتير
        if invoices_count > 0:
            leave_price.is_active = False
            leave_price.save()
            messages.success(request, f'تم تعطيل سعر {leave_type_display} {pricing_type_display} لمدة {duration_days} يوم بمبلغ {price} ريال بنجاح')
        else:
            leave_price.delete()
            messages.success(request, f'تم حذف سعر {leave_type_display} {pricing_type_display} لمدة {duration_days} يوم بمبلغ {price} ريال بنجاح')

        return redirect('core:leave_price_list')

    context = {
        'leave_price': leave_price,
        'invoices_count': invoices_count
    }

    return render(request, 'core/leave_prices/delete.html', context)

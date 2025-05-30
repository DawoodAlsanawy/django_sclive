import os

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from core.models import CompanionLeave, SickLeave

from .forms import LeaveRequestForm
from .models import LeaveRequest


@login_required
def leave_request_list(request):
    """قائمة طلبات الإجازات"""
    leave_requests = LeaveRequest.objects.all().order_by('-created_at')

    # تطبيق الفلاتر
    processed = request.GET.get('processed')
    leave_type = request.GET.get('leave_type')

    if processed:
        if processed == 'yes':
            leave_requests = leave_requests.filter(processed=True)
        elif processed == 'no':
            leave_requests = leave_requests.filter(processed=False)

    if leave_type:
        leave_requests = leave_requests.filter(leave_type=leave_type)

    return render(request, 'ai_leaves/leave_request_list.html', {'leave_requests': leave_requests})


@login_required
def leave_request_create(request):
    """إنشاء طلب إجازة جديد باستخدام الذكاء الاصطناعي"""
    # التحقق من وجود نموذج BERT
    bert_model_path = "./bert_model"
    if not os.path.exists(bert_model_path):
        messages.warning(
            request,
            'نموذج BERT غير متوفر. يرجى تنزيل النموذج أولاً باستخدام الأمر: python manage.py download_bert'
        )
        return redirect('ai_leaves:leave_request_list')

    if request.method == 'POST':
        form = LeaveRequestForm(request.POST)
        if form.is_valid():
            leave_request = form.save()

            # معالجة الطلب وإنشاء الإجازة
            leave = leave_request.process_request()

            if leave:
                messages.success(request, f'تم إنشاء الإجازة بنجاح برقم {leave.leave_id}')

                # تحديد نوع الإجازة وإعادة التوجيه إلى صفحة التفاصيل المناسبة
                if isinstance(leave, SickLeave):
                    return redirect('core:sick_leave_detail', leave_id=leave.id)
                elif isinstance(leave, CompanionLeave):
                    return redirect('core:companion_leave_detail', leave_id=leave.id)
            else:
                messages.error(request, 'حدث خطأ أثناء معالجة الطلب')
    else:
        form = LeaveRequestForm()

    return render(request, 'ai_leaves/leave_request_create.html', {'form': form})


@login_required
def leave_request_process(request, request_id):
    """معالجة طلب إجازة يدويًا"""
    # التحقق من وجود نموذج BERT
    bert_model_path = "./bert_model"
    if not os.path.exists(bert_model_path):
        messages.warning(
            request,
            'نموذج BERT غير متوفر. يرجى تنزيل النموذج أولاً باستخدام الأمر: python manage.py download_bert'
        )
        return redirect('ai_leaves:leave_request_list')

    leave_request = get_object_or_404(LeaveRequest, id=request_id)

    if leave_request.processed:
        messages.warning(request, 'تم معالجة هذا الطلب مسبقًا')
        return redirect('ai_leaves:leave_request_list')

    # معالجة الطلب وإنشاء الإجازة
    leave = leave_request.process_request()

    if leave:
        messages.success(request, f'تم معالجة الطلب وإنشاء الإجازة بنجاح برقم {leave.leave_id}')

        # تحديد نوع الإجازة وإعادة التوجيه إلى صفحة التفاصيل المناسبة
        if isinstance(leave, SickLeave):
            return redirect('core:sick_leave_detail', leave_id=leave.id)
        elif isinstance(leave, CompanionLeave):
            return redirect('core:companion_leave_detail', leave_id=leave.id)
    else:
        messages.error(request, 'حدث خطأ أثناء معالجة الطلب')

    return redirect('ai_leaves:leave_request_list')

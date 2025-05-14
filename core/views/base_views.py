from django.contrib.auth.decorators import login_required
from django.db import models
from django.shortcuts import render

from core.models import (Client, CompanionLeave, Doctor, Hospital, LeaveInvoice,
                         Patient, Payment, SickLeave)


def home(request):
    """الصفحة الرئيسية"""
    # إذا كان المستخدم مسجل الدخول، عرض لوحة التحكم
    if request.user.is_authenticated:
        # إحصائيات عامة
        stats = {
            'sick_leaves_count': SickLeave.objects.count(),
            'companion_leaves_count': CompanionLeave.objects.count(),
            'invoices_count': LeaveInvoice.objects.count(),
            'payments_count': Payment.objects.count(),
            'clients_count': Client.objects.count(),
            'patients_count': Patient.objects.count(),
            'doctors_count': Doctor.objects.count(),
        }

        # إحصائيات مالية
        total_invoices_amount = LeaveInvoice.objects.filter(status__in=['unpaid', 'partially_paid', 'paid']).aggregate(total=models.Sum('amount'))['total'] or 0
        total_payments_amount = Payment.objects.aggregate(total=models.Sum('amount'))['total'] or 0
        stats['total_invoices_amount'] = total_invoices_amount
        stats['total_payments_amount'] = total_payments_amount
        stats['total_balance'] = total_invoices_amount - total_payments_amount

        # آخر الإجازات المرضية
        recent_sick_leaves = SickLeave.objects.order_by('-created_at')[:5]

        # آخر إجازات المرافقين
        recent_companion_leaves = CompanionLeave.objects.order_by('-created_at')[:5]

        # آخر الفواتير
        recent_invoices = LeaveInvoice.objects.order_by('-created_at')[:5]

        # آخر المدفوعات
        recent_payments = Payment.objects.order_by('-created_at')[:5]

        # إحصائيات خاصة بالطبيب
        if hasattr(request.user, 'is_doctor') and request.user.is_doctor():
            doctor = Doctor.objects.filter(name__icontains=request.user.username).first()
            if doctor:
                doctor_sick_leaves = SickLeave.objects.filter(doctor=doctor)
                doctor_companion_leaves = CompanionLeave.objects.filter(doctor=doctor)
                stats['doctor_sick_leaves_count'] = doctor_sick_leaves.count()
                stats['doctor_companion_leaves_count'] = doctor_companion_leaves.count()
                stats['doctor_recent_sick_leaves'] = doctor_sick_leaves.order_by('-created_at')[:5]
                stats['doctor_recent_companion_leaves'] = doctor_companion_leaves.order_by('-created_at')[:5]

        context = {
            'stats': stats,
            'recent_sick_leaves': recent_sick_leaves,
            'recent_companion_leaves': recent_companion_leaves,
            'recent_invoices': recent_invoices,
            'recent_payments': recent_payments,
        }

        return render(request, 'core/home.html', context)

    # إذا كان المستخدم غير مسجل الدخول، عرض صفحة الترحيب
    else:
        return render(request, 'core/index.html')


def about(request):
    """صفحة حول التطبيق"""
    return render(request, 'core/about.html')


def verify(request):
    """التحقق من صحة الإجازة"""
    result = None
    error_message = None

    if request.method == 'POST':
        leave_id = request.POST.get('leave_id', '').strip()

        if not leave_id:
            error_message = "الرجاء إدخال رقم الإجازة"
        else:
            # البحث عن الإجازة المرضية
            sick_leave = SickLeave.objects.filter(leave_id=leave_id).first()

            if sick_leave:
                result = {
                    'is_valid': True,
                    'leave_id': sick_leave.leave_id,
                    'leave_type': 'sick_leave',
                    'patient_name': sick_leave.patient.name,
                    'start_date': sick_leave.start_date,
                    'end_date': sick_leave.end_date,
                    'duration_days': sick_leave.duration_days,
                    'doctor_name': sick_leave.doctor.name,
                    'status': sick_leave.status
                }
            else:
                # البحث عن إجازة المرافق
                companion_leave = CompanionLeave.objects.filter(leave_id=leave_id).first()

                if companion_leave:
                    result = {
                        'is_valid': True,
                        'leave_id': companion_leave.leave_id,
                        'leave_type': 'companion_leave',
                        'patient_name': companion_leave.patient.name,
                        'companion_name': companion_leave.companion.name,
                        'start_date': companion_leave.start_date,
                        'end_date': companion_leave.end_date,
                        'duration_days': companion_leave.duration_days,
                        'doctor_name': companion_leave.doctor.name,
                        'status': companion_leave.status
                    }
                else:
                    result = {
                        'is_valid': False,
                        'leave_id': leave_id
                    }

    context = {
        'result': result,
        'error_message': error_message
    }
    return render(request, 'core/verify.html', context)


@login_required
def update_all_leaves_status(request):
    """تحديث حالة جميع الإجازات"""
    # تحديث حالة الإجازات المرضية
    sick_leaves = SickLeave.objects.all()
    sick_updated = 0
    for leave in sick_leaves:
        old_status = leave.status
        leave.update_status()
        if old_status != leave.status:
            sick_updated += 1

    # تحديث حالة إجازات المرافقين
    companion_leaves = CompanionLeave.objects.all()
    companion_updated = 0
    for leave in companion_leaves:
        old_status = leave.status
        leave.update_status()
        if old_status != leave.status:
            companion_updated += 1

    from django.contrib import messages
    from django.shortcuts import redirect
    
    messages.success(request, f'تم تحديث حالة {sick_updated} إجازة مرضية و {companion_updated} إجازة مرافق')

    # العودة إلى الصفحة السابقة
    referer = request.META.get('HTTP_REFERER')
    if referer:
        return redirect(referer)
    return redirect('core:dashboard')

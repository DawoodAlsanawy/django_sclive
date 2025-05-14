from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from core.models import (Client, CompanionLeave, Doctor, LeaveInvoice,
                         LeavePrice, Patient, SickLeave)


def doctor_search_api(request):
    """واجهة برمجة تطبيقات للبحث عن الأطباء"""
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse([], safe=False)

    doctors = Doctor.objects.filter(
        Q(name__icontains=query) | Q(national_id__icontains=query)
    )[:10]

    results = []
    for doctor in doctors:
        results.append({
            'id': doctor.id,
            'display': doctor.name,
            'national_id': doctor.national_id,
            'position': doctor.position,
            'hospital': doctor.hospital.name if doctor.hospital else '',
            'phone': doctor.phone or '',
            'email': doctor.email or ''
        })

    return JsonResponse(results, safe=False)


def patient_search_api(request):
    """واجهة برمجة تطبيقات للبحث عن المرضى"""
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse([], safe=False)

    patients = Patient.objects.filter(
        Q(name__icontains=query) |
        Q(national_id__icontains=query) |
        Q(phone__icontains=query) |
        Q(email__icontains=query)
    )[:10]

    results = []
    for patient in patients:
        employer_name = patient.employer_name or "غير محدد"
        results.append({
            'id': patient.id,
            'text': f"{patient.name} ({patient.national_id})",
            'display': patient.name,
            'national_id': patient.national_id,
            'nationality': patient.nationality or '',
            'employer': employer_name,
            'phone': patient.phone or '',
            'email': patient.email or '',
            'address': patient.address or ''
        })

    return JsonResponse(results, safe=False)


def client_search_api(request):
    """واجهة برمجة تطبيقات للبحث عن العملاء"""
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse([], safe=False)

    clients = Client.objects.filter(
        Q(name__icontains=query) | Q(phone__icontains=query) | Q(email__icontains=query)
    )[:10]

    results = []
    for client in clients:
        results.append({
            'id': client.id,
            'text': f"{client.name} ({client.phone})",
            'display': client.name,
            'phone': client.phone,
            'email': client.email or '',
            'address': client.address or '',
            'balance': client.get_balance()
        })

    return JsonResponse(results, safe=False)


def leave_price_api_get_price(request):
    """واجهة برمجية للحصول على سعر الإجازة"""
    leave_type = request.GET.get('leave_type', '')
    try:
        duration_days = int(request.GET.get('duration_days', 0))
    except (ValueError, TypeError):
        duration_days = 0
    client_id = request.GET.get('client_id')

    if not leave_type or duration_days <= 0:
        return JsonResponse({'success': False, 'message': 'بيانات غير صحيحة'})

    # الحصول على العميل إذا تم تحديده
    client = None
    if client_id:
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'العميل غير موجود'})

    try:
        price = LeavePrice.get_price(leave_type, duration_days, client)
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'خطأ في حساب السعر: {str(e)}'})

    # الحصول على معلومات إضافية
    leave_type_display = 'إجازة مرضية' if leave_type == 'sick_leave' else 'إجازة مرافق'

    # البحث عن سعر مطابق تمامًا للعميل
    exact_price = None
    if client:
        exact_price = LeavePrice.objects.filter(
            leave_type=leave_type,
            duration_days=duration_days,
            client=client,
            is_active=True
        ).first()

    # إذا لم يتم العثور على سعر مخصص للعميل، ابحث عن السعر العام
    if not exact_price:
        exact_price = LeavePrice.objects.filter(
            leave_type=leave_type,
            duration_days=duration_days,
            client__isnull=True,
            is_active=True
        ).first()

    price_type = 'exact' if exact_price else 'calculated'
    daily_price = float(price) / duration_days if duration_days > 0 else 0

    return JsonResponse({
        'success': True,
        'price': float(price),
        'leave_type': leave_type,
        'leave_type_display': leave_type_display,
        'duration_days': duration_days,
        'price_type': price_type,
        'daily_price': daily_price,
        'client_id': client.id if client else None,
        'client_name': client.name if client else None
    })


def sick_leave_search_api(request):
    """واجهة برمجة تطبيقات للبحث عن الإجازات المرضية"""
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse([], safe=False)

    sick_leaves = SickLeave.objects.filter(
        Q(leave_id__icontains=query) |
        Q(patient__name__icontains=query) |
        Q(patient__national_id__icontains=query) |
        Q(doctor__name__icontains=query)
    )[:10]

    results = []
    for leave in sick_leaves:
        # الحصول على عرض الحالة
        status_display = {
            'active': 'نشطة',
            'cancelled': 'ملغية',
            'expired': 'منتهية'
        }.get(leave.status, leave.status)

        results.append({
            'id': leave.id,
            'text': f"{leave.leave_id} - {leave.patient.name}",
            'leave_id': leave.leave_id,
            'patient_name': leave.patient.name,
            'patient_id': leave.patient.id,
            'doctor_name': leave.doctor.name if leave.doctor else '',
            'start_date': leave.start_date.strftime('%Y-%m-%d') if leave.start_date else '',
            'end_date': leave.end_date.strftime('%Y-%m-%d') if leave.end_date else '',
            'duration_days': leave.duration_days,
            'status': leave.status,
            'status_display': status_display
        })

    return JsonResponse(results, safe=False)


def companion_leave_search_api(request):
    """واجهة برمجة تطبيقات للبحث عن إجازات المرافقين"""
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse([], safe=False)

    companion_leaves = CompanionLeave.objects.filter(
        Q(leave_id__icontains=query) |
        Q(patient__name__icontains=query) |
        Q(patient__national_id__icontains=query) |
        Q(companion__name__icontains=query) |
        Q(companion__national_id__icontains=query) |
        Q(doctor__name__icontains=query)
    )[:10]

    results = []
    for leave in companion_leaves:
        # الحصول على عرض الحالة
        status_display = {
            'active': 'نشطة',
            'cancelled': 'ملغية',
            'expired': 'منتهية'
        }.get(leave.status, leave.status)

        results.append({
            'id': leave.id,
            'text': f"{leave.leave_id} - {leave.patient.name} ({leave.companion.name})",
            'leave_id': leave.leave_id,
            'patient_name': leave.patient.name,
            'patient_id': leave.patient.id,
            'companion_name': leave.companion.name,
            'companion_id': leave.companion.id,
            'doctor_name': leave.doctor.name if leave.doctor else '',
            'start_date': leave.start_date.strftime('%Y-%m-%d') if leave.start_date else '',
            'end_date': leave.end_date.strftime('%Y-%m-%d') if leave.end_date else '',
            'duration_days': leave.duration_days,
            'status': leave.status,
            'status_display': status_display
        })

    return JsonResponse(results, safe=False)


def api_client_unpaid_invoices(request, client_id):
    """واجهة برمجية للحصول على الفواتير غير المدفوعة للعميل"""
    client = get_object_or_404(Client, id=client_id)

    # الحصول على الفواتير غير المدفوعة أو المدفوعة جزئيًا
    invoices = LeaveInvoice.objects.filter(
        client=client,
        status__in=['unpaid', 'partially_paid']
    ).order_by('-issue_date')

    results = []
    for invoice in invoices:
        # حساب المبلغ المتبقي
        remaining_amount = invoice.get_remaining()
        total_paid = invoice.get_total_paid()

        # الحصول على عرض الحالة
        status_display = {
            'unpaid': 'غير مدفوعة',
            'partially_paid': 'مدفوعة جزئيًا',
            'paid': 'مدفوعة بالكامل',
            'cancelled': 'ملغية'
        }.get(invoice.status, invoice.status)

        results.append({
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'issue_date': invoice.issue_date.strftime('%Y-%m-%d'),
            'due_date': invoice.due_date.strftime('%Y-%m-%d') if invoice.due_date else None,
            'amount': float(invoice.amount),
            'paid_amount': float(total_paid),
            'remaining_amount': float(remaining_amount),
            'status': invoice.status,
            'status_display': status_display,
            'leave_type': invoice.leave_type,
            'leave_type_display': 'إجازة مرضية' if invoice.leave_type == 'sick_leave' else 'إجازة مرافق',
            'leave_id': invoice.leave_id
        })

    return JsonResponse(results, safe=False)

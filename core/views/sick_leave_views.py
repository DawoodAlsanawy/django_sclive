from datetime import timedelta

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from core.forms import SickLeaveForm, SickLeaveWithInvoiceForm
from core.models import (Doctor, Hospital, LeaveInvoice, LeavePrice, Patient,
                         SickLeave)
from core.utils import generate_unique_number


@login_required
def sick_leave_list(request):
    """قائمة الإجازات المرضية"""
    # تطبيق الفلاتر مع تحسين الاستعلامات باستخدام select_related
    sick_leaves = SickLeave.objects.select_related('patient', 'doctor').all()

    # فلتر رقم الإجازة
    leave_id = request.GET.get('leave_id')
    if leave_id:
        sick_leaves = sick_leaves.filter(leave_id__icontains=leave_id)

    # فلتر المريض
    patient = request.GET.get('patient')
    if patient:
        sick_leaves = sick_leaves.filter(patient__name__icontains=patient)

    # فلتر الطبيب
    doctor = request.GET.get('doctor')
    if doctor:
        sick_leaves = sick_leaves.filter(doctor__name__icontains=doctor)

    # فلتر الحالة
    status = request.GET.get('status')
    if status:
        sick_leaves = sick_leaves.filter(status=status)

    # فلتر تاريخ البداية (من)
    start_date_from = request.GET.get('start_date_from')
    if start_date_from:
        sick_leaves = sick_leaves.filter(start_date__gte=start_date_from)

    # فلتر تاريخ البداية (إلى)
    start_date_to = request.GET.get('start_date_to')
    if start_date_to:
        sick_leaves = sick_leaves.filter(start_date__lte=start_date_to)

    # فلتر تاريخ النهاية (من)
    end_date_from = request.GET.get('end_date_from')
    if end_date_from:
        sick_leaves = sick_leaves.filter(end_date__gte=end_date_from)

    # فلتر تاريخ النهاية (إلى)
    end_date_to = request.GET.get('end_date_to')
    if end_date_to:
        sick_leaves = sick_leaves.filter(end_date__lte=end_date_to)

    # الترتيب
    sort_by = request.GET.get('sort', '-created_at')
    if sort_by not in ['leave_id', '-leave_id', 'patient__name', '-patient__name', 'doctor__name', '-doctor__name',
                      'start_date', '-start_date', 'end_date', '-end_date', 'duration_days', '-duration_days',
                      'status', '-status', 'created_at', '-created_at']:
        sort_by = '-created_at'

    sick_leaves = sick_leaves.order_by(sort_by)

    # الترقيم الصفحي
    paginator = Paginator(sick_leaves, 10)  # 10 إجازات في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'sick_leaves': page_obj,
        'leave_id': leave_id,
        'patient': patient,
        'doctor': doctor,
        'status': status,
        'start_date_from': start_date_from,
        'start_date_to': start_date_to,
        'end_date_from': end_date_from,
        'end_date_to': end_date_to,
        'sort': sort_by
    }

    return render(request, 'core/sick_leaves/list.html', context)


@login_required
def sick_leave_create(request):
    """إنشاء إجازة مرضية جديدة"""
    if request.method == 'POST':
        form = SickLeaveForm(request.POST)
        if form.is_valid():
            # معالجة إضافة مريض جديد إذا تم إدخال بياناته
            if form.cleaned_data.get('new_patient_name') and form.cleaned_data.get('new_patient_national_id'):
                # التحقق مما إذا كان المريض موجودًا بالفعل
                try:
                    patient = Patient.objects.get(national_id=form.cleaned_data['new_patient_national_id'])
                    # تحديث بيانات المريض إذا تغيرت
                    if patient.name != form.cleaned_data['new_patient_name']:
                        patient.name = form.cleaned_data['new_patient_name']
                    if form.cleaned_data.get('new_patient_phone'):
                        patient.phone = form.cleaned_data['new_patient_phone']
                    if form.cleaned_data.get('new_patient_employer_name'):
                        patient.employer_name = form.cleaned_data['new_patient_employer_name']

                    patient.save()
                except Patient.DoesNotExist:
                    # إنشاء مريض جديد
                    patient = Patient.objects.create(
                        national_id=form.cleaned_data['new_patient_national_id'],
                        name=form.cleaned_data['new_patient_name'],
                        phone=form.cleaned_data.get('new_patient_phone', ''),
                        employer_name=form.cleaned_data.get('new_patient_employer_name', '')
                    )

                # تعيين المريض الجديد في النموذج
                form.instance.patient = patient
            elif not form.cleaned_data.get('patient'):
                # إذا لم يتم تحديد مريض ولم يتم إدخال بيانات مريض جديد
                form.add_error('patient', 'يجب اختيار مريض موجود أو إدخال بيانات مريض جديد')

            # معالجة إضافة طبيب جديد إذا تم إدخال بياناته
            if form.cleaned_data.get('new_doctor_name') and form.cleaned_data.get('new_doctor_national_id'):
                # التحقق مما إذا كان الطبيب موجودًا بالفعل
                try:
                    doctor = Doctor.objects.get(national_id=form.cleaned_data['new_doctor_national_id'])
                    # تحديث بيانات الطبيب إذا تغيرت
                    if doctor.name != form.cleaned_data['new_doctor_name']:
                        doctor.name = form.cleaned_data['new_doctor_name']
                    if form.cleaned_data.get('new_doctor_position'):
                        doctor.position = form.cleaned_data['new_doctor_position']

                    # معالجة إضافة مستشفى جديد إذا تم إدخال بياناته
                    if form.cleaned_data.get('new_hospital_name'):
                        # التحقق مما إذا كان المستشفى موجودًا بالفعل
                        hospital, _ = Hospital.objects.get_or_create(
                            name=form.cleaned_data['new_hospital_name'],
                            defaults={
                                'address': form.cleaned_data.get('new_hospital_address', '')
                            }
                        )
                        doctor.hospital = hospital
                    elif form.cleaned_data.get('new_doctor_hospital'):
                        doctor.hospital = form.cleaned_data['new_doctor_hospital']

                    doctor.save()
                except Doctor.DoesNotExist:
                    # إنشاء مستشفى جديد إذا تم إدخال بياناته
                    hospital = None
                    if form.cleaned_data.get('new_hospital_name'):
                        hospital, _ = Hospital.objects.get_or_create(
                            name=form.cleaned_data['new_hospital_name'],
                            defaults={
                                'address': form.cleaned_data.get('new_hospital_address', '')
                            }
                        )
                    elif form.cleaned_data.get('new_doctor_hospital'):
                        hospital = form.cleaned_data['new_doctor_hospital']

                    if not hospital:
                        form.add_error('new_doctor_hospital', 'يجب اختيار مستشفى موجود أو إدخال بيانات مستشفى جديد للطبيب الجديد')
                        return render(request, 'core/sick_leaves/create.html', {'form': form})

                    # إنشاء طبيب جديد
                    doctor = Doctor.objects.create(
                        national_id=form.cleaned_data['new_doctor_national_id'],
                        name=form.cleaned_data['new_doctor_name'],
                        position=form.cleaned_data.get('new_doctor_position', ''),
                        hospital=hospital
                    )

                # تعيين الطبيب الجديد في النموذج
                form.instance.doctor = doctor
            elif not form.cleaned_data.get('doctor'):
                # إذا لم يتم تحديد طبيب ولم يتم إدخال بيانات طبيب جديد
                form.add_error('doctor', 'يجب اختيار طبيب موجود أو إدخال بيانات طبيب جديد')

            sick_leave = form.save()

            # إنشاء فاتورة إذا تم اختيار ذلك
            if form.cleaned_data.get('create_invoice') and form.cleaned_data.get('client'):
                client = form.cleaned_data['client']

                # حساب المبلغ بناءً على نوع الإجازة ومدتها والعميل
                price = LeavePrice.get_price('sick_leave', sick_leave.duration_days, client)

                # إنشاء رقم فاتورة فريد
                invoice_number = generate_unique_number('INV', LeaveInvoice)

                # تعيين تاريخ استحقاق افتراضي (بعد 30 يومًا من تاريخ الإصدار)
                due_date = sick_leave.issue_date + timedelta(days=30)

                # إنشاء الفاتورة
                invoice = LeaveInvoice.objects.create(
                    invoice_number=invoice_number,
                    client=client,
                    leave_type='sick_leave',
                    leave_id=sick_leave.leave_id,
                    amount=price,
                    issue_date=sick_leave.issue_date,
                    due_date=due_date
                )

                messages.success(request, f'تم إنشاء الإجازة المرضية رقم {sick_leave.leave_id} والفاتورة رقم {invoice_number} بنجاح')
            else:
                messages.success(request, f'تم إنشاء الإجازة المرضية رقم {sick_leave.leave_id} بنجاح')

            return redirect('core:sick_leave_detail', sick_leave_id=sick_leave.id)
    else:
        # توليد رقم إجازة تلقائي
        leave_id = generate_unique_number('SL', SickLeave)

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        import datetime
        today = datetime.date.today()
        initial_data = {
            'leave_id': leave_id,
            'issue_date': today
        }
        form = SickLeaveForm(initial=initial_data)

    return render(request, 'core/sick_leaves/create.html', {'form': form})


@login_required
def sick_leave_create_with_invoice(request):
    """إنشاء إجازة مرضية مع فاتورة في خطوة واحدة"""
    from datetime import datetime, timedelta

    if request.method == 'POST':
        form = SickLeaveWithInvoiceForm(request.POST)
        if form.is_valid():
            # استخراج البيانات من النموذج
            patient_national_id = form.cleaned_data['patient_national_id']
            patient_name = form.cleaned_data['patient_name']
            patient_phone = form.cleaned_data['patient_phone']

            # معالجة إضافة طبيب جديد إذا تم إدخال بياناته
            if form.cleaned_data.get('new_doctor_name') and form.cleaned_data.get('new_doctor_national_id'):
                # التحقق مما إذا كان الطبيب موجودًا بالفعل
                try:
                    doctor = Doctor.objects.get(national_id=form.cleaned_data['new_doctor_national_id'])
                    # تحديث بيانات الطبيب إذا تغيرت
                    if doctor.name != form.cleaned_data['new_doctor_name']:
                        doctor.name = form.cleaned_data['new_doctor_name']
                    if form.cleaned_data.get('new_doctor_position'):
                        doctor.position = form.cleaned_data['new_doctor_position']

                    # معالجة إضافة مستشفى جديد إذا تم إدخال بياناته
                    if form.cleaned_data.get('new_hospital_name'):
                        # التحقق مما إذا كان المستشفى موجودًا بالفعل
                        hospital, _ = Hospital.objects.get_or_create(
                            name=form.cleaned_data['new_hospital_name'],
                            defaults={
                                'address': form.cleaned_data.get('new_hospital_address', '')
                            }
                        )
                        doctor.hospital = hospital
                    elif form.cleaned_data.get('new_doctor_hospital'):
                        doctor.hospital = form.cleaned_data['new_doctor_hospital']

                    doctor.save()
                except Doctor.DoesNotExist:
                    # إنشاء مستشفى جديد إذا تم إدخال بياناته
                    hospital = None
                    if form.cleaned_data.get('new_hospital_name'):
                        hospital, _ = Hospital.objects.get_or_create(
                            name=form.cleaned_data['new_hospital_name'],
                            defaults={
                                'address': form.cleaned_data.get('new_hospital_address', '')
                            }
                        )
                    elif form.cleaned_data.get('new_doctor_hospital'):
                        hospital = form.cleaned_data['new_doctor_hospital']

                    # إنشاء طبيب جديد
                    doctor = Doctor.objects.create(
                        national_id=form.cleaned_data['new_doctor_national_id'],
                        name=form.cleaned_data['new_doctor_name'],
                        position=form.cleaned_data.get('new_doctor_position', ''),
                        hospital=hospital
                    )
            else:
                # استخدام الطبيب المحدد من القائمة
                doctor = form.cleaned_data['doctor']

            start_date = form.cleaned_data['start_date']
            end_date = form.cleaned_data['end_date']
            issue_date = form.cleaned_data['issue_date']
            create_invoice = form.cleaned_data['create_invoice']
            client = form.cleaned_data['client']

            # حساب مدة الإجازة
            delta = end_date - start_date
            duration_days = delta.days + 1  # +1 لأن اليوم الأخير محسوب

            # البحث عن المريض أو إنشاء مريض جديد
            try:
                patient = Patient.objects.get(national_id=patient_national_id)
                # تحديث بيانات المريض إذا تغيرت
                if patient.name != patient_name:
                    patient.name = patient_name
                if patient_phone and patient.phone != patient_phone:
                    patient.phone = patient_phone
                patient.save()
            except Patient.DoesNotExist:
                # إنشاء مريض جديد
                patient = Patient.objects.create(
                    national_id=patient_national_id,
                    name=patient_name,
                    phone=patient_phone
                )

            # إنشاء الإجازة المرضية
            leave_id = generate_unique_number('SL', SickLeave)
            sick_leave = SickLeave.objects.create(
                leave_id=leave_id,
                patient=patient,
                doctor=doctor,
                start_date=start_date,
                end_date=end_date,
                duration_days=duration_days,
                issue_date=issue_date
            )

            # إنشاء فاتورة تلقائياً إذا تم اختيار ذلك
            invoice = None
            if create_invoice and client:
                # حساب المبلغ بناءً على نوع الإجازة ومدتها والعميل
                price = LeavePrice.get_price('sick_leave', duration_days, client)

                # إنشاء رقم فاتورة فريد
                invoice_number = generate_unique_number('INV', LeaveInvoice)

                # تعيين تاريخ استحقاق افتراضي (بعد 30 يومًا من تاريخ الإصدار)
                due_date = issue_date + timedelta(days=30)

                # إنشاء الفاتورة
                invoice = LeaveInvoice.objects.create(
                    invoice_number=invoice_number,
                    client=client,
                    leave_type='sick_leave',
                    leave_id=leave_id,
                    amount=price,
                    issue_date=issue_date,
                    due_date=due_date
                )

                messages.success(request, f'تم إنشاء الإجازة المرضية رقم {leave_id} والفاتورة رقم {invoice_number} بنجاح')
            else:
                messages.success(request, f'تم إنشاء الإجازة المرضية رقم {leave_id} بنجاح')

            # توجيه المستخدم مباشرة إلى صفحة الطباعة
            return redirect('core:sick_leave_print', sick_leave_id=sick_leave.id)
    else:
        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        form = SickLeaveWithInvoiceForm(initial={'issue_date': datetime.now().date()})

    return render(request, 'core/sick_leaves/create_with_invoice.html', {'form': form})


@login_required
def sick_leave_detail(request, sick_leave_id):
    """تفاصيل إجازة مرضية"""
    sick_leave = get_object_or_404(SickLeave, id=sick_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    invoices = LeaveInvoice.objects.filter(leave_type='sick_leave', leave_id=sick_leave.leave_id)

    context = {
        'sick_leave': sick_leave,
        'invoices': invoices
    }

    return render(request, 'core/sick_leaves/detail.html', context)


@login_required
def sick_leave_edit(request, sick_leave_id):
    """تعديل إجازة مرضية"""
    sick_leave = get_object_or_404(SickLeave, id=sick_leave_id)

    if request.method == 'POST':
        form = SickLeaveForm(request.POST, instance=sick_leave)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل الإجازة المرضية رقم {sick_leave.leave_id} بنجاح')
            return redirect('core:sick_leave_detail', sick_leave_id=sick_leave.id)
    else:
        form = SickLeaveForm(instance=sick_leave)

    return render(request, 'core/sick_leaves/edit.html', {'form': form, 'sick_leave': sick_leave})


@login_required
def sick_leave_delete(request, sick_leave_id):
    """حذف إجازة مرضية"""
    sick_leave = get_object_or_404(SickLeave, id=sick_leave_id)

    # التحقق من وجود فواتير مرتبطة بالإجازة
    invoices = LeaveInvoice.objects.filter(leave_type='sick_leave', leave_id=sick_leave.leave_id)

    if request.method == 'POST':
        leave_id = sick_leave.leave_id  # حفظ رقم الإجازة قبل الحذف
        sick_leave.delete()
        messages.success(request, f'تم حذف الإجازة المرضية رقم {leave_id} بنجاح')
        return redirect('core:sick_leave_list')

    context = {
        'sick_leave': sick_leave,
        'invoices': invoices
    }

    return render(request, 'core/sick_leaves/delete.html', context)


@login_required
def sick_leave_print(request, sick_leave_id):
    """طباعة الإجازة المرضية"""
    sick_leave = get_object_or_404(SickLeave, id=sick_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    invoices = LeaveInvoice.objects.filter(leave_type='sick_leave', leave_id=sick_leave.leave_id)

    context = {
        'sick_leave': sick_leave,
        'invoices': invoices,
        'print_mode': True
    }

    return render(request, 'core/sick_leaves/print.html', context)

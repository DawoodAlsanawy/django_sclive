from datetime import timedelta

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from core.forms import CompanionLeaveForm, CompanionLeaveWithInvoiceForm
from core.models import (CompanionLeave, Doctor, Hospital, LeaveInvoice,
                         LeavePrice, Patient)
from core.utils import (convert_to_hijri, generate_companion_leave_id,
                        generate_unique_number, translate_text)


@login_required
def companion_leave_list(request):
    """قائمة إجازات المرافقين"""
    # تطبيق الفلاتر مع تحسين الاستعلامات باستخدام select_related
    companion_leaves = CompanionLeave.objects.select_related('patient', 'companion', 'doctor').all()

    # فلتر رقم الإجازة
    leave_id = request.GET.get('leave_id')
    if leave_id:
        companion_leaves = companion_leaves.filter(leave_id__icontains=leave_id)

    # فلتر المريض
    patient = request.GET.get('patient')
    if patient:
        companion_leaves = companion_leaves.filter(patient__name__icontains=patient)

    # فلتر المرافق
    companion = request.GET.get('companion')
    if companion:
        companion_leaves = companion_leaves.filter(companion__name__icontains=companion)

    # فلتر الطبيب
    doctor = request.GET.get('doctor')
    if doctor:
        companion_leaves = companion_leaves.filter(doctor__name__icontains=doctor)

    # فلتر الحالة
    status = request.GET.get('status')
    if status:
        companion_leaves = companion_leaves.filter(status=status)

    # فلتر تاريخ البداية (من)
    start_date_from = request.GET.get('start_date_from')
    if start_date_from:
        companion_leaves = companion_leaves.filter(start_date__gte=start_date_from)

    # فلتر تاريخ البداية (إلى)
    start_date_to = request.GET.get('start_date_to')
    if start_date_to:
        companion_leaves = companion_leaves.filter(start_date__lte=start_date_to)

    # فلتر تاريخ النهاية (من)
    end_date_from = request.GET.get('end_date_from')
    if end_date_from:
        companion_leaves = companion_leaves.filter(end_date__gte=end_date_from)

    # فلتر تاريخ النهاية (إلى)
    end_date_to = request.GET.get('end_date_to')
    if end_date_to:
        companion_leaves = companion_leaves.filter(end_date__lte=end_date_to)

    # الترتيب
    sort_by = request.GET.get('sort', '-created_at')
    if sort_by not in ['leave_id', '-leave_id', 'patient__name', '-patient__name', 'companion__name', '-companion__name',
                      'doctor__name', '-doctor__name', 'start_date', '-start_date', 'end_date', '-end_date',
                      'duration_days', '-duration_days', 'status', '-status', 'created_at', '-created_at']:
        sort_by = '-created_at'

    companion_leaves = companion_leaves.order_by(sort_by)

    # الترقيم الصفحي
    paginator = Paginator(companion_leaves, 10)  # 10 إجازات في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'companion_leaves': page_obj,
        'leave_id': leave_id,
        'patient': patient,
        'companion': companion,
        'doctor': doctor,
        'status': status,
        'start_date_from': start_date_from,
        'start_date_to': start_date_to,
        'end_date_from': end_date_from,
        'end_date_to': end_date_to,
        'sort': sort_by
    }

    return render(request, 'core/companion_leaves/list.html', context)


@login_required
def companion_leave_create(request):
    """إنشاء إجازة مرافق جديدة"""
    if request.method == 'POST':
        form = CompanionLeaveForm(request.POST)
        if form.is_valid():
            # الحصول على البادئة المختارة
            prefix = form.cleaned_data.get('prefix', 'PSL')

            # توليد رقم إجازة تلقائي باستخدام البادئة المختارة
            leave_id = generate_companion_leave_id(prefix)

            # تعيين رقم الإجازة في النموذج
            form.instance.leave_id = leave_id
            form.instance.prefix = prefix

            # تحويل التواريخ الميلادية إلى هجرية
            if form.instance.start_date:
                form.instance.start_date_hijri = convert_to_hijri(form.instance.start_date)

            if form.instance.end_date:
                form.instance.end_date_hijri = convert_to_hijri(form.instance.end_date)

            if form.instance.admission_date:
                form.instance.admission_date_hijri = convert_to_hijri(form.instance.admission_date)

            if form.instance.discharge_date:
                form.instance.discharge_date_hijri = convert_to_hijri(form.instance.discharge_date)

            if form.instance.issue_date:
                form.instance.issue_date_hijri = convert_to_hijri(form.instance.issue_date)

            companion_leave = form.save()

            # إنشاء فاتورة تلقائياً دائماً
            client = form.cleaned_data.get('client')
            if client:
                # حساب المبلغ بناءً على نوع الإجازة ومدتها والعميل
                price = LeavePrice.get_price('companion_leave', companion_leave.duration_days, client)

                # إنشاء رقم فاتورة فريد
                invoice_number = generate_unique_number('INV', LeaveInvoice)

                # تعيين تاريخ استحقاق افتراضي (بعد 30 يومًا من تاريخ الإصدار)
                due_date = companion_leave.issue_date + timedelta(days=30)

                # إنشاء الفاتورة
                LeaveInvoice.objects.create(
                    invoice_number=invoice_number,
                    client=client,
                    leave_type='companion_leave',
                    leave_id=companion_leave.leave_id,
                    amount=price,
                    issue_date=companion_leave.issue_date,
                    due_date=due_date
                )

                messages.success(request, f'تم إنشاء إجازة المرافق رقم {companion_leave.leave_id} والفاتورة رقم {invoice_number} بنجاح')
            else:
                messages.success(request, f'تم إنشاء إجازة المرافق رقم {companion_leave.leave_id} بنجاح')

            return redirect('core:companion_leave_detail', companion_leave_id=companion_leave.id)
    else:
        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        import datetime
        today = datetime.date.today()

        # سيتم توليد رقم الإجازة بعد اختيار البادئة
        initial_data = {
            'issue_date': today
        }
        form = CompanionLeaveForm(initial=initial_data)

    # الحصول على قائمة المستشفيات لاستخدامها في النوافذ المنبثقة
    hospitals = Hospital.objects.all().order_by('name')

    return render(request, 'core/companion_leaves/create.html', {'form': form, 'hospitals': hospitals})


@login_required
def companion_leave_create_with_invoice(request):
    """إنشاء إجازة مرافق مع فاتورة في خطوة واحدة"""
    if request.method == 'POST':
        form = CompanionLeaveWithInvoiceForm(request.POST)
        if form.is_valid():
            # استخراج البيانات من النموذج
            patient_national_id = form.cleaned_data['patient_national_id']
            patient_name = form.cleaned_data['patient_name']
            patient_phone = form.cleaned_data.get('patient_phone', '')

            companion_national_id = form.cleaned_data['companion_national_id']
            companion_name = form.cleaned_data['companion_name']
            companion_phone = form.cleaned_data.get('companion_phone', '')
            relation = form.cleaned_data.get('relation', '')

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
            client = form.cleaned_data.get('client')

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

            # البحث عن المرافق أو إنشاء مرافق جديد
            try:
                companion = Patient.objects.get(national_id=companion_national_id)
                # تحديث بيانات المرافق إذا تغيرت
                if companion.name != companion_name:
                    companion.name = companion_name
                if companion_phone and companion.phone != companion_phone:
                    companion.phone = companion_phone
                companion.save()
            except Patient.DoesNotExist:
                # إنشاء مرافق جديد
                companion = Patient.objects.create(
                    national_id=companion_national_id,
                    name=companion_name,
                    phone=companion_phone
                )

            # الحصول على البادئة المختارة
            prefix = form.cleaned_data.get('prefix', 'PSL')

            # إنشاء إجازة المرافق
            leave_id = generate_companion_leave_id(prefix)

            # تحويل التواريخ الميلادية إلى هجرية
            start_date_hijri = convert_to_hijri(start_date)
            end_date_hijri = convert_to_hijri(end_date)
            issue_date_hijri = convert_to_hijri(issue_date)

            companion_leave = CompanionLeave.objects.create(
                leave_id=leave_id,
                prefix=prefix,
                patient=patient,
                companion=companion,
                relation=relation,
                doctor=doctor,
                start_date=start_date,
                start_date_hijri=start_date_hijri,
                end_date=end_date,
                end_date_hijri=end_date_hijri,
                duration_days=duration_days,
                issue_date=issue_date,
                issue_date_hijri=issue_date_hijri
            )

            # إنشاء فاتورة تلقائياً دائماً
            client = form.cleaned_data.get('client')
            if client:
                # حساب المبلغ بناءً على نوع الإجازة ومدتها والعميل
                price = LeavePrice.get_price('companion_leave', companion_leave.duration_days, client)

                # إنشاء رقم فاتورة فريد
                invoice_number = generate_unique_number('INV', LeaveInvoice)

                # تعيين تاريخ استحقاق افتراضي (بعد 30 يومًا من تاريخ الإصدار)
                due_date = companion_leave.issue_date + timedelta(days=30)

                # إنشاء الفاتورة
                LeaveInvoice.objects.create(
                    invoice_number=invoice_number,
                    client=client,
                    leave_type='companion_leave',
                    leave_id=companion_leave.leave_id,
                    amount=price,
                    issue_date=companion_leave.issue_date,
                    due_date=due_date
                )

                messages.success(request, f'تم إنشاء إجازة المرافق رقم {companion_leave.leave_id} والفاتورة رقم {invoice_number} بنجاح')
            else:
                messages.success(request, f'تم إنشاء إجازة المرافق رقم {companion_leave.leave_id} بنجاح')

            # توجيه المستخدم مباشرة إلى صفحة الطباعة
            return redirect('core:companion_leave_print', companion_leave_id=companion_leave.id)
    else:
        # لن نقوم بتوليد رقم إجازة تلقائي هنا، سيتم توليده بعد اختيار البادئة

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        import datetime
        today = datetime.date.today()
        initial_data = {
            'issue_date': today
        }
        form = CompanionLeaveWithInvoiceForm(initial=initial_data)

    # الحصول على قائمة المستشفيات لاستخدامها في النوافذ المنبثقة
    hospitals = Hospital.objects.all().order_by('name')

    return render(request, 'core/companion_leaves/create_with_invoice.html', {'form': form, 'hospitals': hospitals})


@login_required
def companion_leave_detail(request, companion_leave_id):
    """تفاصيل إجازة مرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    related_invoices = LeaveInvoice.objects.filter(leave_type='companion_leave', leave_id=companion_leave.leave_id)

    # حساب المعلومات المالية
    total_invoices_amount = related_invoices.aggregate(total=Sum('amount'))['total'] or 0

    # حساب إجمالي المدفوعات
    total_paid_amount = 0
    for invoice in related_invoices:
        total_paid_amount += invoice.get_total_paid()

    # حساب المبلغ المتبقي
    remaining_amount = total_invoices_amount - total_paid_amount

    # الحصول على سعر إجازة المرافق
    leave_price = 0
    if hasattr(companion_leave, 'patient') and hasattr(companion_leave.patient, 'employer'):
        client = companion_leave.patient.employer
        leave_price = LeavePrice.get_price('companion_leave', companion_leave.duration_days, client)

    context = {
        'companion_leave': companion_leave,
        'related_invoices': related_invoices,
        'total_invoices_amount': total_invoices_amount,
        'total_paid_amount': total_paid_amount,
        'remaining_amount': remaining_amount,
        'leave_price': leave_price
    }

    return render(request, 'core/companion_leaves/detail.html', context)


@login_required
def companion_leave_edit(request, companion_leave_id):
    """تعديل إجازة مرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    if request.method == 'POST':
        form = CompanionLeaveForm(request.POST, instance=companion_leave)
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
                return render(request, 'core/companion_leaves/edit.html', {'form': form, 'companion_leave': companion_leave})

            # معالجة إضافة مرافق جديد إذا تم إدخال بياناته
            if form.cleaned_data.get('new_companion_name') and form.cleaned_data.get('new_companion_national_id'):
                # التحقق مما إذا كان المرافق موجودًا بالفعل
                try:
                    companion = Patient.objects.get(national_id=form.cleaned_data['new_companion_national_id'])
                    # تحديث بيانات المرافق إذا تغيرت
                    if companion.name != form.cleaned_data['new_companion_name']:
                        companion.name = form.cleaned_data['new_companion_name']
                    if form.cleaned_data.get('new_companion_phone'):
                        companion.phone = form.cleaned_data['new_companion_phone']
                    if form.cleaned_data.get('new_companion_employer_name'):
                        companion.employer_name = form.cleaned_data['new_companion_employer_name']

                    companion.save()
                except Patient.DoesNotExist:
                    # إنشاء مرافق جديد
                    companion = Patient.objects.create(
                        national_id=form.cleaned_data['new_companion_national_id'],
                        name=form.cleaned_data['new_companion_name'],
                        phone=form.cleaned_data.get('new_companion_phone', ''),
                        employer_name=form.cleaned_data.get('new_companion_employer_name', '')
                    )

                # تعيين المرافق الجديد في النموذج
                form.instance.companion = companion
            elif not form.cleaned_data.get('companion'):
                # إذا لم يتم تحديد مرافق ولم يتم إدخال بيانات مرافق جديد
                form.add_error('companion', 'يجب اختيار مرافق موجود أو إدخال بيانات مرافق جديد')
                return render(request, 'core/companion_leaves/edit.html', {'form': form, 'companion_leave': companion_leave})

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
                        return render(request, 'core/companion_leaves/edit.html', {'form': form, 'companion_leave': companion_leave})

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
                return render(request, 'core/companion_leaves/edit.html', {'form': form, 'companion_leave': companion_leave})

            # الحصول على العميل الجديد من النموذج
            new_client = form.cleaned_data.get('client')

            # تحويل التواريخ الميلادية إلى هجرية
            if form.instance.start_date:
                form.instance.start_date_hijri = convert_to_hijri(form.instance.start_date)

            if form.instance.end_date:
                form.instance.end_date_hijri = convert_to_hijri(form.instance.end_date)

            if form.instance.admission_date:
                form.instance.admission_date_hijri = convert_to_hijri(form.instance.admission_date)

            if form.instance.discharge_date:
                form.instance.discharge_date_hijri = convert_to_hijri(form.instance.discharge_date)

            if form.instance.issue_date:
                form.instance.issue_date_hijri = convert_to_hijri(form.instance.issue_date)

            # حفظ التغييرات
            updated_companion_leave = form.save()

            # الحصول على الفواتير المرتبطة بالإجازة
            invoices = LeaveInvoice.objects.filter(leave_type='companion_leave', leave_id=updated_companion_leave.leave_id)

            # إذا لم تكن هناك فواتير مرتبطة بالإجازة وتم تحديد عميل، نقوم بإنشاء فاتورة جديدة
            if not invoices.exists() and new_client:
                # حساب سعر الإجازة
                price = LeavePrice.get_price('companion_leave', updated_companion_leave.duration_days, new_client)

                # إنشاء رقم فاتورة جديد
                from core.utils import generate_unique_number
                invoice_number = generate_unique_number('INV', LeaveInvoice)

                # إنشاء فاتورة جديدة
                invoice = LeaveInvoice.objects.create(
                    invoice_number=invoice_number,
                    client=new_client,
                    leave_type='companion_leave',
                    leave_id=updated_companion_leave.leave_id,
                    amount=price,
                    issue_date=updated_companion_leave.issue_date,
                    due_date=updated_companion_leave.end_date,  # تاريخ الاستحقاق هو تاريخ نهاية الإجازة
                    notes=f'فاتورة إجازة مرافق رقم {updated_companion_leave.leave_id}'
                )

                # إضافة رسالة نجاح
                messages.success(request, f'تم إنشاء فاتورة جديدة برقم {invoice.invoice_number}')

                # تحديث قائمة الفواتير
                invoices = LeaveInvoice.objects.filter(leave_type='companion_leave', leave_id=updated_companion_leave.leave_id)

            # تحديث الفواتير المرتبطة إذا تغيرت مدة الإجازة أو العميل
            if invoices.exists() and ('duration_days' in form.changed_data or 'client' in form.changed_data):
                for invoice in invoices:
                    # تحديث العميل في الفاتورة إذا تغير
                    if 'client' in form.changed_data and new_client:
                        # إذا كان هناك عميل جديد، نقوم بتحديث العميل في الفاتورة
                        invoice.client = new_client

                    # تحديث المبلغ بناءً على المدة الجديدة والعميل
                    if invoice.client:
                        new_price = LeavePrice.get_price('companion_leave', updated_companion_leave.duration_days, invoice.client)
                        if new_price != invoice.amount:
                            # إضافة ملاحظة بتغيير السعر
                            old_amount = invoice.amount
                            invoice.amount = new_price

                            # إضافة ملاحظة بتغيير السعر
                            if not invoice.notes:
                                invoice.notes = ''
                            invoice.notes += f'\nتم تغيير المبلغ من {old_amount} إلى {new_price} بتاريخ {timezone.now().date()}'

                    # حفظ التغييرات وتحديث حالة الفاتورة
                    invoice.save()
                    invoice.update_status()  # تحديث حالة الفاتورة بعد تغيير المبلغ أو العميل

            messages.success(request, f'تم تعديل إجازة المرافق رقم {updated_companion_leave.leave_id} بنجاح')
            return redirect('core:companion_leave_detail', companion_leave_id=updated_companion_leave.id)
    else:
        form = CompanionLeaveForm(instance=companion_leave)

    # الحصول على قائمة المستشفيات لاستخدامها في النوافذ المنبثقة
    hospitals = Hospital.objects.all().order_by('name')

    return render(request, 'core/companion_leaves/edit.html', {
        'form': form,
        'companion_leave': companion_leave,
        'hospitals': hospitals
    })


@login_required
def companion_leave_delete(request, companion_leave_id):
    """حذف إجازة مرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    # التحقق من وجود فواتير مرتبطة بالإجازة
    invoices = LeaveInvoice.objects.filter(leave_type='companion_leave', leave_id=companion_leave.leave_id)

    if request.method == 'POST':
        leave_id = companion_leave.leave_id  # حفظ رقم الإجازة قبل الحذف
        companion_leave.delete()
        messages.success(request, f'تم حذف إجازة المرافق رقم {leave_id} بنجاح')
        return redirect('core:companion_leave_list')

    context = {
        'companion_leave': companion_leave,
        'invoices': invoices
    }

    return render(request, 'core/companion_leaves/delete.html', context)


@login_required
def companion_leave_print(request, companion_leave_id):
    """طباعة إجازة المرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    invoices = LeaveInvoice.objects.filter(leave_type='companion_leave', leave_id=companion_leave.leave_id)

    # الحصول على البادئة من الطلب أو استخراجها من رقم الإجازة
    prefix = request.GET.get('prefix')
    if not prefix:
        # استخراج البادئة من رقم الإجازة
        prefix = 'PSL'  # القيمة الافتراضية
        if companion_leave.leave_id.startswith('GSL'):
            prefix = 'GSL'
        elif companion_leave.leave_id.startswith('PSL'):
            prefix = 'PSL'

    # تحديد قالب الطباعة المناسب - دائمًا نستخدم نفس القالب بغض النظر عن البادئة
    template_path = 'core/companion_leaves/prints/psl.html'

    context = {
        'companion_leave': companion_leave,
        'invoices': invoices,
        'print_mode': True,
        'prefix': prefix
    }

    return render(request, template_path, context)

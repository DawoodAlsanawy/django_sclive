# -*- coding: utf-8 -*-
from django.contrib import messages
from django.contrib.auth import login, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.core.paginator import Paginator
from django.db import models
from django.db.models import Count, Q, Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# Eliminado: from .bert_processor import load_model
from .forms import (ClientForm, CompanionLeaveForm,
                    CompanionLeaveWithInvoiceForm, DoctorForm, EmployerForm,
                    HospitalForm, LeaveInvoiceForm, LeavePriceForm,
                    PatientForm, PaymentDetailForm, PaymentForm, RegisterForm,
                    SickLeaveForm, SickLeaveWithInvoiceForm, UserCreateForm,
                    UserEditForm)
from .models import (Client, CompanionLeave, Doctor, Employer, Hospital,
                     LeaveInvoice, LeavePrice, Patient, Payment, PaymentDetail,
                     SickLeave, User)

# تم نقل وظائف معالجة BERT إلى تطبيق ai_leaves


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


def register(request):
    """تسجيل حساب جديد"""
    if request.user.is_authenticated:
        return redirect('core:home')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'تم تسجيل حسابك بنجاح')
            return redirect('core:home')
    else:
        form = RegisterForm()

    return render(request, 'core/auth/register.html', {'form': form})


@login_required
def password_change(request):
    """تغيير كلمة المرور"""
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            # تحديث جلسة المستخدم لمنع تسجيل الخروج
            update_session_auth_hash(request, user)
            messages.success(request, 'تم تغيير كلمة المرور بنجاح')
            return redirect('password_change_done')
    else:
        form = PasswordChangeForm(request.user)

    return render(request, 'core/auth/password_change.html', {'form': form})


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


# تم نقل وظائف طلبات الإجازات الذكية إلى تطبيق ai_leaves


# وظائف إدارة المستخدمين
@login_required
def user_list(request):
    """قائمة المستخدمين"""
    users = User.objects.all()
    return render(request, 'core/users/list.html', {'users': users})


@login_required
def user_create(request):
    """إنشاء مستخدم جديد"""
    if not request.user.is_admin():
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    if request.method == 'POST':
        form = UserCreateForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f'تم إنشاء المستخدم {user.username} بنجاح')
            return redirect('core:user_list')
    else:
        form = UserCreateForm()

    return render(request, 'core/users/create.html', {'form': form})


@login_required
def user_edit(request, user_id):
    """تعديل مستخدم"""
    if not request.user.is_admin():
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        form = UserEditForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل المستخدم {user.username} بنجاح')
            return redirect('core:user_list')
    else:
        form = UserEditForm(instance=user)

    return render(request, 'core/users/edit.html', {'form': form, 'user': user})


@login_required
def user_delete(request, user_id):
    """حذف مستخدم"""
    if not request.user.is_admin():
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    # منع حذف المستخدم لنفسه
    if request.user.id == int(user_id):
        messages.error(request, 'لا يمكنك حذف حسابك الخاص')
        return redirect('core:user_list')

    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        username = user.username  # حفظ اسم المستخدم قبل الحذف
        user.delete()
        messages.success(request, f'تم حذف المستخدم {username} بنجاح')
        return redirect('core:user_list')

    return render(request, 'core/users/delete.html', {'user': user})


# وظائف إدارة المستشفيات
@login_required
def hospital_list(request):
    """قائمة المستشفيات"""
    hospitals = Hospital.objects.all().order_by('name')

    # تطبيق الفلاتر إذا تم إضافتها في المستقبل
    name = request.GET.get('name')
    if name:
        hospitals = hospitals.filter(name__icontains=name)

    return render(request, 'core/hospitals/list.html', {'hospitals': hospitals})


@login_required
def hospital_create(request):
    """إنشاء مستشفى جديد"""
    # التحقق من صلاحيات المستخدم
    if not request.user.is_admin() and not request.user.is_staff:
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    if request.method == 'POST':
        form = HospitalForm(request.POST, request.FILES)
        if form.is_valid():
            hospital = form.save()
            messages.success(request, f'تم إنشاء المستشفى {hospital.name} بنجاح')
            return redirect('core:hospital_list')
    else:
        form = HospitalForm()

    return render(request, 'core/hospitals/create.html', {'form': form})


@login_required
def hospital_edit(request, hospital_id):
    """تعديل مستشفى"""
    # التحقق من صلاحيات المستخدم
    if not request.user.is_admin() and not request.user.is_staff:
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    hospital = get_object_or_404(Hospital, id=hospital_id)

    if request.method == 'POST':
        form = HospitalForm(request.POST, request.FILES, instance=hospital)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل المستشفى {hospital.name} بنجاح')
            return redirect('core:hospital_list')
    else:
        form = HospitalForm(instance=hospital)

    return render(request, 'core/hospitals/edit.html', {'form': form, 'hospital': hospital})


@login_required
def hospital_delete(request, hospital_id):
    """حذف مستشفى"""
    # التحقق من صلاحيات المستخدم
    if not request.user.is_admin() and not request.user.is_staff:
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    hospital = get_object_or_404(Hospital, id=hospital_id)

    # التحقق من وجود أطباء مرتبطين بالمستشفى
    doctors_count = hospital.doctors.count()

    if request.method == 'POST':
        hospital_name = hospital.name  # حفظ اسم المستشفى قبل الحذف

        # حذف ملف الشعار إذا كان موجودًا
        if hospital.logo:
            if hospital.logo.storage.exists(hospital.logo.name):
                hospital.logo.delete()

        hospital.delete()
        messages.success(request, f'تم حذف المستشفى {hospital_name} بنجاح')
        return redirect('core:hospital_list')

    return render(request, 'core/hospitals/delete.html', {'hospital': hospital, 'doctors_count': doctors_count})


# تم إزالة وظائف إدارة جهات العمل


# وظائف إدارة الأطباء
@login_required
def doctor_list(request):
    """قائمة الأطباء"""
    doctors = Doctor.objects.all().order_by('name')

    # تطبيق الفلاتر
    name = request.GET.get('name')
    position = request.GET.get('position')
    hospital_id = request.GET.get('hospital')

    if name:
        doctors = doctors.filter(name__icontains=name)

    if position:
        doctors = doctors.filter(position__icontains=position)

    if hospital_id:
        doctors = doctors.filter(hospitals__id=hospital_id)

    # الحصول على جميع المستشفيات للفلتر
    hospitals = Hospital.objects.all().order_by('name')

    return render(request, 'core/doctors/list.html', {
        'doctors': doctors,
        'hospitals': hospitals
    })


@login_required
def doctor_create(request):
    """إنشاء طبيب جديد"""
    if request.method == 'POST':
        form = DoctorForm(request.POST)
        if form.is_valid():
            doctor = form.save()
            messages.success(request, f'تم إنشاء الطبيب {doctor.name} بنجاح')
            return redirect('core:doctor_list')
    else:
        form = DoctorForm()

    return render(request, 'core/doctors/create.html', {'form': form})


@login_required
def doctor_edit(request, doctor_id):
    """تعديل طبيب"""
    doctor = get_object_or_404(Doctor, id=doctor_id)

    if request.method == 'POST':
        form = DoctorForm(request.POST, instance=doctor)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل الطبيب {doctor.name} بنجاح')
            return redirect('core:doctor_detail', doctor_id=doctor.id)
    else:
        form = DoctorForm(instance=doctor)

    return render(request, 'core/doctors/edit.html', {'form': form, 'doctor': doctor})


@login_required
def doctor_delete(request, doctor_id):
    """حذف طبيب"""
    doctor = get_object_or_404(Doctor, id=doctor_id)

    # التحقق من وجود إجازات مرتبطة بالطبيب
    sick_leaves_count = doctor.sick_leaves.count()
    companion_leaves_count = doctor.companion_leaves.count()

    if request.method == 'POST':
        doctor_name = doctor.name  # حفظ اسم الطبيب قبل الحذف
        doctor.delete()
        messages.success(request, f'تم حذف الطبيب {doctor_name} بنجاح')
        return redirect('core:doctor_list')

    context = {
        'doctor': doctor,
        'sick_leaves_count': sick_leaves_count,
        'companion_leaves_count': companion_leaves_count
    }

    return render(request, 'core/doctors/delete.html', context)


@login_required
def doctor_detail(request, doctor_id):
    """تفاصيل الطبيب"""
    doctor = get_object_or_404(Doctor, id=doctor_id)

    # الحصول على الإجازات المرضية للطبيب
    sick_leaves = SickLeave.objects.filter(doctor=doctor).order_by('-start_date')

    # الحصول على إجازات المرافقين للطبيب
    companion_leaves = CompanionLeave.objects.filter(doctor=doctor).order_by('-start_date')

    context = {
        'doctor': doctor,
        'sick_leaves': sick_leaves,
        'companion_leaves': companion_leaves
    }

    return render(request, 'core/doctors/detail.html', context)


@login_required
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
            'hospital': ', '.join([h.name for h in doctor.hospitals.all()]) if doctor.hospitals.exists() else '',
            'phone': doctor.phone or '',
            'email': doctor.email or ''
        })

    return JsonResponse(results, safe=False)


# وظائف إدارة المرضى
@login_required
def patient_list(request):
    """قائمة المرضى"""
    # تصفية البيانات حسب المعايير
    name = request.GET.get('name')
    national_id = request.GET.get('national_id')
    phone = request.GET.get('phone')
    employer_id = request.GET.get('employer')

    patients = Patient.objects.all().order_by('name')

    if name:
        patients = patients.filter(name__icontains=name)

    if national_id:
        patients = patients.filter(national_id__icontains=national_id)

    if phone:
        patients = patients.filter(phone__icontains=phone)

    if employer_id:
        patients = patients.filter(employer_id=employer_id)

    # الحصول على جميع جهات العمل للفلتر
    employers = Employer.objects.all().order_by('name')

    return render(request, 'core/patients/list.html', {
        'patients': patients,
        'employers': employers
    })


@login_required
def patient_detail(request, patient_id):
    """تفاصيل المريض"""
    patient = get_object_or_404(Patient, id=patient_id)

    # الحصول على الإجازات المرضية للمريض
    sick_leaves = SickLeave.objects.filter(patient=patient).order_by('-start_date')

    # الحصول على إجازات المرافقين للمريض
    companion_leaves = CompanionLeave.objects.filter(patient=patient).order_by('-start_date')

    context = {
        'patient': patient,
        'sick_leaves': sick_leaves,
        'companion_leaves': companion_leaves
    }

    return render(request, 'core/patients/detail.html', context)


@login_required
def patient_create(request):
    """إنشاء مريض جديد"""
    if request.method == 'POST':
        form = PatientForm(request.POST)
        if form.is_valid():
            patient = form.save()
            messages.success(request, f'تم إنشاء المريض {patient.name} بنجاح')
            return redirect('core:patient_detail', patient_id=patient.id)
    else:
        form = PatientForm()

    return render(request, 'core/patients/create.html', {'form': form})


@login_required
def patient_edit(request, patient_id):
    """تعديل مريض"""
    patient = get_object_or_404(Patient, id=patient_id)

    if request.method == 'POST':
        form = PatientForm(request.POST, instance=patient)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل المريض {patient.name} بنجاح')
            return redirect('core:patient_detail', patient_id=patient.id)
    else:
        form = PatientForm(instance=patient)

    return render(request, 'core/patients/edit.html', {'form': form, 'patient': patient})


@login_required
def patient_delete(request, patient_id):
    """حذف مريض"""
    patient = get_object_or_404(Patient, id=patient_id)

    # التحقق من وجود إجازات مرتبطة بالمريض
    sick_leaves = SickLeave.objects.filter(patient=patient).count()
    companion_leaves = CompanionLeave.objects.filter(patient=patient).count()

    if request.method == 'POST':
        patient_name = patient.name  # حفظ اسم المريض قبل الحذف
        patient.delete()
        messages.success(request, f'تم حذف المريض {patient_name} بنجاح')
        return redirect('core:patient_list')

    context = {
        'patient': patient,
        'sick_leaves_count': sick_leaves,
        'companion_leaves_count': companion_leaves,
    }

    return render(request, 'core/patients/delete.html', context)


@login_required
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
        employer_name = patient.employer.name if patient.employer else "غير محدد"
        results.append({
            'id': patient.id,
            'text': f"{patient.name} ({patient.national_id})",
            'display': patient.name,
            'national_id': patient.national_id,
            'nationality': patient.nationality,
            'employer': employer_name,
            'phone': patient.phone or '',
            'email': patient.email or '',
            'address': patient.address or ''
        })

    return JsonResponse(results, safe=False)


# وظائف إدارة العملاء
@login_required
def client_list(request):
    """قائمة العملاء"""
    # تطبيق الفلاتر
    clients = Client.objects.all()

    # الترتيب الافتراضي
    sort_by = request.GET.get('sort', 'name')
    if sort_by not in ['name', '-name', 'created_at', '-created_at']:
        sort_by = 'name'

    clients = clients.order_by(sort_by)

    # فلتر الاسم
    name = request.GET.get('name')
    if name:
        clients = clients.filter(name__icontains=name)

    # فلتر رقم الهاتف
    phone = request.GET.get('phone')
    if phone:
        clients = clients.filter(phone__icontains=phone)

    # فلتر البريد الإلكتروني
    email = request.GET.get('email')
    if email:
        clients = clients.filter(email__icontains=email)

    # الترقيم الصفحي
    paginator = Paginator(clients, 10)  # 10 عملاء في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'clients': page_obj,
        'sort': sort_by,
        'name': name,
        'phone': phone,
        'email': email
    }

    return render(request, 'core/clients/list.html', context)


@login_required
def client_detail(request, client_id):
    """تفاصيل العميل"""
    client = get_object_or_404(Client, id=client_id)

    # الحصول على الفواتير المرتبطة بالعميل مع تحسين الاستعلامات
    invoices = LeaveInvoice.objects.filter(client=client).order_by('-created_at')

    # الحصول على المدفوعات المرتبطة بالعميل مع تحسين الاستعلامات
    payments = Payment.objects.filter(client=client).order_by('-payment_date')

    # حساب إجمالي المبالغ
    total_invoices_amount = invoices.aggregate(total=Sum('amount'))['total'] or 0
    total_payments_amount = payments.aggregate(total=Sum('amount'))['total'] or 0
    balance = total_invoices_amount - total_payments_amount

    context = {
        'client': client,
        'invoices': invoices,
        'payments': payments,
        'total_invoices_amount': total_invoices_amount,
        'total_payments_amount': total_payments_amount,
        'balance': balance
    }

    return render(request, 'core/clients/detail.html', context)


@login_required
def client_create(request):
    """إنشاء عميل جديد"""
    if request.method == 'POST':
        form = ClientForm(request.POST)
        if form.is_valid():
            client = form.save()
            messages.success(request, f'تم إنشاء العميل {client.name} بنجاح')
            return redirect('core:client_detail', client_id=client.id)
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
    invoices_count = LeaveInvoice.objects.filter(client=client).count()
    payments_count = Payment.objects.filter(client=client).count()

    if request.method == 'POST':
        client_name = client.name  # حفظ اسم العميل قبل الحذف
        client.delete()
        messages.success(request, f'تم حذف العميل {client_name} بنجاح')
        return redirect('core:client_list')

    context = {
        'client': client,
        'invoices_count': invoices_count,
        'payments_count': payments_count,
    }

    return render(request, 'core/clients/delete.html', context)


@login_required
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


# وظائف إدارة أسعار الإجازات
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


@login_required
def leave_price_api_get_price(request):
    """واجهة برمجية للحصول على سعر الإجازة"""
    leave_type = request.GET.get('leave_type', '')
    duration_days = request.GET.get('duration_days', 0, type=int)
    client_id = request.GET.get('client_id')

    if not leave_type or duration_days <= 0:
        return JsonResponse({'success': False, 'message': 'بيانات غير صحيحة'})

    # الحصول على العميل إذا تم تحديده
    client = None
    if client_id:
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            pass

    price = LeavePrice.get_price(leave_type, duration_days, client)

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

    return JsonResponse({
        'success': True,
        'price': float(price),
        'leave_type': leave_type,
        'leave_type_display': leave_type_display,
        'duration_days': duration_days,
        'price_type': price_type,
        'daily_price': float(price) / duration_days if duration_days > 0 else 0
    })


# وظائف إدارة الإجازات المرضية
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

    messages.success(request, f'تم تحديث حالة {sick_updated} إجازة مرضية و {companion_updated} إجازة مرافق')

    # العودة إلى الصفحة السابقة
    referer = request.META.get('HTTP_REFERER')
    if referer:
        return redirect(referer)
    return redirect('core:dashboard')

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
                from datetime import timedelta

                from core.utils import generate_unique_number

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
        from core.utils import generate_unique_number
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

    from core.utils import generate_unique_number

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

            # إنشاء فاتورة إذا تم اختيار ذلك
            if create_invoice:
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

            return redirect('core:sick_leave_detail', sick_leave_id=sick_leave.id)
    else:
        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        form = SickLeaveWithInvoiceForm(initial={'issue_date': datetime.now().date()})

    return render(request, 'core/sick_leaves/create_with_invoice.html', {'form': form})


@login_required
def sick_leave_detail(request, sick_leave_id):
    """تفاصيل إجازة مرضية"""
    sick_leave = get_object_or_404(SickLeave, id=sick_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    related_invoices = LeaveInvoice.objects.filter(
        leave_type='sick_leave',
        leave_id=sick_leave.leave_id
    )

    # حساب إجمالي المبالغ للفواتير المرتبطة
    from django.db.models import Sum
    total_invoices_amount = related_invoices.aggregate(Sum('amount'))['amount__sum'] or 0

    # حساب إجمالي المبالغ المدفوعة
    total_paid_amount = 0
    for invoice in related_invoices:
        total_paid_amount += invoice.get_total_paid()

    # حساب المبلغ المتبقي
    remaining_amount = total_invoices_amount - total_paid_amount

    # الحصول على سعر الإجازة المرضية بناءً على العميل
    client = None
    if sick_leave.patient.employer:
        # البحث عن العميل المرتبط بجهة العمل
        try:
            client = Client.objects.filter(name=sick_leave.patient.employer.name).first()
        except:
            pass
    leave_price = LeavePrice.get_price('sick_leave', sick_leave.duration_days, client)

    context = {
        'sick_leave': sick_leave,
        'related_invoices': related_invoices,
        'total_invoices_amount': total_invoices_amount,
        'total_paid_amount': total_paid_amount,
        'remaining_amount': remaining_amount,
        'leave_price': leave_price
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

    # الحصول على الفواتير المرتبطة بالإجازة
    related_invoices = LeaveInvoice.objects.filter(
        leave_type='sick_leave',
        leave_id=sick_leave.leave_id
    )

    if request.method == 'POST':
        leave_id = sick_leave.leave_id
        patient_name = sick_leave.patient.name
        sick_leave.delete()
        messages.success(request, f'تم حذف الإجازة المرضية رقم {leave_id} للمريض {patient_name} بنجاح')
        return redirect('core:sick_leave_list')

    return render(request, 'core/sick_leaves/delete.html', {
        'sick_leave': sick_leave,
        'related_invoices': related_invoices
    })


@login_required
def sick_leave_search_api(request):
    """واجهة برمجة تطبيقات للبحث عن الإجازات المرضية"""
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse([], safe=False)

    sick_leaves = SickLeave.objects.filter(
        Q(leave_id__icontains=query) |
        Q(patient__name__icontains=query) |
        Q(doctor__name__icontains=query) |
        Q(patient__national_id__icontains=query)
    )[:10]

    results = []
    for sick_leave in sick_leaves:
        results.append({
            'id': sick_leave.id,
            'text': f"{sick_leave.leave_id} - {sick_leave.patient.name}",
            'leave_id': sick_leave.leave_id,
            'patient': sick_leave.patient.name,
            'doctor': sick_leave.doctor.name,
            'start_date': sick_leave.start_date.strftime('%Y-%m-%d'),
            'end_date': sick_leave.end_date.strftime('%Y-%m-%d'),
            'duration_days': sick_leave.duration_days,
            'status': sick_leave.status
        })

    return JsonResponse(results, safe=False)


# وظائف إدارة إجازات المرافقين
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
                        return render(request, 'core/companion_leaves/create.html', {'form': form})

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

            companion_leave = form.save()

            # إنشاء فاتورة إذا تم اختيار ذلك
            if form.cleaned_data.get('create_invoice') and form.cleaned_data.get('client'):
                from datetime import timedelta

                from core.utils import generate_unique_number

                client = form.cleaned_data['client']

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
        # توليد رقم إجازة تلقائي
        from core.utils import generate_unique_number
        leave_id = generate_unique_number('CL', CompanionLeave)

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        import datetime
        today = datetime.date.today()

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        initial_data = {
            'leave_id': leave_id,
            'issue_date': today
        }
        form = CompanionLeaveForm(initial=initial_data)

    return render(request, 'core/companion_leaves/create.html', {'form': form})


@login_required
def companion_leave_create_with_invoice(request):
    """إنشاء إجازة مرافق مع فاتورة في خطوة واحدة"""
    from datetime import datetime, timedelta

    from core.utils import generate_unique_number

    if request.method == 'POST':
        form = CompanionLeaveWithInvoiceForm(request.POST)
        if form.is_valid():
            # استخراج البيانات من النموذج
            patient_national_id = form.cleaned_data['patient_national_id']
            patient_name = form.cleaned_data['patient_name']
            patient_phone = form.cleaned_data['patient_phone']
            companion_national_id = form.cleaned_data['companion_national_id']
            companion_name = form.cleaned_data['companion_name']
            companion_phone = form.cleaned_data['companion_phone']

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
            # إذا كان تاريخ البداية والنهاية في نفس اليوم، فالمدة يوم واحد
            # وإلا، فالمدة هي الفرق بين التاريخين + 1 (لأن اليوم الأخير محسوب)
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

            # إنشاء إجازة المرافق
            leave_id = generate_unique_number('CL', CompanionLeave)
            companion_leave = CompanionLeave.objects.create(
                leave_id=leave_id,
                patient=patient,
                companion=companion,
                doctor=doctor,
                start_date=start_date,
                end_date=end_date,
                duration_days=duration_days,
                issue_date=issue_date
            )

            # إنشاء فاتورة إذا تم اختيار ذلك
            if create_invoice:
                # حساب المبلغ بناءً على نوع الإجازة ومدتها والعميل
                price = LeavePrice.get_price('companion_leave', duration_days, client)

                # إنشاء رقم فاتورة فريد
                invoice_number = generate_unique_number('INV', LeaveInvoice)

                # تعيين تاريخ استحقاق افتراضي (بعد 30 يومًا من تاريخ الإصدار)
                due_date = issue_date + timedelta(days=30)

                # إنشاء الفاتورة
                invoice = LeaveInvoice.objects.create(
                    invoice_number=invoice_number,
                    client=client,
                    leave_type='companion_leave',
                    leave_id=leave_id,
                    amount=price,
                    issue_date=issue_date,
                    due_date=due_date
                )

                messages.success(request, f'تم إنشاء إجازة المرافق رقم {leave_id} والفاتورة رقم {invoice_number} بنجاح')
            else:
                messages.success(request, f'تم إنشاء إجازة المرافق رقم {leave_id} بنجاح')

            return redirect('core:companion_leave_detail', companion_leave_id=companion_leave.id)
    else:
        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        form = CompanionLeaveWithInvoiceForm(initial={'issue_date': datetime.now().date()})

    return render(request, 'core/companion_leaves/create_with_invoice.html', {'form': form})


@login_required
def companion_leave_detail(request, companion_leave_id):
    """تفاصيل إجازة مرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    related_invoices = LeaveInvoice.objects.filter(
        leave_type='companion_leave',
        leave_id=companion_leave.leave_id
    )

    # حساب إجمالي المبالغ للفواتير المرتبطة
    from django.db.models import Sum
    total_invoices_amount = related_invoices.aggregate(Sum('amount'))['amount__sum'] or 0

    # حساب إجمالي المبالغ المدفوعة
    total_paid_amount = 0
    for invoice in related_invoices:
        total_paid_amount += invoice.get_total_paid()

    # حساب المبلغ المتبقي
    remaining_amount = total_invoices_amount - total_paid_amount

    # الحصول على سعر إجازة المرافق بناءً على العميل
    client = None
    if companion_leave.companion.employer:
        # البحث عن العميل المرتبط بجهة العمل
        try:
            client = Client.objects.filter(name=companion_leave.companion.employer.name).first()
        except:
            pass
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
            form.save()
            messages.success(request, f'تم تعديل إجازة المرافق رقم {companion_leave.leave_id} بنجاح')
            return redirect('core:companion_leave_detail', companion_leave_id=companion_leave.id)
    else:
        form = CompanionLeaveForm(instance=companion_leave)

    return render(request, 'core/companion_leaves/edit.html', {'form': form, 'companion_leave': companion_leave})


@login_required
def companion_leave_delete(request, companion_leave_id):
    """حذف إجازة مرافق"""
    companion_leave = get_object_or_404(CompanionLeave, id=companion_leave_id)

    # الحصول على الفواتير المرتبطة بالإجازة
    related_invoices = LeaveInvoice.objects.filter(
        leave_type='companion_leave',
        leave_id=companion_leave.leave_id
    )

    if request.method == 'POST':
        leave_id = companion_leave.leave_id
        patient_name = companion_leave.patient.name
        companion_name = companion_leave.companion.name
        companion_leave.delete()
        messages.success(request, f'تم حذف إجازة المرافق رقم {leave_id} للمريض {patient_name} والمرافق {companion_name} بنجاح')
        return redirect('core:companion_leave_list')

    return render(request, 'core/companion_leaves/delete.html', {
        'companion_leave': companion_leave,
        'related_invoices': related_invoices
    })


@login_required
def companion_leave_search_api(request):
    """واجهة برمجة تطبيقات للبحث عن إجازات المرافقين"""
    query = request.GET.get('q', '')
    if not query:
        return JsonResponse([], safe=False)

    companion_leaves = CompanionLeave.objects.filter(
        Q(leave_id__icontains=query) |
        Q(patient__name__icontains=query) |
        Q(companion__name__icontains=query) |
        Q(doctor__name__icontains=query) |
        Q(patient__national_id__icontains=query) |
        Q(companion__national_id__icontains=query)
    )[:10]

    results = []
    for companion_leave in companion_leaves:
        results.append({
            'id': companion_leave.id,
            'text': f"{companion_leave.leave_id} - {companion_leave.patient.name} - {companion_leave.companion.name}",
            'leave_id': companion_leave.leave_id,
            'patient': companion_leave.patient.name,
            'companion': companion_leave.companion.name,
            'doctor': companion_leave.doctor.name,
            'start_date': companion_leave.start_date.strftime('%Y-%m-%d'),
            'end_date': companion_leave.end_date.strftime('%Y-%m-%d'),
            'duration_days': companion_leave.duration_days,
            'status': companion_leave.status
        })

    return JsonResponse(results, safe=False)


# وظائف إدارة فواتير الإجازات
@login_required
def leave_invoice_list(request):
    """قائمة فواتير الإجازات"""
    # تطبيق الفلاتر مع تحسين الاستعلامات باستخدام select_related
    leave_invoices = LeaveInvoice.objects.select_related('client').all()

    # فلتر رقم الفاتورة
    invoice_number = request.GET.get('invoice_number')
    if invoice_number:
        leave_invoices = leave_invoices.filter(invoice_number__icontains=invoice_number)

    # فلتر العميل
    client = request.GET.get('client')
    if client:
        leave_invoices = leave_invoices.filter(client__name__icontains=client)

    # فلتر نوع الإجازة
    leave_type = request.GET.get('leave_type')
    if leave_type:
        leave_invoices = leave_invoices.filter(leave_type=leave_type)

    # فلتر رقم الإجازة
    leave_id = request.GET.get('leave_id')
    if leave_id:
        leave_invoices = leave_invoices.filter(leave_id__icontains=leave_id)

    # فلتر الحالة
    status = request.GET.get('status')
    if status:
        leave_invoices = leave_invoices.filter(status=status)

    # فلتر تاريخ الإصدار (من)
    issue_date_from = request.GET.get('issue_date_from')
    if issue_date_from:
        leave_invoices = leave_invoices.filter(issue_date__gte=issue_date_from)

    # فلتر تاريخ الإصدار (إلى)
    issue_date_to = request.GET.get('issue_date_to')
    if issue_date_to:
        leave_invoices = leave_invoices.filter(issue_date__lte=issue_date_to)

    # فلتر تاريخ الاستحقاق (من)
    due_date_from = request.GET.get('due_date_from')
    if due_date_from:
        leave_invoices = leave_invoices.filter(due_date__gte=due_date_from)

    # فلتر تاريخ الاستحقاق (إلى)
    due_date_to = request.GET.get('due_date_to')
    if due_date_to:
        leave_invoices = leave_invoices.filter(due_date__lte=due_date_to)

    # فلتر المبلغ (من)
    amount_min = request.GET.get('amount_min')
    if amount_min:
        leave_invoices = leave_invoices.filter(amount__gte=amount_min)

    # فلتر المبلغ (إلى)
    amount_max = request.GET.get('amount_max')
    if amount_max:
        leave_invoices = leave_invoices.filter(amount__lte=amount_max)

    # الترتيب
    sort_by = request.GET.get('sort', '-created_at')
    if sort_by not in ['invoice_number', '-invoice_number', 'client__name', '-client__name',
                      'leave_type', '-leave_type', 'leave_id', '-leave_id', 'amount', '-amount',
                      'status', '-status', 'issue_date', '-issue_date', 'due_date', '-due_date',
                      'created_at', '-created_at']:
        sort_by = '-created_at'

    leave_invoices = leave_invoices.order_by(sort_by)

    # الترقيم الصفحي
    paginator = Paginator(leave_invoices, 10)  # 10 فواتير في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # استيراد Sum قبل استخدامه
    from django.db.models import Sum

    # إحصائيات سريعة
    total_invoices = leave_invoices.count()
    total_amount = leave_invoices.aggregate(Sum('amount'))['amount__sum'] or 0

    # الحصول على إجمالي المدفوعات لكل فاتورة
    payment_details = PaymentDetail.objects.filter(invoice__in=leave_invoices).values('invoice').annotate(
        total_paid=Sum('amount')
    )

    # إنشاء قاموس للمدفوعات
    payments_dict = {item['invoice']: item['total_paid'] for item in payment_details}

    # حساب إجمالي المدفوعات
    total_paid = sum(payments_dict.values()) if payments_dict else 0

    # حساب المبلغ المتبقي
    total_remaining = total_amount - total_paid

    context = {
        'leave_invoices': page_obj,
        'invoice_number': invoice_number,
        'client': client,
        'leave_type': leave_type,
        'leave_id': leave_id,
        'status': status,
        'issue_date_from': issue_date_from,
        'issue_date_to': issue_date_to,
        'due_date_from': due_date_from,
        'due_date_to': due_date_to,
        'amount_min': amount_min,
        'amount_max': amount_max,
        'sort': sort_by,
        'total_invoices': total_invoices,
        'total_amount': total_amount,
        'total_paid': total_paid,
        'total_remaining': total_remaining
    }

    return render(request, 'core/leave_invoices/list.html', context)


@login_required
def leave_invoice_create(request):
    """إنشاء فاتورة إجازة جديدة"""
    if request.method == 'POST':
        form = LeaveInvoiceForm(request.POST)
        if form.is_valid():
            invoice = form.save()

            # تحديث حالة الفاتورة بناءً على المدفوعات
            invoice.update_status()
            invoice.save()

            messages.success(request, f'تم إنشاء الفاتورة رقم {invoice.invoice_number} بنجاح للعميل {invoice.client.name} بمبلغ {invoice.amount} ريال')
            return redirect('core:leave_invoice_detail', leave_invoice_id=invoice.id)
    else:
        # توليد رقم فاتورة تلقائي
        from core.utils import generate_unique_number
        invoice_number = generate_unique_number('INV', LeaveInvoice)

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        import datetime
        today = datetime.date.today()

        # تعيين تاريخ اليوم كتاريخ افتراضي للإصدار
        initial_data = {
            'invoice_number': invoice_number,
            'issue_date': today,
            'due_date': today + datetime.timedelta(days=30)  # تاريخ الاستحقاق بعد 30 يومًا
        }

        # تعبئة البيانات من معلمات URL إذا كانت موجودة
        leave_type = request.GET.get('leave_type')
        leave_id = request.GET.get('leave_id')

        if leave_type and leave_id:
            initial_data['leave_type'] = leave_type
            initial_data['leave_id'] = leave_id

            # البحث عن الإجازة وتعبئة بيانات العميل والمبلغ
            if leave_type == 'sick_leave':
                try:
                    sick_leave = SickLeave.objects.get(leave_id=leave_id)
                    if sick_leave.patient.employer:
                        initial_data['client'] = sick_leave.patient.employer.id

                    # تعيين المبلغ بناءً على سعر الإجازة والعميل
                    client = None
                    if sick_leave.patient.employer:
                        # البحث عن العميل المرتبط بجهة العمل
                        try:
                            client = Client.objects.filter(name=sick_leave.patient.employer.name).first()
                        except:
                            pass
                    leave_price = LeavePrice.get_price('sick_leave', sick_leave.duration_days, client)
                    initial_data['amount'] = leave_price
                except SickLeave.DoesNotExist:
                    pass
            elif leave_type == 'companion_leave':
                try:
                    companion_leave = CompanionLeave.objects.get(leave_id=leave_id)
                    if companion_leave.companion.employer:
                        initial_data['client'] = companion_leave.companion.employer.id

                    # تعيين المبلغ بناءً على سعر الإجازة والعميل
                    client = None
                    if companion_leave.companion.employer:
                        # البحث عن العميل المرتبط بجهة العمل
                        try:
                            client = Client.objects.filter(name=companion_leave.companion.employer.name).first()
                        except:
                            pass
                    leave_price = LeavePrice.get_price('companion_leave', companion_leave.duration_days, client)
                    initial_data['amount'] = leave_price
                except CompanionLeave.DoesNotExist:
                    pass

        form = LeaveInvoiceForm(initial=initial_data)

    return render(request, 'core/leave_invoices/create.html', {'form': form})


@login_required
def leave_invoice_detail(request, leave_invoice_id):
    """تفاصيل فاتورة إجازة"""
    leave_invoice = get_object_or_404(LeaveInvoice, id=leave_invoice_id)

    # الحصول على تفاصيل المدفوعات المرتبطة بالفاتورة
    payment_details = PaymentDetail.objects.filter(invoice=leave_invoice).select_related('payment')

    # حساب إجمالي المدفوعات
    total_paid = leave_invoice.get_total_paid()

    # حساب المبلغ المتبقي
    remaining_amount = leave_invoice.get_remaining()

    # الحصول على معلومات الإجازة المرتبطة
    leave_info = None
    if leave_invoice.leave_type == 'sick_leave':
        try:
            leave_info = SickLeave.objects.get(leave_id=leave_invoice.leave_id)
        except SickLeave.DoesNotExist:
            pass
    elif leave_invoice.leave_type == 'companion_leave':
        try:
            leave_info = CompanionLeave.objects.get(leave_id=leave_invoice.leave_id)
        except CompanionLeave.DoesNotExist:
            pass

    # تحديث حالة الفاتورة
    current_status = leave_invoice.status
    updated_status = leave_invoice.update_status()

    # حفظ الفاتورة إذا تغيرت الحالة
    if current_status != updated_status:
        leave_invoice.status = updated_status
        leave_invoice.save()

    context = {
        'leave_invoice': leave_invoice,
        'payment_details': payment_details,
        'total_paid': total_paid,
        'remaining_amount': remaining_amount,
        'leave_info': leave_info
    }

    return render(request, 'core/leave_invoices/detail.html', context)


@login_required
def leave_invoice_edit(request, leave_invoice_id):
    """تعديل فاتورة إجازة"""
    leave_invoice = get_object_or_404(LeaveInvoice, id=leave_invoice_id)

    # الحصول على قيم قبل التعديل للمقارنة
    old_amount = leave_invoice.amount
    old_client_name = leave_invoice.client.name

    if request.method == 'POST':
        form = LeaveInvoiceForm(request.POST, instance=leave_invoice)
        if form.is_valid():
            invoice = form.save(commit=False)

            # تحديث حالة الفاتورة بناءً على المدفوعات
            invoice.update_status()
            invoice.save()

            # إعداد رسالة النجاح مع تفاصيل التغييرات
            success_message = f'تم تعديل الفاتورة رقم {invoice.invoice_number} بنجاح'

            # إضافة تفاصيل التغييرات إذا تغيرت
            changes = []
            if old_amount != invoice.amount:
                changes.append(f'تغيير المبلغ من {old_amount} إلى {invoice.amount} ريال')

            if old_client_name != invoice.client.name:
                changes.append(f'تغيير العميل من {old_client_name} إلى {invoice.client.name}')

            if changes:
                success_message += f' ({", ".join(changes)})'

            messages.success(request, success_message)
            return redirect('core:leave_invoice_detail', leave_invoice_id=invoice.id)
    else:
        form = LeaveInvoiceForm(instance=leave_invoice)

    # الحصول على معلومات الإجازة المرتبطة
    leave_info = None
    if leave_invoice.leave_type == 'sick_leave':
        try:
            leave_info = SickLeave.objects.get(leave_id=leave_invoice.leave_id)
        except SickLeave.DoesNotExist:
            pass
    elif leave_invoice.leave_type == 'companion_leave':
        try:
            leave_info = CompanionLeave.objects.get(leave_id=leave_invoice.leave_id)
        except CompanionLeave.DoesNotExist:
            pass

    return render(request, 'core/leave_invoices/edit.html', {
        'form': form,
        'leave_invoice': leave_invoice,
        'leave_info': leave_info
    })


@login_required
def leave_invoice_delete(request, leave_invoice_id):
    """حذف فاتورة إجازة"""
    leave_invoice = get_object_or_404(LeaveInvoice, id=leave_invoice_id)

    # الحصول على تفاصيل المدفوعات المرتبطة بالفاتورة
    payment_details = PaymentDetail.objects.filter(invoice=leave_invoice).select_related('payment')

    if request.method == 'POST':
        # حفظ معلومات الفاتورة قبل الحذف
        invoice_number = leave_invoice.invoice_number
        client_name = leave_invoice.client.name
        leave_type_display = 'إجازة مرضية' if leave_invoice.leave_type == 'sick_leave' else 'إجازة مرافق'
        leave_id = leave_invoice.leave_id
        amount = leave_invoice.amount

        # حذف تفاصيل المدفوعات المرتبطة بالفاتورة أولاً
        payment_details_count = payment_details.count()
        payment_details.delete()

        # ثم حذف الفاتورة
        leave_invoice.delete()

        # إعداد رسالة النجاح مع تفاصيل الفاتورة المحذوفة
        success_message = f'تم حذف الفاتورة رقم {invoice_number} للعميل {client_name} ({leave_type_display} رقم {leave_id}) بمبلغ {amount} ريال بنجاح'

        if payment_details_count > 0:
            success_message += f' مع {payment_details_count} دفعة مرتبطة'

        messages.success(request, success_message)
        return redirect('core:leave_invoice_list')

    return render(request, 'core/leave_invoices/delete.html', {
        'leave_invoice': leave_invoice,
        'payment_details': payment_details
    })


# وظائف إدارة المدفوعات
@login_required
def payment_list(request):
    """قائمة المدفوعات"""
    # تطبيق الفلاتر مع تحسين الاستعلامات باستخدام select_related
    payments = Payment.objects.select_related('client').all()

    # فلتر رقم الدفعة
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

    # فلتر رقم المرجع
    reference_number = request.GET.get('reference_number')
    if reference_number:
        payments = payments.filter(reference_number__icontains=reference_number)

    # فلتر تاريخ الدفع (من)
    payment_date_from = request.GET.get('payment_date_from')
    if payment_date_from:
        payments = payments.filter(payment_date__gte=payment_date_from)

    # فلتر تاريخ الدفع (إلى)
    payment_date_to = request.GET.get('payment_date_to')
    if payment_date_to:
        payments = payments.filter(payment_date__lte=payment_date_to)

    # فلتر المبلغ (من)
    amount_min = request.GET.get('amount_min')
    if amount_min:
        payments = payments.filter(amount__gte=amount_min)

    # فلتر المبلغ (إلى)
    amount_max = request.GET.get('amount_max')
    if amount_max:
        payments = payments.filter(amount__lte=amount_max)

    # الترتيب
    sort_by = request.GET.get('sort', '-payment_date')
    if sort_by not in ['payment_number', '-payment_number', 'client__name', '-client__name',
                      'amount', '-amount', 'payment_method', '-payment_method',
                      'payment_date', '-payment_date', 'reference_number', '-reference_number',
                      'created_at', '-created_at']:
        sort_by = '-payment_date'

    payments = payments.order_by(sort_by)

    # الترقيم الصفحي
    paginator = Paginator(payments, 10)  # 10 دفعات في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # إحصائيات سريعة
    total_payments = payments.count()
    total_amount = payments.aggregate(Sum('amount'))['amount__sum'] or 0

    # إحصائيات حسب طريقة الدفع
    payment_methods_stats = payments.values('payment_method').annotate(
        count=Count('id'),
        total=Sum('amount')
    ).order_by('payment_method')

    # إحصائيات حسب الشهر (آخر 6 أشهر)
    import datetime

    from django.db.models.functions import TruncMonth

    # الحصول على تاريخ قبل 6 أشهر
    six_months_ago = timezone.now().date() - datetime.timedelta(days=180)

    monthly_stats = payments.filter(payment_date__gte=six_months_ago).annotate(
        month=TruncMonth('payment_date')
    ).values('month').annotate(
        count=Count('id'),
        total=Sum('amount')
    ).order_by('month')

    context = {
        'payments': page_obj,
        'payment_number': payment_number,
        'client': client,
        'payment_method': payment_method,
        'reference_number': reference_number,
        'payment_date_from': payment_date_from,
        'payment_date_to': payment_date_to,
        'amount_min': amount_min,
        'amount_max': amount_max,
        'sort': sort_by,
        'total_payments': total_payments,
        'total_amount': total_amount,
        'payment_methods_stats': payment_methods_stats,
        'monthly_stats': monthly_stats
    }

    return render(request, 'core/payments/list.html', context)


@login_required
def payment_create(request):
    """إنشاء دفعة جديدة"""
    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            payment = form.save()

            # معالجة تفاصيل الدفعة
            invoice_count = 0
            total_amount = 0

            # الحصول على عدد الفواتير من النموذج
            for key in request.POST:
                if key.startswith('invoice-') and not key.startswith('invoice-amount-'):
                    invoice_id = request.POST.get(key)
                    amount_key = key.replace('invoice-', 'amount-')
                    amount = request.POST.get(amount_key)

                    if invoice_id and amount and float(amount) > 0:
                        invoice = get_object_or_404(LeaveInvoice, id=invoice_id)

                        # إنشاء تفاصيل الدفعة
                        PaymentDetail.objects.create(
                            payment=payment,
                            invoice=invoice,
                            amount=amount
                        )

                        # تحديث حالة الفاتورة
                        invoice.update_status()
                        invoice.save()

                        invoice_count += 1
                        total_amount += float(amount)

            messages.success(request, f'تم إنشاء الدفعة رقم {payment.payment_number} بنجاح لعدد {invoice_count} فاتورة بإجمالي {total_amount} ريال للعميل {payment.client.name}')
            return redirect('core:payment_detail', payment_id=payment.id)
    else:
        # توليد رقم دفعة تلقائي
        from core.utils import generate_unique_number
        payment_number = generate_unique_number('PAY', Payment)

        # تعيين تاريخ اليوم كتاريخ افتراضي للدفع
        import datetime
        today = datetime.date.today()

        # تعيين تاريخ اليوم كتاريخ افتراضي للدفع
        initial_data = {
            'payment_number': payment_number,
            'payment_date': today
        }

        # تعبئة البيانات من معلمات URL إذا كانت موجودة
        invoice_id = request.GET.get('invoice_id')

        if invoice_id:
            try:
                invoice = LeaveInvoice.objects.get(id=invoice_id)
                initial_data['client'] = invoice.client.id
                initial_data['amount'] = invoice.get_remaining()

                # الحصول على الفواتير غير المدفوعة للعميل
                unpaid_invoices = LeaveInvoice.objects.filter(
                    client=invoice.client,
                    status__in=['unpaid', 'partially_paid']
                ).exclude(id=invoice.id)

            except LeaveInvoice.DoesNotExist:
                pass

        form = PaymentForm(initial=initial_data)

        # الحصول على الفواتير غير المدفوعة للعرض في الصفحة
        client_id = request.GET.get('client_id')
        unpaid_invoices = []

        if client_id:
            try:
                client = Client.objects.get(id=client_id)
                unpaid_invoices = LeaveInvoice.objects.filter(
                    client=client,
                    status__in=['unpaid', 'partially_paid']
                )

                if not 'client' in initial_data:
                    initial_data['client'] = client.id
                    form = PaymentForm(initial=initial_data)

            except Client.DoesNotExist:
                pass

    return render(request, 'core/payments/create.html', {
        'form': form,
        'unpaid_invoices': unpaid_invoices if 'unpaid_invoices' in locals() else []
    })


@login_required
def payment_detail(request, payment_id):
    """تفاصيل دفعة"""
    payment = get_object_or_404(Payment, id=payment_id)

    # الحصول على تفاصيل الدفعة
    payment_details = PaymentDetail.objects.filter(payment=payment).select_related('invoice')

    # حساب إجمالي المبلغ المدفوع
    total_paid = payment_details.aggregate(Sum('amount'))['amount__sum'] or 0

    # حساب المبلغ المتبقي
    remaining_amount = payment.amount - total_paid

    # الحصول على معلومات العميل
    client_info = payment.client

    # الحصول على الفواتير المرتبطة بالدفعة
    invoices = [detail.invoice for detail in payment_details]

    # الحصول على المدفوعات الأخرى للعميل
    other_payments = Payment.objects.filter(client=payment.client).exclude(id=payment.id).order_by('-payment_date')[:5]

    # الحصول على الفواتير غير المدفوعة للعميل
    unpaid_invoices = LeaveInvoice.objects.filter(
        client=payment.client,
        status__in=['unpaid', 'partially_paid']
    ).exclude(id__in=[invoice.id for invoice in invoices])

    context = {
        'payment': payment,
        'payment_details': payment_details,
        'total_paid': total_paid,
        'remaining_amount': remaining_amount,
        'client_info': client_info,
        'other_payments': other_payments,
        'unpaid_invoices': unpaid_invoices
    }

    return render(request, 'core/payments/detail.html', context)


@login_required
def payment_edit(request, payment_id):
    """تعديل دفعة"""
    payment = get_object_or_404(Payment, id=payment_id)
    payment_details = PaymentDetail.objects.filter(payment=payment).select_related('invoice')

    if request.method == 'POST':
        form = PaymentForm(request.POST, instance=payment)
        if form.is_valid():
            payment = form.save()

            # معالجة تفاصيل الدفعة
            # أولاً: إعادة حالة الفواتير المرتبطة بالدفعة إلى حالتها الأصلية
            for detail in payment_details:
                invoice = detail.invoice
                # حذف تفاصيل الدفعة الحالية من حساب المدفوعات
                invoice_total_paid = PaymentDetail.objects.filter(invoice=invoice).exclude(payment=payment).aggregate(Sum('amount'))['amount__sum'] or 0

                if invoice_total_paid >= invoice.amount:
                    invoice.status = 'paid'
                elif invoice_total_paid > 0:
                    invoice.status = 'partially_paid'
                else:
                    invoice.status = 'unpaid'

                invoice.save()

            # حذف تفاصيل الدفعة الحالية
            payment_details.delete()

            # إضافة تفاصيل الدفعة الجديدة
            invoice_count = 0
            total_amount = 0

            for key in request.POST:
                if key.startswith('invoice-') and not key.startswith('invoice-amount-'):
                    invoice_id = request.POST.get(key)
                    amount_key = key.replace('invoice-', 'amount-')
                    amount = request.POST.get(amount_key)

                    if invoice_id and amount and float(amount) > 0:
                        invoice = get_object_or_404(LeaveInvoice, id=invoice_id)

                        # إنشاء تفاصيل الدفعة
                        PaymentDetail.objects.create(
                            payment=payment,
                            invoice=invoice,
                            amount=amount
                        )

                        # تحديث حالة الفاتورة
                        invoice.update_status()
                        invoice.save()

                        invoice_count += 1
                        total_amount += float(amount)

            messages.success(request, f'تم تعديل الدفعة رقم {payment.payment_number} بنجاح لعدد {invoice_count} فاتورة بإجمالي {total_amount} ريال')
            return redirect('core:payment_detail', payment_id=payment.id)
    else:
        form = PaymentForm(instance=payment)

    return render(request, 'core/payments/edit.html', {
        'form': form,
        'payment': payment,
        'payment_details': payment_details
    })


@login_required
def payment_delete(request, payment_id):
    """حذف دفعة"""
    payment = get_object_or_404(Payment, id=payment_id)
    payment_details = PaymentDetail.objects.filter(payment=payment).select_related('invoice')

    if request.method == 'POST':
        # حفظ معلومات الدفعة قبل الحذف
        payment_number = payment.payment_number
        client_name = payment.client.name
        payment_method_display = {
            'cash': 'نقدًا',
            'bank_transfer': 'تحويل بنكي',
            'check': 'شيك',
            'credit_card': 'بطاقة ائتمان'
        }.get(payment.payment_method, payment.payment_method)
        amount = payment.amount
        payment_date = payment.payment_date

        # حفظ عدد الفواتير المرتبطة
        invoice_count = payment_details.count()

        # إعادة حالة الفواتير المرتبطة بالدفعة إلى حالتها الأصلية
        affected_invoices = []
        for detail in payment_details:
            invoice = detail.invoice
            old_status = invoice.status

            # تحديث حالة الفاتورة بعد حذف الدفعة
            # حذف تفاصيل الدفعة الحالية من حساب المدفوعات
            invoice_total_paid = PaymentDetail.objects.filter(invoice=invoice).exclude(payment=payment).aggregate(Sum('amount'))['amount__sum'] or 0

            # تحديث المبلغ المدفوع في الفاتورة
            if invoice_total_paid >= invoice.amount:
                new_status = 'paid'
            elif invoice_total_paid > 0:
                new_status = 'partially_paid'
            else:
                new_status = 'unpaid'

            if old_status != new_status:
                invoice.status = new_status
                invoice.save()
                affected_invoices.append(invoice.invoice_number)

        # حذف الدفعة (سيتم حذف تفاصيل الدفعة تلقائيًا بسبب علاقة CASCADE)
        payment.delete()

        # إعداد رسالة النجاح مع تفاصيل الدفعة المحذوفة
        success_message = f'تم حذف الدفعة رقم {payment_number} للعميل {client_name} بمبلغ {amount} ريال ({payment_method_display}) بتاريخ {payment_date} بنجاح'

        if invoice_count > 0:
            success_message += f' مع {invoice_count} فاتورة مرتبطة'

        if affected_invoices:
            success_message += f'. تم تحديث حالة الفواتير التالية: {", ".join(affected_invoices)}'

        messages.success(request, success_message)
        return redirect('core:payment_list')

    return render(request, 'core/payments/delete.html', {
        'payment': payment,
        'payment_details': payment_details
    })


# وظائف API
@login_required
def api_client_unpaid_invoices(request, client_id):
    """API لتحميل الفواتير غير المدفوعة للعميل"""
    try:
        client = Client.objects.get(id=client_id)
        unpaid_invoices = LeaveInvoice.objects.filter(
            client=client,
            status__in=['unpaid', 'partially_paid']
        ).order_by('-issue_date')

        invoices_data = []
        for invoice in unpaid_invoices:
            # التعامل مع تاريخ الاستحقاق الذي قد يكون فارغًا
            due_date_str = ''
            if invoice.due_date:
                due_date_str = invoice.due_date.strftime('%Y-%m-%d')

            invoices_data.append({
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'amount': float(invoice.amount),
                'remaining': float(invoice.get_remaining()),
                'issue_date': invoice.issue_date.strftime('%Y-%m-%d'),
                'due_date': due_date_str,
                'status': invoice.status,
                'leave_type': invoice.leave_type,
                'leave_id': invoice.leave_id
            })

        return JsonResponse(invoices_data, safe=False)
    except Client.DoesNotExist:
        return JsonResponse({'error': 'العميل غير موجود'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# وظائف التقارير
@login_required
def report_index(request):
    """صفحة التقارير الرئيسية"""
    return render(request, 'core/reports/index.html')


@login_required
def report_sick_leaves(request):
    """تقرير الإجازات المرضية"""
    # تصفية البيانات حسب المعايير
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    status = request.GET.get('status')

    sick_leaves = SickLeave.objects.all().order_by('-start_date')

    if start_date:
        sick_leaves = sick_leaves.filter(start_date__gte=start_date)

    if end_date:
        sick_leaves = sick_leaves.filter(end_date__lte=end_date)

    if status:
        sick_leaves = sick_leaves.filter(status=status)

    # إحصائيات
    total_count = sick_leaves.count()
    total_days = sick_leaves.aggregate(Sum('duration_days'))['duration_days__sum'] or 0
    avg_days = total_days / total_count if total_count > 0 else 0

    # توزيع الإجازات حسب الحالة
    status_counts = {
        'active': sick_leaves.filter(status='active').count(),
        'cancelled': sick_leaves.filter(status='cancelled').count(),
        'expired': sick_leaves.filter(status='expired').count()
    }

    # توزيع الإجازات حسب المدة
    duration_counts = {
        'short': sick_leaves.filter(duration_days__lte=3).count(),
        'medium': sick_leaves.filter(duration_days__gt=3, duration_days__lte=7).count(),
        'long': sick_leaves.filter(duration_days__gt=7, duration_days__lte=14).count(),
        'very_long': sick_leaves.filter(duration_days__gt=14, duration_days__lte=30).count(),
        'extended': sick_leaves.filter(duration_days__gt=30).count()
    }

    context = {
        'sick_leaves': sick_leaves,
        'total_count': total_count,
        'total_days': total_days,
        'avg_days': avg_days,
        'start_date': start_date,
        'end_date': end_date,
        'status': status,
        'status_counts': status_counts,
        'duration_counts': duration_counts
    }

    return render(request, 'core/reports/sick_leaves.html', context)


@login_required
def report_companion_leaves(request):
    """تقرير إجازات المرافقين"""
    # تصفية البيانات حسب المعايير
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    status = request.GET.get('status')

    companion_leaves = CompanionLeave.objects.all().order_by('-start_date')

    if start_date:
        companion_leaves = companion_leaves.filter(start_date__gte=start_date)

    if end_date:
        companion_leaves = companion_leaves.filter(end_date__lte=end_date)

    if status:
        companion_leaves = companion_leaves.filter(status=status)

    # إحصائيات
    total_count = companion_leaves.count()
    total_days = companion_leaves.aggregate(Sum('duration_days'))['duration_days__sum'] or 0
    avg_days = total_days / total_count if total_count > 0 else 0

    # توزيع الإجازات حسب الحالة
    status_counts = {
        'active': companion_leaves.filter(status='active').count(),
        'cancelled': companion_leaves.filter(status='cancelled').count(),
        'expired': companion_leaves.filter(status='expired').count()
    }

    # توزيع الإجازات حسب المدة
    duration_counts = {
        'short': companion_leaves.filter(duration_days__lte=3).count(),
        'medium': companion_leaves.filter(duration_days__gt=3, duration_days__lte=7).count(),
        'long': companion_leaves.filter(duration_days__gt=7, duration_days__lte=14).count(),
        'very_long': companion_leaves.filter(duration_days__gt=14, duration_days__lte=30).count(),
        'extended': companion_leaves.filter(duration_days__gt=30).count()
    }

    context = {
        'companion_leaves': companion_leaves,
        'total_count': total_count,
        'total_days': total_days,
        'avg_days': avg_days,
        'start_date': start_date,
        'end_date': end_date,
        'status': status,
        'status_counts': status_counts,
        'duration_counts': duration_counts
    }

    return render(request, 'core/reports/companion_leaves.html', context)


@login_required
def report_invoices(request):
    """تقرير الفواتير"""
    # تصفية البيانات حسب المعايير
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    status = request.GET.get('status')
    leave_type = request.GET.get('leave_type')
    client_id = request.GET.get('client_id')

    invoices = LeaveInvoice.objects.all().order_by('-issue_date')

    if start_date:
        invoices = invoices.filter(issue_date__gte=start_date)

    if end_date:
        invoices = invoices.filter(issue_date__lte=end_date)

    if status:
        invoices = invoices.filter(status=status)

    if leave_type:
        invoices = invoices.filter(leave_type=leave_type)

    if client_id:
        invoices = invoices.filter(client_id=client_id)

    # إحصائيات
    total_count = invoices.count()
    total_amount = invoices.aggregate(Sum('amount'))['amount__sum'] or 0

    # حساب المبالغ المدفوعة والمتبقية
    total_paid = 0
    total_remaining = 0

    # استخدام قائمة مؤقتة لتجنب تكرار الاستعلامات
    invoice_list = list(invoices)
    for invoice in invoice_list:
        total_paid += invoice.get_total_paid()
        total_remaining += invoice.get_remaining()

    # توزيع الفواتير حسب الحالة
    status_counts = {
        'unpaid': invoices.filter(status='unpaid').count(),
        'partially_paid': invoices.filter(status='partially_paid').count(),
        'paid': invoices.filter(status='paid').count(),
        'cancelled': invoices.filter(status='cancelled').count()
    }

    # توزيع الفواتير حسب نوع الإجازة
    leave_type_counts = {
        'sick_leave': invoices.filter(leave_type='sick_leave').count(),
        'companion_leave': invoices.filter(leave_type='companion_leave').count()
    }

    # توزيع الفواتير حسب العملاء (أعلى 5 عملاء)
    # استخدام values و annotate لتحسين الأداء
    client_invoice_counts = invoices.values('client__name').annotate(
        count=Count('id')
    ).order_by('-count')[:5]

    client_counts = {}
    for item in client_invoice_counts:
        client_counts[item['client__name']] = item['count']

    context = {
        'invoices': invoices,
        'total_count': total_count,
        'total_amount': total_amount,
        'total_paid': total_paid,
        'total_remaining': total_remaining,
        'start_date': start_date,
        'end_date': end_date,
        'status': status,
        'leave_type': leave_type,
        'client_id': client_id,
        'status_counts': status_counts,
        'leave_type_counts': leave_type_counts,
        'client_counts': client_counts,
        'clients': Client.objects.all()
    }

    return render(request, 'core/reports/invoices.html', context)


@login_required
def report_payments(request):
    """تقرير المدفوعات"""
    # تصفية البيانات حسب المعايير
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    payment_method = request.GET.get('payment_method')
    client_id = request.GET.get('client_id')

    payments = Payment.objects.all().order_by('-payment_date')

    if start_date:
        payments = payments.filter(payment_date__gte=start_date)

    if end_date:
        payments = payments.filter(payment_date__lte=end_date)

    if payment_method:
        payments = payments.filter(payment_method=payment_method)

    if client_id:
        payments = payments.filter(client_id=client_id)

    # إحصائيات
    total_count = payments.count()
    total_amount = payments.aggregate(Sum('amount'))['amount__sum'] or 0

    # توزيع المدفوعات حسب طريقة الدفع
    payment_method_counts = {
        'cash': payments.filter(payment_method='cash').count(),
        'bank_transfer': payments.filter(payment_method='bank_transfer').count(),
        'check': payments.filter(payment_method='check').count(),
        'credit_card': payments.filter(payment_method='credit_card').count()
    }

    payment_method_amounts = {
        'cash': payments.filter(payment_method='cash').aggregate(Sum('amount'))['amount__sum'] or 0,
        'bank_transfer': payments.filter(payment_method='bank_transfer').aggregate(Sum('amount'))['amount__sum'] or 0,
        'check': payments.filter(payment_method='check').aggregate(Sum('amount'))['amount__sum'] or 0,
        'credit_card': payments.filter(payment_method='credit_card').aggregate(Sum('amount'))['amount__sum'] or 0
    }

    # توزيع المدفوعات حسب الشهر (للسنة الحالية)
    current_year = timezone.now().year
    monthly_payments = {}

    for month in range(1, 13):
        month_payments = payments.filter(
            payment_date__year=current_year,
            payment_date__month=month
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        monthly_payments[month] = month_payments

    # توزيع المدفوعات حسب العملاء (أعلى 5 عملاء)
    # استخدام values و annotate لتحسين الأداء
    client_payment_counts = payments.values('client__name').annotate(
        count=Count('id')
    ).order_by('-count')[:5]

    client_counts = {}
    for item in client_payment_counts:
        client_counts[item['client__name']] = item['count']

    context = {
        'payments': payments,
        'total_count': total_count,
        'total_amount': total_amount,
        'start_date': start_date,
        'end_date': end_date,
        'payment_method': payment_method,
        'client_id': client_id,
        'payment_method_counts': payment_method_counts,
        'payment_method_amounts': payment_method_amounts,
        'monthly_payments': monthly_payments,
        'client_counts': client_counts,
        'clients': Client.objects.all(),
        'current_year': current_year
    }

    return render(request, 'core/reports/payments.html', context)


@login_required
def report_clients(request):
    """تقرير العملاء"""
    # تصفية البيانات حسب المعايير
    search_query = request.GET.get('search')
    balance_filter = request.GET.get('balance_filter')

    clients = Client.objects.all().order_by('name')

    if search_query:
        clients = clients.filter(
            Q(name__icontains=search_query) |
            Q(phone__icontains=search_query) |
            Q(email__icontains=search_query)
        )

    # حساب إجمالي الفواتير والمدفوعات لكل عميل
    client_data = []

    # استخدام قائمة مؤقتة لتجنب تكرار الاستعلامات
    client_list = list(clients.prefetch_related('leave_invoices', 'payments'))

    for client in client_list:
        # حساب إجمالي الفواتير والمدفوعات
        total_invoices = client.leave_invoices.aggregate(Sum('amount'))['amount__sum'] or 0
        total_payments = client.payments.aggregate(Sum('amount'))['amount__sum'] or 0
        balance = total_invoices - total_payments

        # تصفية حسب الرصيد
        if balance_filter == 'positive' and balance <= 0:
            continue
        elif balance_filter == 'negative' and balance >= 0:
            continue
        elif balance_filter == 'zero' and balance != 0:
            continue

        # عدد الفواتير والمدفوعات
        invoices_count = client.leave_invoices.count()
        payments_count = client.payments.count()

        # حالة الفواتير (استخدام استعلام واحد مع annotate)
        invoice_statuses = client.leave_invoices.values('status').annotate(count=Count('id'))

        # تهيئة العدادات
        unpaid_invoices = 0
        partially_paid_invoices = 0
        paid_invoices = 0

        # تعبئة العدادات من نتائج الاستعلام
        for status_data in invoice_statuses:
            if status_data['status'] == 'unpaid':
                unpaid_invoices = status_data['count']
            elif status_data['status'] == 'partially_paid':
                partially_paid_invoices = status_data['count']
            elif status_data['status'] == 'paid':
                paid_invoices = status_data['count']

        client_data.append({
            'client': client,
            'total_invoices': total_invoices,
            'total_payments': total_payments,
            'balance': balance,
            'invoices_count': invoices_count,
            'payments_count': payments_count,
            'unpaid_invoices': unpaid_invoices,
            'partially_paid_invoices': partially_paid_invoices,
            'paid_invoices': paid_invoices
        })

    # ترتيب البيانات حسب الرصيد (من الأعلى إلى الأقل)
    client_data.sort(key=lambda x: x['balance'], reverse=True)

    # إحصائيات
    total_clients = len(client_data)
    total_invoices = sum(data['total_invoices'] for data in client_data)
    total_payments = sum(data['total_payments'] for data in client_data)
    total_balance = total_invoices - total_payments

    # العملاء ذوو الرصيد الأعلى (أعلى 5 عملاء)
    top_balance_clients = sorted(client_data, key=lambda x: x['balance'], reverse=True)[:5]

    # العملاء الأكثر نشاطًا (أعلى 5 عملاء من حيث عدد الفواتير)
    top_active_clients = sorted(client_data, key=lambda x: x['invoices_count'], reverse=True)[:5]

    context = {
        'client_data': client_data,
        'total_clients': total_clients,
        'total_invoices': total_invoices,
        'total_payments': total_payments,
        'total_balance': total_balance,
        'search_query': search_query,
        'balance_filter': balance_filter,
        'top_balance_clients': top_balance_clients,
        'top_active_clients': top_active_clients
    }

    return render(request, 'core/reports/clients.html', context)


# وظائف AJAX
@login_required
@require_POST
def patient_create_ajax(request):
    """إنشاء مريض جديد عبر AJAX"""
    form = PatientForm(request.POST)
    if form.is_valid():
        patient = form.save()
        return JsonResponse({
            'success': True,
            'patient': {
                'id': patient.id,
                'name': patient.name,
                'national_id': patient.national_id
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'errors': form.errors
        })

@login_required
@require_POST
def doctor_create_ajax(request):
    """إنشاء طبيب جديد عبر AJAX"""
    form = DoctorForm(request.POST)
    if form.is_valid():
        doctor = form.save()
        return JsonResponse({
            'success': True,
            'doctor': {
                'id': doctor.id,
                'name': doctor.name,
                'national_id': doctor.national_id if doctor.national_id else ''
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'errors': form.errors
        })

# تم نقل وظيفة hospital_create_ajax إلى ملف hospital_ajax_views.py

@login_required
@require_POST
def client_create_ajax(request):
    """إنشاء عميل جديد عبر AJAX"""
    form = ClientForm(request.POST)
    if form.is_valid():
        client = form.save()
        return JsonResponse({
            'success': True,
            'client': {
                'id': client.id,
                'name': client.name,
                'phone': client.phone
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'errors': form.errors
        })
import random
from datetime import datetime, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.models import (
    User, Hospital, Employer, Doctor, Patient, Client, LeavePrice,
    SickLeave, CompanionLeave, LeaveInvoice, Payment, PaymentDetail
)
from core.utils import generate_unique_number


class Command(BaseCommand):
    help = 'تعبئة البيانات التجريبية للمشروع'

    def add_arguments(self, parser):
        parser.add_argument(
            '--patients',
            type=int,
            default=20,
            help='عدد المرضى التجريبيين'
        )
        parser.add_argument(
            '--sick-leaves',
            type=int,
            default=30,
            help='عدد الإجازات المرضية التجريبية'
        )
        parser.add_argument(
            '--companion-leaves',
            type=int,
            default=15,
            help='عدد إجازات المرافقين التجريبية'
        )
        parser.add_argument(
            '--invoices',
            type=int,
            default=40,
            help='عدد الفواتير التجريبية'
        )
        parser.add_argument(
            '--payments',
            type=int,
            default=25,
            help='عدد المدفوعات التجريبية'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='إجبار إعادة تعبئة البيانات حتى لو كانت موجودة',
        )

    def handle(self, *args, **options):
        num_patients = options['patients']
        num_sick_leaves = options['sick_leaves']
        num_companion_leaves = options['companion_leaves']
        num_invoices = options['invoices']
        num_payments = options['payments']
        force = options['force']
        
        self.stdout.write(self.style.SUCCESS('بدء تعبئة البيانات التجريبية للمشروع...'))
        
        try:
            with transaction.atomic():
                # التحقق من وجود البيانات الأساسية
                if not self.check_basic_data():
                    self.stdout.write(self.style.ERROR('لا توجد بيانات أساسية. قم بتشغيل الأمر seed_basic_data أولاً.'))
                    return
                
                # إنشاء المرضى التجريبيين
                patients = self.create_demo_patients(num_patients, force)
                
                # إنشاء الإجازات المرضية التجريبية
                sick_leaves = self.create_demo_sick_leaves(num_sick_leaves, patients, force)
                
                # إنشاء إجازات المرافقين التجريبية
                companion_leaves = self.create_demo_companion_leaves(num_companion_leaves, patients, force)
                
                # إنشاء الفواتير التجريبية
                invoices = self.create_demo_invoices(num_invoices, sick_leaves, companion_leaves, force)
                
                # إنشاء المدفوعات التجريبية
                payments = self.create_demo_payments(num_payments, invoices, force)
                
            self.stdout.write(self.style.SUCCESS('تم تعبئة البيانات التجريبية للمشروع بنجاح!'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'حدث خطأ أثناء تعبئة البيانات: {str(e)}'))
    
    def check_basic_data(self):
        """التحقق من وجود البيانات الأساسية"""
        return (
            User.objects.exists() and
            Hospital.objects.exists() and
            Employer.objects.exists() and
            Doctor.objects.exists() and
            Client.objects.exists() and
            LeavePrice.objects.exists()
        )
    
    def create_demo_patients(self, num_patients, force):
        """إنشاء المرضى التجريبيين"""
        if Patient.objects.exists() and not force:
            self.stdout.write(self.style.WARNING('يوجد مرضى بالفعل. تخطي إنشاء المرضى التجريبيين.'))
            return Patient.objects.all()
        
        employers = list(Employer.objects.all())
        
        # قائمة بأسماء عربية شائعة للذكور
        male_first_names = ['محمد', 'أحمد', 'خالد', 'عبدالله', 'سعد', 'فهد', 'عمر', 'علي', 'إبراهيم', 'عبدالرحمن']
        male_last_names = ['العتيبي', 'القحطاني', 'الغامدي', 'الدوسري', 'الشمري', 'المطيري', 'الحربي', 'السبيعي', 'الزهراني', 'العنزي']
        
        # قائمة بأسماء عربية شائعة للإناث
        female_first_names = ['نورة', 'سارة', 'منى', 'هند', 'ريم', 'لمياء', 'عبير', 'أمل', 'فاطمة', 'عائشة']
        female_last_names = ['العتيبي', 'القحطاني', 'الغامدي', 'الدوسري', 'الشمري', 'المطيري', 'الحربي', 'السبيعي', 'الزهراني', 'العنزي']
        
        # قائمة بالجنسيات
        nationalities = ['سعودي', 'مصري', 'أردني', 'سوري', 'يمني', 'لبناني', 'فلسطيني', 'سوداني', 'مغربي', 'تونسي']
        
        patients = []
        
        for i in range(num_patients):
            # تحديد الجنس عشوائيًا
            is_male = random.choice([True, False])
            
            if is_male:
                first_name = random.choice(male_first_names)
                last_name = random.choice(male_last_names)
            else:
                first_name = random.choice(female_first_names)
                last_name = random.choice(female_last_names)
            
            name = f"{first_name} {last_name}"
            
            # إنشاء رقم هوية عشوائي (10 أرقام)
            national_id = ''.join([str(random.randint(0, 9)) for _ in range(10)])
            
            # إنشاء رقم هاتف عشوائي
            phone = f"05{random.randint(10000000, 99999999)}"
            
            # اختيار جنسية عشوائية
            nationality = random.choice(nationalities)
            
            # اختيار جهة عمل عشوائية (أو None)
            employer = random.choice(employers) if random.random() > 0.2 else None
            
            patient = Patient.objects.create(
                national_id=national_id,
                name=name,
                nationality=nationality,
                employer=employer,
                phone=phone,
                email=f"{first_name.lower()}.{last_name.lower()}@example.com" if random.random() > 0.3 else None,
                address=f"الرياض، المملكة العربية السعودية" if random.random() > 0.5 else None
            )
            
            patients.append(patient)
            self.stdout.write(self.style.SUCCESS(f"تم إنشاء المريض {patient.name}"))
        
        return patients
    
    def create_demo_sick_leaves(self, num_sick_leaves, patients, force):
        """إنشاء الإجازات المرضية التجريبية"""
        if SickLeave.objects.exists() and not force:
            self.stdout.write(self.style.WARNING('توجد إجازات مرضية بالفعل. تخطي إنشاء الإجازات المرضية التجريبية.'))
            return SickLeave.objects.all()
        
        doctors = list(Doctor.objects.all())
        
        # قائمة بالحالات المحتملة للإجازة
        statuses = ['active', 'cancelled', 'expired']
        status_weights = [0.8, 0.1, 0.1]  # احتمالية كل حالة
        
        sick_leaves = []
        
        for i in range(num_sick_leaves):
            # اختيار مريض عشوائي
            patient = random.choice(patients)
            
            # اختيار طبيب عشوائي
            doctor = random.choice(doctors)
            
            # تحديد تاريخ الإصدار (خلال الـ 90 يوم الماضية)
            issue_date = timezone.now().date() - timedelta(days=random.randint(0, 90))
            
            # تحديد تاريخ الدخول (قبل تاريخ الإصدار بيوم أو يومين)
            admission_date = issue_date - timedelta(days=random.randint(1, 2))
            
            # تحديد مدة الإجازة (1-30 يوم)
            duration_days = random.choice([1, 2, 3, 5, 7, 10, 14, 30])
            
            # تحديد تاريخ البداية (نفس تاريخ الإصدار أو بعده بيوم)
            start_date = issue_date + timedelta(days=random.randint(0, 1))
            
            # تحديد تاريخ النهاية
            end_date = start_date + timedelta(days=duration_days - 1)
            
            # تحديد تاريخ الخروج (قبل تاريخ الإصدار بيوم)
            discharge_date = issue_date - timedelta(days=1)
            
            # تحديد حالة الإجازة
            status = random.choices(statuses, weights=status_weights)[0]
            
            # إنشاء رقم فريد للإجازة
            leave_id = generate_unique_number('SL')
            
            sick_leave = SickLeave.objects.create(
                leave_id=leave_id,
                patient=patient,
                doctor=doctor,
                start_date=start_date,
                end_date=end_date,
                duration_days=duration_days,
                admission_date=admission_date,
                discharge_date=discharge_date,
                issue_date=issue_date,
                status=status
            )
            
            sick_leaves.append(sick_leave)
            self.stdout.write(self.style.SUCCESS(f"تم إنشاء الإجازة المرضية {sick_leave.leave_id}"))
        
        return sick_leaves
    
    def create_demo_companion_leaves(self, num_companion_leaves, patients, force):
        """إنشاء إجازات المرافقين التجريبية"""
        if CompanionLeave.objects.exists() and not force:
            self.stdout.write(self.style.WARNING('توجد إجازات مرافقين بالفعل. تخطي إنشاء إجازات المرافقين التجريبية.'))
            return CompanionLeave.objects.all()
        
        doctors = list(Doctor.objects.all())
        
        # قائمة بالحالات المحتملة للإجازة
        statuses = ['active', 'cancelled', 'expired']
        status_weights = [0.8, 0.1, 0.1]  # احتمالية كل حالة
        
        companion_leaves = []
        
        for i in range(num_companion_leaves):
            # اختيار مريض عشوائي
            patient = random.choice(patients)
            
            # اختيار مرافق عشوائي (مختلف عن المريض)
            available_companions = [p for p in patients if p.id != patient.id]
            companion = random.choice(available_companions)
            
            # اختيار طبيب عشوائي
            doctor = random.choice(doctors)
            
            # تحديد تاريخ الإصدار (خلال الـ 90 يوم الماضية)
            issue_date = timezone.now().date() - timedelta(days=random.randint(0, 90))
            
            # تحديد تاريخ الدخول (قبل تاريخ الإصدار بيوم أو يومين)
            admission_date = issue_date - timedelta(days=random.randint(1, 2))
            
            # تحديد مدة الإجازة (1-30 يوم)
            duration_days = random.choice([1, 2, 3, 5, 7, 10, 14, 30])
            
            # تحديد تاريخ البداية (نفس تاريخ الإصدار أو بعده بيوم)
            start_date = issue_date + timedelta(days=random.randint(0, 1))
            
            # تحديد تاريخ النهاية
            end_date = start_date + timedelta(days=duration_days - 1)
            
            # تحديد تاريخ الخروج (قبل تاريخ الإصدار بيوم)
            discharge_date = issue_date - timedelta(days=1)
            
            # تحديد حالة الإجازة
            status = random.choices(statuses, weights=status_weights)[0]
            
            # إنشاء رقم فريد للإجازة
            leave_id = generate_unique_number('CL')
            
            companion_leave = CompanionLeave.objects.create(
                leave_id=leave_id,
                patient=patient,
                companion=companion,
                doctor=doctor,
                start_date=start_date,
                end_date=end_date,
                duration_days=duration_days,
                admission_date=admission_date,
                discharge_date=discharge_date,
                issue_date=issue_date,
                status=status
            )
            
            companion_leaves.append(companion_leave)
            self.stdout.write(self.style.SUCCESS(f"تم إنشاء إجازة المرافق {companion_leave.leave_id}"))
        
        return companion_leaves
    
    def create_demo_invoices(self, num_invoices, sick_leaves, companion_leaves, force):
        """إنشاء الفواتير التجريبية"""
        if LeaveInvoice.objects.exists() and not force:
            self.stdout.write(self.style.WARNING('توجد فواتير بالفعل. تخطي إنشاء الفواتير التجريبية.'))
            return LeaveInvoice.objects.all()
        
        clients = list(Client.objects.all())
        
        # قائمة بالحالات المحتملة للفاتورة
        statuses = ['unpaid', 'partially_paid', 'paid', 'cancelled']
        status_weights = [0.4, 0.3, 0.2, 0.1]  # احتمالية كل حالة
        
        # جمع جميع الإجازات
        all_leaves = []
        for leave in sick_leaves:
            all_leaves.append(('sick_leave', leave.leave_id, leave.duration_days))
        
        for leave in companion_leaves:
            all_leaves.append(('companion_leave', leave.leave_id, leave.duration_days))
        
        # خلط الإجازات
        random.shuffle(all_leaves)
        
        # اختيار عدد الإجازات المطلوب للفواتير
        selected_leaves = all_leaves[:num_invoices]
        
        invoices = []
        
        for i, (leave_type, leave_id, duration_days) in enumerate(selected_leaves):
            # اختيار عميل عشوائي
            client = random.choice(clients)
            
            # تحديد تاريخ الإصدار (خلال الـ 60 يوم الماضية)
            issue_date = timezone.now().date() - timedelta(days=random.randint(0, 60))
            
            # تحديد تاريخ الاستحقاق (بعد تاريخ الإصدار بـ 30 يوم)
            due_date = issue_date + timedelta(days=30)
            
            # تحديد حالة الفاتورة
            status = random.choices(statuses, weights=status_weights)[0]
            
            # تحديد المبلغ بناءً على نوع الإجازة ومدتها
            try:
                price = LeavePrice.objects.get(leave_type=leave_type, duration_days=duration_days).price
            except LeavePrice.DoesNotExist:
                # إذا لم يوجد سعر محدد، استخدم سعرًا افتراضيًا
                price = Decimal('100.00') if leave_type == 'sick_leave' else Decimal('150.00')
                price *= duration_days
            
            # إنشاء رقم فريد للفاتورة
            invoice_number = generate_unique_number('INV')
            
            invoice = LeaveInvoice.objects.create(
                invoice_number=invoice_number,
                client=client,
                leave_type=leave_type,
                leave_id=leave_id,
                amount=price,
                status=status,
                issue_date=issue_date,
                due_date=due_date,
                notes=f"فاتورة {leave_type} رقم {leave_id}" if random.random() > 0.7 else None
            )
            
            invoices.append(invoice)
            self.stdout.write(self.style.SUCCESS(f"تم إنشاء الفاتورة {invoice.invoice_number}"))
        
        return invoices
    
    def create_demo_payments(self, num_payments, invoices, force):
        """إنشاء المدفوعات التجريبية"""
        if Payment.objects.exists() and not force:
            self.stdout.write(self.style.WARNING('توجد مدفوعات بالفعل. تخطي إنشاء المدفوعات التجريبية.'))
            return Payment.objects.all()
        
        # قائمة بطرق الدفع المحتملة
        payment_methods = ['cash', 'bank_transfer', 'check', 'credit_card']
        
        # اختيار الفواتير غير الملغية
        valid_invoices = [inv for inv in invoices if inv.status != 'cancelled']
        
        # تجميع الفواتير حسب العميل
        client_invoices = {}
        for invoice in valid_invoices:
            if invoice.client.id not in client_invoices:
                client_invoices[invoice.client.id] = []
            client_invoices[invoice.client.id].append(invoice)
        
        payments = []
        
        # إنشاء عدد محدد من المدفوعات
        for i in range(min(num_payments, len(valid_invoices))):
            # اختيار عميل عشوائي له فواتير
            client_id = random.choice(list(client_invoices.keys()))
            client_invoices_list = client_invoices[client_id]
            
            # إذا لم يتبق فواتير لهذا العميل، استمر للعميل التالي
            if not client_invoices_list:
                continue
            
            # اختيار فاتورة أو أكثر لهذا العميل
            num_invoices_to_pay = min(random.randint(1, 3), len(client_invoices_list))
            invoices_to_pay = random.sample(client_invoices_list, num_invoices_to_pay)
            
            # تحديد تاريخ الدفع (بعد تاريخ إصدار الفاتورة)
            payment_date = max([inv.issue_date for inv in invoices_to_pay]) + timedelta(days=random.randint(1, 15))
            
            # تحديد طريقة الدفع
            payment_method = random.choice(payment_methods)
            
            # تحديد المبلغ (إما كامل المبلغ أو جزء منه)
            total_amount = sum([inv.amount for inv in invoices_to_pay])
            if random.random() > 0.3:  # 70% احتمالية دفع كامل المبلغ
                amount = total_amount
            else:  # 30% احتمالية دفع جزء من المبلغ
                amount = Decimal(str(round(float(total_amount) * random.uniform(0.3, 0.9), 2)))
            
            # إنشاء رقم فريد للدفعة
            payment_number = generate_unique_number('PAY')
            
            # إنشاء رقم مرجعي عشوائي
            reference_number = ''.join([str(random.randint(0, 9)) for _ in range(8)]) if random.random() > 0.5 else None
            
            # إنشاء الدفعة
            payment = Payment.objects.create(
                payment_number=payment_number,
                client=invoices_to_pay[0].client,
                amount=amount,
                payment_method=payment_method,
                payment_date=payment_date,
                reference_number=reference_number,
                notes=f"دفعة لـ {num_invoices_to_pay} فاتورة" if random.random() > 0.7 else None
            )
            
            # توزيع المبلغ على الفواتير
            remaining_amount = amount
            for j, invoice in enumerate(invoices_to_pay):
                # للفاتورة الأخيرة، استخدم المبلغ المتبقي
                if j == len(invoices_to_pay) - 1:
                    detail_amount = remaining_amount
                else:
                    # للفواتير الأخرى، استخدم نسبة من المبلغ
                    max_amount = min(invoice.amount, remaining_amount)
                    detail_amount = Decimal(str(round(float(max_amount) * random.uniform(0.5, 1.0), 2)))
                    remaining_amount -= detail_amount
                
                # إنشاء تفاصيل الدفعة
                PaymentDetail.objects.create(
                    payment=payment,
                    invoice=invoice,
                    amount=detail_amount
                )
                
                # تحديث حالة الفاتورة
                paid_amount = sum([pd.amount for pd in invoice.payment_details.all()])
                if paid_amount >= invoice.amount:
                    invoice.status = 'paid'
                elif paid_amount > 0:
                    invoice.status = 'partially_paid'
                invoice.save()
            
            payments.append(payment)
            self.stdout.write(self.style.SUCCESS(f"تم إنشاء الدفعة {payment.payment_number}"))
            
            # إزالة الفواتير المدفوعة بالكامل من القائمة
            for invoice in invoices_to_pay:
                if invoice.status == 'paid':
                    client_invoices_list.remove(invoice)
        
        return payments

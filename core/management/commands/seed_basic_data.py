from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.models import Client, Doctor, Hospital, LeavePrice, Patient, User


class Command(BaseCommand):
    help = 'تعبئة البيانات الأساسية للمشروع'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='إجبار إعادة تعبئة البيانات حتى لو كانت موجودة',
        )

    def handle(self, *args, **options):
        force = options['force']

        self.stdout.write(self.style.SUCCESS('بدء تعبئة البيانات الأساسية للمشروع...'))

        try:
            with transaction.atomic():
                # إنشاء المستخدمين الأساسيين
                self.create_basic_users(force)

                # إنشاء المستشفيات الأساسية
                self.create_basic_hospitals(force)

                # ملاحظة: تم الاستغناء عن نموذج Employer واستبداله بحقول في نموذج Patient

                # إنشاء الأطباء الأساسيين
                self.create_basic_doctors(force)

                # إنشاء العملاء الأساسيين
                self.create_basic_clients(force)

                # إنشاء أسعار الإجازات
                self.create_leave_prices(force)

            self.stdout.write(self.style.SUCCESS('تم تعبئة البيانات الأساسية للمشروع بنجاح!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'حدث خطأ أثناء تعبئة البيانات: {str(e)}'))

    def create_basic_users(self, force):
        """إنشاء المستخدمين الأساسيين"""
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'password': 'admin123',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            },
            {
                'username': 'doctor',
                'email': 'doctor@example.com',
                'password': 'doctor123',
                'role': 'doctor'
            },
            {
                'username': 'staff',
                'email': 'staff@example.com',
                'password': 'staff123',
                'role': 'staff'
            }
        ]

        for user_data in users_data:
            if not User.objects.filter(username=user_data['username']).exists():
                User.objects.create(
                    username=user_data['username'],
                    email=user_data['email'],
                    password=make_password(user_data['password']),
                    role=user_data['role'],
                    is_staff=user_data.get('is_staff', False),
                    is_superuser=user_data.get('is_superuser', False)
                )
                self.stdout.write(self.style.SUCCESS(f"تم إنشاء المستخدم {user_data['username']}"))
            else:
                self.stdout.write(self.style.WARNING(f"المستخدم {user_data['username']} موجود بالفعل"))

    def create_basic_hospitals(self, force):
        """إنشاء المستشفيات الأساسية"""
        hospitals_data = [
            {
                'name': 'مجمع عيادات بسمة الرياض الطبي',
                'address': 'الرياض، المملكة العربية السعودية',
                'contact_info': '011-1234567'
            },
            {
                'name': 'مستشفى الملك فهد التخصصي',
                'address': 'الدمام، المملكة رطالعربية السعودية',
                'contact_info': '013-8912345'
            },
            {
                'name': 'مستشفى الملك فيصل التخصصي',
                'address': 'جدة، المملكة العربية السعودية',
                'contact_info': '012-6789012'
            }
        ]

        for hospital_data in hospitals_data:
            if force or not Hospital.objects.filter(name=hospital_data['name']).exists():
                Hospital.objects.create(**hospital_data)
                self.stdout.write(self.style.SUCCESS(f"تم إنشاء المستشفى {hospital_data['name']}"))

    def create_basic_doctors(self, force):
        """إنشاء الأطباء الأساسيين"""
        # التأكد من وجود مستشفيات
        hospitals = Hospital.objects.all()
        if not hospitals.exists():
            self.stdout.write(self.style.WARNING('لا توجد مستشفيات لإضافة الأطباء إليها'))
            return

        doctors_data = [
            {
                'national_id': '1000000001',
                'name': 'د. أحمد محمد',
                'position': 'استشاري طب باطني',
                'phone': '0501234567',
                'email': 'ahmed@example.com'
            },
            {
                'national_id': '1000000002',
                'name': 'د. سارة عبدالله',
                'position': 'استشاري أمراض قلب',
                'phone': '0502345678',
                'email': 'sara@example.com'
            },
            {
                'national_id': '1000000003',
                'name': 'د. خالد عبدالرحمن',
                'position': 'استشاري جراحة عامة',
                'phone': '0503456789',
                'email': 'khalid@example.com'
            },
            {
                'national_id': '1000000004',
                'name': 'د. نورة سعد',
                'position': 'استشاري أمراض نساء وولادة',
                'phone': '0504567890',
                'email': 'noura@example.com'
            },
            {
                'national_id': '1000000005',
                'name': 'د. محمد فهد',
                'position': 'استشاري أمراض عصبية',
                'phone': '0505678901',
                'email': 'mohammed@example.com'
            }
        ]

        for i, doctor_data in enumerate(doctors_data):
            if force or not Doctor.objects.filter(national_id=doctor_data['national_id']).exists():
                doctor = Doctor.objects.create(**doctor_data)
                # ربط الطبيب بالمستشفى
                if i < len(hospitals):
                    doctor.hospitals.add(hospitals[i % len(hospitals)])
                self.stdout.write(self.style.SUCCESS(f"تم إنشاء الطبيب {doctor_data['name']}"))

    def create_basic_clients(self, force):
        """إنشاء العملاء الأساسيين"""
        clients_data = [
            {
                'name': 'شركة التأمين الوطنية',
                'phone': '0511234567',
                'email': 'info@nationalinsurance.com',
                'address': 'الرياض، المملكة العربية السعودية'
            },
            {
                'name': 'شركة التأمين التعاوني',
                'phone': '0512345678',
                'email': 'info@cooperativeinsurance.com',
                'address': 'جدة، المملكة العربية السعودية'
            },
            {
                'name': 'شركة بوبا العربية للتأمين',
                'phone': '0513456789',
                'email': 'info@bupa.com',
                'address': 'الخبر، المملكة العربية السعودية'
            }
        ]

        for client_data in clients_data:
            if force or not Client.objects.filter(phone=client_data['phone']).exists():
                Client.objects.create(**client_data)
                self.stdout.write(self.style.SUCCESS(f"تم إنشاء العميل {client_data['name']}"))

    def create_leave_prices(self, force):
        """إنشاء أسعار الإجازات"""
        # أسعار الإجازات المرضية اليومية
        per_day_prices = [
            # أسعار الإجازات المرضية
            {'leave_type': 'sick_leave', 'duration_days': 1, 'price': 100, 'pricing_type': 'per_day'},
            {'leave_type': 'sick_leave', 'duration_days': 2, 'price': 180, 'pricing_type': 'per_day'},
            {'leave_type': 'sick_leave', 'duration_days': 3, 'price': 250, 'pricing_type': 'per_day'},
            {'leave_type': 'sick_leave', 'duration_days': 5, 'price': 400, 'pricing_type': 'per_day'},
            {'leave_type': 'sick_leave', 'duration_days': 7, 'price': 550, 'pricing_type': 'per_day'},
            {'leave_type': 'sick_leave', 'duration_days': 10, 'price': 750, 'pricing_type': 'per_day'},
            {'leave_type': 'sick_leave', 'duration_days': 14, 'price': 1000, 'pricing_type': 'per_day'},
            {'leave_type': 'sick_leave', 'duration_days': 30, 'price': 2000, 'pricing_type': 'per_day'},

            # أسعار إجازات المرافقة
            {'leave_type': 'companion_leave', 'duration_days': 1, 'price': 150, 'pricing_type': 'per_day'},
            {'leave_type': 'companion_leave', 'duration_days': 2, 'price': 280, 'pricing_type': 'per_day'},
            {'leave_type': 'companion_leave', 'duration_days': 3, 'price': 400, 'pricing_type': 'per_day'},
            {'leave_type': 'companion_leave', 'duration_days': 5, 'price': 650, 'pricing_type': 'per_day'},
            {'leave_type': 'companion_leave', 'duration_days': 7, 'price': 900, 'pricing_type': 'per_day'},
            {'leave_type': 'companion_leave', 'duration_days': 10, 'price': 1200, 'pricing_type': 'per_day'},
            {'leave_type': 'companion_leave', 'duration_days': 14, 'price': 1600, 'pricing_type': 'per_day'},
            {'leave_type': 'companion_leave', 'duration_days': 30, 'price': 3000, 'pricing_type': 'per_day'}
        ]

        # أسعار الإجازات الثابتة
        fixed_prices = [
            # أسعار ثابتة للإجازات المرضية
            {'leave_type': 'sick_leave', 'duration_days': 1, 'price': 150, 'pricing_type': 'fixed'},
            {'leave_type': 'sick_leave', 'duration_days': 1, 'price': 500, 'pricing_type': 'fixed', 'client': Client.objects.filter(name='شركة التأمين الوطنية').first()},
            {'leave_type': 'sick_leave', 'duration_days': 1, 'price': 450, 'pricing_type': 'fixed', 'client': Client.objects.filter(name='شركة التأمين التعاوني').first()},

            # أسعار ثابتة لإجازات المرافقة
            {'leave_type': 'companion_leave', 'duration_days': 1, 'price': 200, 'pricing_type': 'fixed'},
            {'leave_type': 'companion_leave', 'duration_days': 1, 'price': 600, 'pricing_type': 'fixed', 'client': Client.objects.filter(name='شركة التأمين الوطنية').first()},
            {'leave_type': 'companion_leave', 'duration_days': 1, 'price': 550, 'pricing_type': 'fixed', 'client': Client.objects.filter(name='شركة بوبا العربية للتأمين').first()}
        ]

        # إنشاء الأسعار اليومية
        for price_data in per_day_prices:
            if force or not LeavePrice.objects.filter(
                leave_type=price_data['leave_type'],
                duration_days=price_data['duration_days'],
                pricing_type='per_day',
                client__isnull=True
            ).exists():
                LeavePrice.objects.create(**price_data)
                self.stdout.write(self.style.SUCCESS(
                    f"تم إنشاء سعر يومي لإجازة {price_data['leave_type']} لمدة {price_data['duration_days']} يوم"
                ))

        # إنشاء الأسعار الثابتة
        for price_data in fixed_prices:
            client_name = price_data['client'].name if 'client' in price_data and price_data['client'] else 'عام'
            if force or not LeavePrice.objects.filter(
                leave_type=price_data['leave_type'],
                pricing_type='fixed',
                client=price_data.get('client')
            ).exists():
                LeavePrice.objects.create(**price_data)
                self.stdout.write(self.style.SUCCESS(
                    f"تم إنشاء سعر ثابت لإجازة {price_data['leave_type']} للعميل {client_name}"
                ))

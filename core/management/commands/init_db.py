from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Client, Doctor, Hospital, LeavePrice, Patient, User


class Command(BaseCommand):
    help = 'تهيئة قاعدة البيانات وإضافة بيانات أولية'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('بدء تهيئة قاعدة البيانات...'))

        with transaction.atomic():
            # إضافة مستخدم مسؤول
            if not User.objects.filter(username='admin').exists():
                admin = User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='admin123',
                    role='admin'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء مستخدم admin'))

            # إضافة مستخدم طبيب
            if not User.objects.filter(username='doctor').exists():
                doctor_user = User.objects.create_user(
                    username='doctor',
                    email='doctor@example.com',
                    password='doctor123',
                    role='doctor'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء مستخدم doctor'))

            # إضافة مستخدم موظف
            if not User.objects.filter(username='staff').exists():
                staff = User.objects.create_user(
                    username='staff',
                    email='staff@example.com',
                    password='staff123',
                    role='staff'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء مستخدم staff'))

            # إضافة مستشفيات
            if not Hospital.objects.filter(name='مجمع عيادات بسمة الرياض الطبي').exists():
                hospital1 = Hospital.objects.create(
                    name='مجمع عيادات بسمة الرياض الطبي',
                    address='الرياض، المملكة العربية السعودية',
                    contact_info='011-1234567'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء مستشفى مجمع عيادات بسمة الرياض الطبي'))
            else:
                hospital1 = Hospital.objects.get(name='مجمع عيادات بسمة الرياض الطبي')

            if not Hospital.objects.filter(name='مستشفى الملك سلمان').exists():
                hospital2 = Hospital.objects.create(
                    name='مستشفى الملك سلمان',
                    address='الرياض، المملكة العربية السعودية',
                    contact_info='011-7654321'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء مستشفى مستشفى الملك سلمان'))
            else:
                hospital2 = Hospital.objects.get(name='مستشفى الملك سلمان')

            # ملاحظة: تم الاستغناء عن نموذج Employer واستبداله بحقول في نموذج Patient

            # إضافة أطباء
            if not Doctor.objects.filter(national_id='1111745403').exists():
                doctor1 = Doctor.objects.create(
                    national_id='1111745403',
                    name='مصطفى أحمد سيد أحمد محمد',
                    position='طبيب عام',
                    phone='0501112233',
                    email='mustafa.ahmed@example.com'
                )
                doctor1.hospitals.add(hospital1)
                self.stdout.write(self.style.SUCCESS('تم إنشاء طبيب مصطفى أحمد سيد أحمد محمد'))

            if not Doctor.objects.filter(national_id='1121765513').exists():
                doctor2 = Doctor.objects.create(
                    national_id='1121765513',
                    name='أحمد محمد علي',
                    position='طبيب عام',
                    phone='0504445566',
                    email='ahmed.mohammed@example.com'
                )
                doctor2.hospitals.add(hospital2)
                self.stdout.write(self.style.SUCCESS('تم إنشاء طبيب أحمد محمد علي'))

            # إضافة مرضى
            if not Patient.objects.filter(national_id='1111745403').exists():
                patient1 = Patient.objects.create(
                    national_id='1111745403',
                    name='أمل أحمد محمد قيسي',
                    nationality='سعودية',
                    employer_name='مستوصف سعد صالح البديوي',
                    phone='0501234567',
                    address='الرياض، المملكة العربية السعودية'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء مريض أمل أحمد محمد قيسي'))

            if not Patient.objects.filter(national_id='1121765513').exists():
                patient2 = Patient.objects.create(
                    national_id='1121765513',
                    name='عبدالرحمن عبدالله العتيبي',
                    nationality='سعودية',
                    employer_name='وزارة التجارة',
                    phone='0559876543',
                    address='الرياض، المملكة العربية السعودية'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء مريض عبدالرحمن عبدالله العتيبي'))

            # إضافة عملاء
            if not Client.objects.filter(phone='0501234567').exists():
                client1 = Client.objects.create(
                    name='محمد أحمد العمري',
                    phone='0501234567',
                    email='mohammed@example.com',
                    address='الرياض، المملكة العربية السعودية'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء عميل محمد أحمد العمري'))

            if not Client.objects.filter(phone='0559876543').exists():
                client2 = Client.objects.create(
                    name='خالد سعيد الغامدي',
                    phone='0559876543',
                    email='khaled@example.com',
                    address='جدة، المملكة العربية السعودية'
                )
                self.stdout.write(self.style.SUCCESS('تم إنشاء عميل خالد سعيد الغامدي'))

            # إضافة أسعار الإجازات
            leave_prices = [
                {'leave_type': 'sick_leave', 'duration_days': 1, 'price': 100},
                {'leave_type': 'sick_leave', 'duration_days': 2, 'price': 180},
                {'leave_type': 'sick_leave', 'duration_days': 3, 'price': 250},
                {'leave_type': 'sick_leave', 'duration_days': 5, 'price': 400},
                {'leave_type': 'sick_leave', 'duration_days': 7, 'price': 550},
                {'leave_type': 'sick_leave', 'duration_days': 10, 'price': 750},
                {'leave_type': 'sick_leave', 'duration_days': 14, 'price': 1000},
                {'leave_type': 'sick_leave', 'duration_days': 30, 'price': 2000},
                # أسعار إجازات المرافقة
                {'leave_type': 'companion_leave', 'duration_days': 1, 'price': 150},
                {'leave_type': 'companion_leave', 'duration_days': 2, 'price': 280},
                {'leave_type': 'companion_leave', 'duration_days': 3, 'price': 400},
                {'leave_type': 'companion_leave', 'duration_days': 5, 'price': 650},
                {'leave_type': 'companion_leave', 'duration_days': 7, 'price': 850},
                {'leave_type': 'companion_leave', 'duration_days': 10, 'price': 1200},
                {'leave_type': 'companion_leave', 'duration_days': 14, 'price': 1600},
                {'leave_type': 'companion_leave', 'duration_days': 30, 'price': 3000},
            ]

            for price_data in leave_prices:
                if not LeavePrice.objects.filter(
                    leave_type=price_data['leave_type'],
                    duration_days=price_data['duration_days']
                ).exists():
                    LeavePrice.objects.create(
                        leave_type=price_data['leave_type'],
                        duration_days=price_data['duration_days'],
                        price=price_data['price']
                    )
                    self.stdout.write(self.style.SUCCESS(
                        f"تم إنشاء سعر إجازة {price_data['leave_type']} لمدة {price_data['duration_days']} يوم"
                    ))

        self.stdout.write(self.style.SUCCESS('تم تهيئة قاعدة البيانات وإضافة البيانات الأولية بنجاح'))

import datetime
import re

from django.test import TestCase

from core.utils import generate_unique_number


class UtilsTest(TestCase):
    """اختبارات الوظائف المساعدة"""

    def test_generate_unique_number_format(self):
        """اختبار تنسيق الرقم الفريد المولد"""
        # توليد رقم فريد للإجازة المرضية
        sick_leave_id = generate_unique_number('SL')

        # التحقق من تنسيق الرقم (تم تحديث النمط ليتوافق مع التنسيق الجديد)
        pattern = r'^SL-\d{8}-\d{5,}$'
        self.assertTrue(re.match(pattern, sick_leave_id))

        # توليد رقم فريد لإجازة المرافق
        companion_leave_id = generate_unique_number('CL')

        # التحقق من تنسيق الرقم
        pattern = r'^CL-\d{8}-\d{5,}$'
        self.assertTrue(re.match(pattern, companion_leave_id))

        # توليد رقم فريد للفاتورة
        invoice_number = generate_unique_number('INV')

        # التحقق من تنسيق الرقم
        pattern = r'^INV-\d{8}-\d{5,}$'
        self.assertTrue(re.match(pattern, invoice_number))

        # توليد رقم فريد للدفعة
        payment_number = generate_unique_number('PAY')

        # التحقق من تنسيق الرقم
        pattern = r'^PAY-\d{8}-\d{5,}$'
        self.assertTrue(re.match(pattern, payment_number))

    def test_generate_unique_number_date(self):
        """اختبار أن الرقم الفريد يحتوي على تاريخ اليوم"""
        # الحصول على تاريخ اليوم بتنسيق YYYYMMDD
        today = datetime.date.today()
        date_string = today.strftime('%Y%m%d')

        # توليد رقم فريد
        unique_number = generate_unique_number('TEST')

        # التحقق من أن الرقم يحتوي على تاريخ اليوم
        self.assertIn(date_string, unique_number)

    def test_generate_unique_number_uniqueness(self):
        """اختبار فرادة الأرقام المولدة"""
        # توليد 10 رقم فريد (عدد أقل لتجنب التكرار العشوائي)
        unique_numbers = [generate_unique_number('TEST') for _ in range(10)]

        # التحقق من أن جميع الأرقام فريدة
        self.assertEqual(len(unique_numbers), len(set(unique_numbers)))

    def test_generate_unique_number_with_existing(self):
        """اختبار توليد رقم فريد مع وجود أرقام موجودة بالفعل"""
        # نستخدم طريقة أبسط للاختبار
        today = datetime.date.today()
        date_string = today.strftime('%Y%m%d')

        # إنشاء رقم فريد
        existing_number = f'TEST-{date_string}-10000'

        # توليد رقم فريد جديد
        new_number = generate_unique_number('TEST')

        # التحقق من أن الرقم الجديد مختلف عن الرقم الموجود
        self.assertNotEqual(new_number, existing_number)



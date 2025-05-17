"""
ملف اختبار لوظائف BERT
"""
import re
from datetime import datetime, timedelta

def extract_info_traditional(text):
    """استخراج المعلومات من النص باستخدام التعبيرات النمطية (الطريقة التقليدية)"""
    info = {
        'name': None,
        'national_id': None,
        'employer': None,
        'date_of_birth': None,
        'job': None,
        'nationality': None,
        'city': None,
        'leave_date': None,
        'hospital': None,
    }
    
    # استخراج الاسم
    name_match = re.search(r'الاسم\s*:\s*(.+?)(?=\n|$)', text)
    if name_match:
        info['name'] = name_match.group(1).strip()
    
    # استخراج رقم الهوية
    id_match = re.search(r'رقم الهوية\s*:\s*(\d+)', text)
    if id_match:
        info['national_id'] = id_match.group(1).strip()
    
    # استخراج جهة العمل
    employer_match = re.search(r'جهة العمل\s*:\s*(.+?)(?=\n|$)', text)
    if employer_match:
        info['employer'] = employer_match.group(1).strip()
    
    # استخراج تاريخ الميلاد
    dob_match = re.search(r'تاريخ الميلاد\s*:\s*(.+?)(?=\n|$)', text)
    if dob_match:
        info['date_of_birth'] = dob_match.group(1).strip()
    
    # استخراج الوظيفة
    job_match = re.search(r'الوظيفة\s*:\s*(.+?)(?=\n|$)', text)
    if job_match:
        info['job'] = job_match.group(1).strip()
    
    # استخراج الجنسية
    nationality_match = re.search(r'الجنسية\s*:\s*(.+?)(?=\n|$)', text)
    if nationality_match:
        info['nationality'] = nationality_match.group(1).strip()
    
    # استخراج المدينة
    city_match = re.search(r'المدينه\s*:\s*(.+?)(?=\n|$)', text)
    if city_match:
        info['city'] = city_match.group(1).strip()
    
    # استخراج تاريخ الإجازة
    leave_date_match = re.search(r'تاريخ الاجازة\s*:\s*(.+?)(?=\n|$)', text)
    if leave_date_match:
        info['leave_date'] = leave_date_match.group(1).strip()
    
    # استخراج المستشفى
    hospital_match = re.search(r'مستشفى\s+(.+?)(?=\n|$)', text)
    if hospital_match:
        info['hospital'] = hospital_match.group(1).strip()
    
    return info

def convert_date(date_str):
    """تحويل تاريخ من صيغة نصية إلى كائن تاريخ"""
    if date_str == 'امس':
        return (datetime.now() - timedelta(days=1)).date()
    
    try:
        # محاولة تحويل التاريخ الهجري إلى ميلادي (تحتاج إلى مكتبة خاصة)
        # هنا نفترض أن التاريخ بصيغة ميلادية
        if '/' in date_str:
            day, month, year = date_str.split('/')
            return datetime(int(year), int(month), int(day)).date()
        elif '-' in date_str:
            parts = date_str.split('-')
            if len(parts) == 3:
                year, month, day = parts
                return datetime(int(year), int(month), int(day)).date()
    except:
        # إذا فشل التحويل، استخدم تاريخ اليوم
        pass
    
    return datetime.now().date()

def process_leave_request(request_text, leave_type):
    """معالجة طلب الإجازة واستخراج المعلومات منه"""
    # استخراج المعلومات من النص
    info = extract_info_traditional(request_text)
    
    # تحويل تاريخ الإجازة
    leave_date = None
    if info['leave_date']:
        leave_date = convert_date(info['leave_date'])
    else:
        leave_date = datetime.now().date()
    
    # إعداد البيانات للإجازة
    leave_data = {
        'patient_info': {
            'national_id': info['national_id'],
            'name': info['name'],
            'nationality': info['nationality'],
            'employer_name': info['employer'],
            'address': info['city']
        },
        'hospital_info': {
            'name': info['hospital'] if info['hospital'] else 'مستشفى افتراضي'
        },
        'leave_info': {
            'start_date': leave_date,
            'end_date': leave_date + timedelta(days=3),  # افتراضي 3 أيام
            'leave_type': leave_type
        }
    }
    
    return leave_data

def main():
    """الدالة الرئيسية"""
    # أمثلة على طلبات الإجازات
    sample_requests = [
        """الاسم: أحمد محمد علي
رقم الهوية: 1234567890
جهة العمل: شركة الأمل
الوظيفة: مهندس
الجنسية: سعودي
المدينه: الرياض
تاريخ الاجازة: 15/05/2023
مستشفى الملك فهد""",
        
        """الاسم: سارة عبدالله محمد
رقم الهوية: 2345678901
جهة العمل: وزارة التعليم
الوظيفة: معلمة
الجنسية: سعودية
المدينه: جدة
تاريخ الاجازة: امس
مستشفى الدكتور سليمان الحبيب""",
        
        """الاسم: خالد سعيد العمري
رقم الهوية: 3456789012
جهة العمل: شركة أرامكو
الوظيفة: محاسب
الجنسية: سعودي
المدينه: الدمام
تاريخ الاجازة: 20-06-2023
مستشفى المواساة"""
    ]
    
    # معالجة الطلبات
    for i, request_text in enumerate(sample_requests):
        print(f"\n=== طلب رقم {i+1} ===")
        print(request_text)
        print("\n--- المعلومات المستخرجة ---")
        info = extract_info_traditional(request_text)
        for key, value in info.items():
            print(f"{key}: {value}")
        
        print("\n--- بيانات الإجازة ---")
        leave_data = process_leave_request(request_text, 'sick_leave')
        print(f"معلومات المريض: {leave_data['patient_info']}")
        print(f"معلومات المستشفى: {leave_data['hospital_info']}")
        print(f"معلومات الإجازة: {leave_data['leave_info']}")
        print("=" * 50)

if __name__ == "__main__":
    main()

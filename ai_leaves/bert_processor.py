"""
وحدة معالجة النصوص باستخدام نموذج BERT
"""
import os
import re
from datetime import datetime, timedelta

import torch
from transformers import (AutoModelForTokenClassification, AutoTokenizer,
                          pipeline)

# تحديد الجهاز (CPU أو GPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# تحميل النموذج والتوكنايزر
MODEL_NAME = "aubmindlab/bert-base-arabertv02"  # النموذج الأساسي
CUSTOM_MODEL_PATH = "./bert_model"  # مسار النموذج المدرب محليًا
tokenizer = None
model = None
ner_pipeline = None

def load_model():
    """تحميل نموذج BERT"""
    global tokenizer, model, ner_pipeline

    try:
        # التحقق من وجود المجلد
        if not os.path.exists(CUSTOM_MODEL_PATH):
            print(f"مجلد النموذج غير موجود: {CUSTOM_MODEL_PATH}")
            return False

        # التحقق من وجود ملفات النموذج
        if not os.path.exists(os.path.join(CUSTOM_MODEL_PATH, "config.json")):
            print(f"ملفات النموذج غير مكتملة في: {CUSTOM_MODEL_PATH}")
            return False

        # تحميل النموذج المحلي
        print("جاري تحميل النموذج المحلي...")
        tokenizer = AutoTokenizer.from_pretrained(CUSTOM_MODEL_PATH)
        model = AutoModelForTokenClassification.from_pretrained(CUSTOM_MODEL_PATH)
        print("تم تحميل النموذج المحلي بنجاح")

        # إنشاء pipeline لاستخراج الكيانات المسماة
        ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, device=0 if torch.cuda.is_available() else -1)
        print("تم إنشاء pipeline بنجاح")

        return True
    except Exception as e:
        print(f"خطأ في تحميل النموذج: {e}")
        return False

def extract_info_with_bert(text):
    """استخراج المعلومات من النص باستخدام BERT"""
    # في حالة عدم تحميل النموذج، استخدم الطريقة التقليدية
    if ner_pipeline is None:
        # محاولة تحميل النموذج
        if not load_model():
            print("لم يتم تحميل النموذج، استخدام الطريقة التقليدية")
            return extract_info_traditional(text)

    # استخراج الكيانات المسماة باستخدام BERT
    try:
        entities = ner_pipeline(text)

        # معالجة النتائج وتنظيمها
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

        # استخراج المعلومات من الكيانات المستخرجة
        # هذا الجزء يحتاج إلى تخصيص بناءً على نتائج النموذج المدرب
        if entities:
            # معالجة الكيانات المستخرجة
            current_entity = None
            current_value = ""

            for entity in entities:
                entity_type = entity['entity']
                word = entity['word']

                # تحويل تسميات الكيانات إلى مفاتيح في القاموس
                if entity_type.startswith('B-NAME'):
                    if current_entity and current_value:
                        info[current_entity] = current_value.strip()
                    current_entity = 'name'
                    current_value = word
                elif entity_type.startswith('B-ID'):
                    if current_entity and current_value:
                        info[current_entity] = current_value.strip()
                    current_entity = 'national_id'
                    current_value = word
                elif entity_type.startswith('B-EMPLOYER'):
                    if current_entity and current_value:
                        info[current_entity] = current_value.strip()
                    current_entity = 'employer'
                    current_value = word
                elif entity_type.startswith('B-DATE'):
                    if current_entity and current_value:
                        info[current_entity] = current_value.strip()
                    current_entity = 'leave_date'
                    current_value = word
                elif entity_type.startswith('B-HOSPITAL'):
                    if current_entity and current_value:
                        info[current_entity] = current_value.strip()
                    current_entity = 'hospital'
                    current_value = word
                elif entity_type.startswith('B-CITY'):
                    if current_entity and current_value:
                        info[current_entity] = current_value.strip()
                    current_entity = 'city'
                    current_value = word
                elif entity_type.startswith('B-NATIONALITY'):
                    if current_entity and current_value:
                        info[current_entity] = current_value.strip()
                    current_entity = 'nationality'
                    current_value = word
                elif entity_type.startswith('B-JOB'):
                    if current_entity and current_value:
                        info[current_entity] = current_value.strip()
                    current_entity = 'job'
                    current_value = word
                elif entity_type.startswith('I-') and current_entity:
                    current_value += " " + word

            # حفظ آخر كيان
            if current_entity and current_value:
                info[current_entity] = current_value.strip()

        # إذا لم يتم استخراج بعض المعلومات، استخدم الطريقة التقليدية كاحتياط
        traditional_info = extract_info_traditional(text)
        for key, value in info.items():
            if value is None:
                info[key] = traditional_info[key]

        return info
    except Exception as e:
        print(f"خطأ في استخراج المعلومات باستخدام BERT: {e}")
        return extract_info_traditional(text)

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
    info = extract_info_with_bert(request_text)

    # تحويل تاريخ الإجازة
    leave_date = None
    if info['leave_date']:
        leave_date = convert_date(info['leave_date'])
    else:
        leave_date = datetime.now().date()

    # إعداد البيانات للإجازة
    leave_data = {
        'patient_info': {
            'national_id': info['national_id'] or '1000000000',  # رقم افتراضي إذا لم يتم استخراجه
            'name': info['name'] or 'مريض افتراضي',  # اسم افتراضي إذا لم يتم استخراجه
            'nationality': info['nationality'] or 'سعودي',
            'employer_name': info['employer'] or 'غير محدد',
            'address': info['city'] or 'غير محدد'
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

"""
سكريبت لتنزيل نموذج BERT وحفظه محليًا
"""
import os
import sys

def download_bert_model():
    """تنزيل نموذج BERT وحفظه محليًا"""
    try:
        # التأكد من تثبيت المكتبات المطلوبة
        import torch
        from transformers import AutoModelForTokenClassification, AutoTokenizer
        
        print("بدء تنزيل نموذج BERT...")
        
        # تحديد اسم النموذج ومسار الحفظ
        MODEL_NAME = "aubmindlab/bert-base-arabertv02"
        CUSTOM_MODEL_PATH = "./bert_model"
        
        # إنشاء المجلد إذا لم يكن موجودًا
        os.makedirs(CUSTOM_MODEL_PATH, exist_ok=True)
        
        # تنزيل النموذج والتوكنايزر
        print("تنزيل التوكنايزر...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        tokenizer.save_pretrained(CUSTOM_MODEL_PATH)
        
        print("تنزيل النموذج...")
        model = AutoModelForTokenClassification.from_pretrained(MODEL_NAME)
        model.save_pretrained(CUSTOM_MODEL_PATH)
        
        print(f"تم تنزيل النموذج بنجاح وحفظه في: {CUSTOM_MODEL_PATH}")
        return True
    except Exception as e:
        print(f"حدث خطأ أثناء تنزيل النموذج: {e}")
        return False

if __name__ == "__main__":
    # تنزيل النموذج
    success = download_bert_model()
    sys.exit(0 if success else 1)

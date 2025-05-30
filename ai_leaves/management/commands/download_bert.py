"""
أمر إدارة Django لتنزيل نموذج BERT
"""
import os

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'تنزيل نموذج BERT وحفظه محليًا'

    def handle(self, *args, **options):
        try:
            # التأكد من تثبيت المكتبات المطلوبة
            import torch
            from transformers import AutoModelForTokenClassification, AutoTokenizer
            
            self.stdout.write(self.style.SUCCESS("بدء تنزيل نموذج BERT..."))
            
            # تحديد اسم النموذج ومسار الحفظ
            MODEL_NAME = "aubmindlab/bert-base-arabertv02"
            CUSTOM_MODEL_PATH = "./bert_model"
            
            # إنشاء المجلد إذا لم يكن موجودًا
            os.makedirs(CUSTOM_MODEL_PATH, exist_ok=True)
            
            # تنزيل النموذج والتوكنايزر
            self.stdout.write("تنزيل التوكنايزر...")
            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
            tokenizer.save_pretrained(CUSTOM_MODEL_PATH)
            
            self.stdout.write("تنزيل النموذج...")
            model = AutoModelForTokenClassification.from_pretrained(MODEL_NAME)
            model.save_pretrained(CUSTOM_MODEL_PATH)
            
            self.stdout.write(self.style.SUCCESS(f"تم تنزيل النموذج بنجاح وحفظه في: {CUSTOM_MODEL_PATH}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"حدث خطأ أثناء تنزيل النموذج: {e}"))

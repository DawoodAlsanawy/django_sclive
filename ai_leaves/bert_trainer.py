"""
وحدة تدريب نموذج BERT لاستخراج المعلومات من طلبات الإجازات
"""
import json
import os
import re
from datetime import datetime

import torch
from torch.utils.data import DataLoader, Dataset
from transformers import (AutoModelForTokenClassification, AutoTokenizer,
                          Trainer, TrainingArguments)


class LeaveRequestDataset(Dataset):
    """مجموعة بيانات طلبات الإجازات"""
    def __init__(self, texts, labels, tokenizer, max_length=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
        
        # تعيين قاموس التسميات
        self.label2id = {
            "O": 0,  # خارج أي كيان
            "B-NAME": 1,  # بداية اسم
            "I-NAME": 2,  # داخل اسم
            "B-ID": 3,  # بداية رقم هوية
            "I-ID": 4,  # داخل رقم هوية
            "B-EMPLOYER": 5,  # بداية جهة عمل
            "I-EMPLOYER": 6,  # داخل جهة عمل
            "B-DATE": 7,  # بداية تاريخ
            "I-DATE": 8,  # داخل تاريخ
            "B-HOSPITAL": 9,  # بداية مستشفى
            "I-HOSPITAL": 10,  # داخل مستشفى
            "B-CITY": 11,  # بداية مدينة
            "I-CITY": 12,  # داخل مدينة
            "B-NATIONALITY": 13,  # بداية جنسية
            "I-NATIONALITY": 14,  # داخل جنسية
            "B-JOB": 15,  # بداية وظيفة
            "I-JOB": 16,  # داخل وظيفة
        }
        self.id2label = {v: k for k, v in self.label2id.items()}
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        labels = self.labels[idx]
        
        # ترميز النص
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt"
        )
        
        # تحويل التسميات إلى مصفوفة بنفس طول الترميز
        label_ids = torch.ones(encoding["input_ids"].shape, dtype=torch.long) * -100
        
        # تعيين التسميات للرموز المقابلة
        for i, label in enumerate(labels):
            if i < len(encoding["input_ids"][0]) - 2:  # تجاهل رموز [CLS] و [SEP]
                label_ids[0][i + 1] = self.label2id.get(label, 0)
        
        return {
            "input_ids": encoding["input_ids"].squeeze(),
            "attention_mask": encoding["attention_mask"].squeeze(),
            "labels": label_ids.squeeze()
        }


def prepare_training_data():
    """إعداد بيانات التدريب"""
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
    
    # تسميات الكيانات لكل طلب
    # يجب أن تكون بنفس طول النص بعد التقسيم إلى رموز
    # هذا مثال مبسط، في الواقع يجب تسمية كل حرف/رمز
    sample_labels = [
        # تسميات للطلب الأول (مبسطة)
        ["O"] * 100,  # يجب تعديلها لتطابق طول النص بعد الترميز
        
        # تسميات للطلب الثاني (مبسطة)
        ["O"] * 100,  # يجب تعديلها لتطابق طول النص بعد الترميز
        
        # تسميات للطلب الثالث (مبسطة)
        ["O"] * 100  # يجب تعديلها لتطابق طول النص بعد الترميز
    ]
    
    return sample_requests, sample_labels


def train_bert_model():
    """تدريب نموذج BERT"""
    # تحميل النموذج والتوكنايزر
    model_name = "aubmindlab/bert-base-arabertv02"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # إعداد بيانات التدريب
    texts, labels = prepare_training_data()
    
    # إنشاء مجموعة البيانات
    dataset = LeaveRequestDataset(texts, labels, tokenizer)
    
    # إعداد النموذج
    model = AutoModelForTokenClassification.from_pretrained(
        model_name,
        num_labels=len(dataset.label2id),
        id2label=dataset.id2label,
        label2id=dataset.label2id
    )
    
    # إعداد معلمات التدريب
    training_args = TrainingArguments(
        output_dir="./bert_model_output",
        num_train_epochs=3,
        per_device_train_batch_size=8,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir="./bert_model_logs",
        logging_steps=10,
    )
    
    # إنشاء المدرب
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
    )
    
    # تدريب النموذج
    trainer.train()
    
    # حفظ النموذج
    model.save_pretrained("./bert_model")
    tokenizer.save_pretrained("./bert_model")
    
    return model, tokenizer


if __name__ == "__main__":
    # تدريب النموذج
    model, tokenizer = train_bert_model()
    print("تم تدريب النموذج بنجاح!")

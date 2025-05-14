"""
تدريب نموذج BERT (ArabERTv02) على بيانات ANERcorp للتعرف على الكيانات المسماة (NER)
"""
import os
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoModelForTokenClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForTokenClassification
)
from datasets import load_dataset
import evaluate
import numpy as np

# تحميل بيانات ANERcorp (نسخة معدلة لتتوافق مع Hugging Face Datasets)
dataset = load_dataset("arabic-ner/ANERcorp")

# تحميل التوكنايزر والنموذج
model_name = "aubmindlab/bert-base-arabertv02"
tokenizer = AutoTokenizer.from_pretrained(model_name)

# قاموس التسميات (يجب أن يتطابق مع تسميات ANERcorp)
label_list = [
    "O",       # خارج الكيان
    "B-PER",   # بداية اسم شخص
    "I-PER",   # داخل اسم شخص
    "B-ORG",   # بداية منظمة
    "I-ORG",   # داخل منظمة
    "B-LOC",   # بداية موقع
    "I-LOC"    # داخل موقع
]

label2id = {label: i for i, label in enumerate(label_list)}
id2label = {i: label for i, label in enumerate(label_list)}

# دالة لتوحيد ترميز النص والتسميات
def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(
        examples["tokens"],
        truncation=True,
        is_split_into_words=True,
        padding="max_length",
        max_length=128
    )

    labels = []
    for i, label in enumerate(examples["ner_tags"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids = []
        
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                label_ids.append(label[word_idx])
            else:
                label_ids.append(-100)
            previous_word_idx = word_idx

        labels.append(label_ids)

    tokenized_inputs["labels"] = labels
    return tokenized_inputs

# معالجة البيانات
tokenized_datasets = dataset.map(
    tokenize_and_align_labels,
    batched=True,
    remove_columns=dataset["train"].column_names
)

# إنشاء النموذج
model = AutoModelForTokenClassification.from_pretrained(
    model_name,
    num_labels=len(label_list),
    id2label=id2label,
    label2id=label2id
)

# إعداد معايير التدريب
training_args = TrainingArguments(
    output_dir="./anercorp_bert_output",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=100,
    save_steps=500,
    save_total_limit=2,
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    report_to="none"
)

# دالة لحساب المقاييس
seqeval = evaluate.load("seqeval")

def compute_metrics(p):
    predictions, labels = p
    predictions = np.argmax(predictions, axis=2)

    true_predictions = [
        [label_list[p] for (p, l) in zip(prediction, label) if l != -100
        for prediction, label in zip(predictions, labels)
    ]
    true_labels = [
        [label_list[l] for (p, l) in zip(prediction, label) if l != -100
        for prediction, label in zip(predictions, labels)
    ]

    results = seqeval.compute(
        predictions=true_predictions,
        references=true_labels,
        scheme="IOB2"
    )
    
    return {
        "precision": results["overall_precision"],
        "recall": results["overall_recall"],
        "f1": results["overall_f1"],
        "accuracy": results["overall_accuracy"]
    }

# إنشاء المدرب
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    tokenizer=tokenizer,
    data_collator=DataCollatorForTokenClassification(tokenizer),
    compute_metrics=compute_metrics
)

# التدريب
print("بدء التدريب...")
trainer.train()

# حفظ النموذج
model.save_pretrained("./anercorp_bert_model2")
tokenizer.save_pretrained("./anercorp_bert_model2")

print("تم التدريب بنجاح وحفظ النموذج!")
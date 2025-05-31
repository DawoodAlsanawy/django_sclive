"""
أمر إدارة Django لتدريب نموذج BERT
"""
from django.core.management.base import BaseCommand

from core.bert_trainer import train_bert_model


class Command(BaseCommand):
    help = 'تدريب نموذج BERT لاستخراج المعلومات من طلبات الإجازات'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('بدء تدريب نموذج BERT...'))
        
        try:
            model, tokenizer = train_bert_model()
            self.stdout.write(self.style.SUCCESS('تم تدريب نموذج BERT بنجاح!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'حدث خطأ أثناء تدريب النموذج: {e}'))

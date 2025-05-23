"""
أمر تهيئة الإعدادات الافتراضية
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from core.services.settings_service import DefaultSettings


class Command(BaseCommand):
    help = 'تهيئة الإعدادات الافتراضية للنظام'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='إجبار إعادة تهيئة الإعدادات حتى لو كانت موجودة',
        )

    def handle(self, *args, **options):
        force = options['force']

        self.stdout.write(self.style.SUCCESS('بدء تهيئة الإعدادات الافتراضية...'))

        try:
            with transaction.atomic():
                # تهيئة الإعدادات الافتراضية
                DefaultSettings.initialize_default_settings()

            self.stdout.write(self.style.SUCCESS('تم تهيئة الإعدادات الافتراضية بنجاح!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'حدث خطأ أثناء تهيئة الإعدادات: {str(e)}'))

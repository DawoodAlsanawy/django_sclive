"""
أمر تحديث الإعدادات
"""
from django.core.management.base import BaseCommand

from core.services.settings_applier import SettingsApplier
from core.services.settings_service import DefaultSettings


class Command(BaseCommand):
    help = 'تحديث وتطبيق إعدادات النظام'

    def add_arguments(self, parser):
        parser.add_argument(
            '--refresh',
            action='store_true',
            help='تحديث جميع الإعدادات من الكاش',
        )
        parser.add_argument(
            '--init-defaults',
            action='store_true',
            help='تهيئة الإعدادات الافتراضية',
        )

    def handle(self, *args, **options):
        refresh = options['refresh']
        init_defaults = options['init_defaults']

        self.stdout.write(self.style.SUCCESS('بدء تحديث إعدادات النظام...'))

        try:
            if init_defaults:
                self.stdout.write('تهيئة الإعدادات الافتراضية...')
                DefaultSettings.initialize_default_settings()
                self.stdout.write(self.style.SUCCESS('تم تهيئة الإعدادات الافتراضية بنجاح'))

            if refresh:
                self.stdout.write('تحديث الإعدادات من الكاش...')
                results = SettingsApplier.refresh_all_settings()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'تم تطبيق {results["applied"]} مجموعة إعدادات بنجاح'
                    )
                )
                
                if results['failed'] > 0:
                    self.stdout.write(
                        self.style.ERROR(
                            f'فشل في تطبيق {results["failed"]} مجموعة إعدادات'
                        )
                    )
                    
                    for detail in results['details']:
                        if detail['status'] == 'failed':
                            self.stdout.write(
                                self.style.ERROR(
                                    f'  - {detail["category"]}: {detail.get("error", "خطأ غير معروف")}'
                                )
                            )
            else:
                self.stdout.write('تطبيق الإعدادات...')
                results = SettingsApplier.apply_all_settings()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'تم تطبيق {results["applied"]} مجموعة إعدادات بنجاح'
                    )
                )

            self.stdout.write(self.style.SUCCESS('انتهى تحديث إعدادات النظام'))

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'حدث خطأ أثناء تحديث الإعدادات: {str(e)}')
            )

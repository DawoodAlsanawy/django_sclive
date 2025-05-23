"""
أمر تشغيل النسخ الاحتياطي المجدولة
"""
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import BackupSchedule
from core.services.scheduler_service import SchedulerService


class Command(BaseCommand):
    help = 'تشغيل النسخ الاحتياطي المجدولة'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='عرض النسخ المجدولة دون تنفيذها',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        self.stdout.write(self.style.SUCCESS('بدء تشغيل النسخ الاحتياطي المجدولة...'))

        try:
            scheduler_service = SchedulerService()

            if dry_run:
                # عرض الجدولات المستحقة دون تنفيذها
                now = timezone.now()
                due_schedules = BackupSchedule.objects.filter(
                    is_active=True,
                    next_run__lte=now
                )

                if not due_schedules.exists():
                    self.stdout.write(self.style.WARNING('لا توجد نسخ احتياطية مجدولة للتنفيذ الآن'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'تم العثور على {due_schedules.count()} جدولة للتنفيذ:'))
                    for schedule in due_schedules:
                        self.stdout.write(f'  - {schedule.name} ({schedule.get_backup_type_display()})')
            else:
                # تنفيذ النسخ الاحتياطي المجدولة
                results = scheduler_service.run_scheduled_backups()

                self.stdout.write(self.style.SUCCESS(f'تم تنفيذ {results["executed"]} نسخة احتياطية بنجاح'))

                if results['failed'] > 0:
                    self.stdout.write(self.style.ERROR(f'فشل في تنفيذ {results["failed"]} نسخة احتياطية'))

                if results['skipped'] > 0:
                    self.stdout.write(self.style.WARNING(f'تم تخطي {results["skipped"]} نسخة احتياطية'))

                # عرض التفاصيل
                for detail in results['details']:
                    if detail['status'] == 'success':
                        self.stdout.write(self.style.SUCCESS(f'✓ {detail["schedule_name"]}: {detail["backup_name"]}'))
                    else:
                        self.stdout.write(self.style.ERROR(f'✗ {detail["schedule_name"]}: {detail.get("error", "خطأ غير معروف")}'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'حدث خطأ أثناء تشغيل النسخ الاحتياطي المجدولة: {str(e)}'))

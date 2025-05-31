"""
خدمة جدولة المهام
"""
import logging
from datetime import datetime, timedelta
from typing import Optional

from django.utils import timezone

from core.models import BackupSchedule
from core.services.backup_service import BackupService

logger = logging.getLogger(__name__)


class SchedulerService:
    """خدمة جدولة المهام التلقائية"""
    
    def __init__(self):
        self.backup_service = BackupService()
    
    def run_scheduled_backups(self) -> dict:
        """تشغيل النسخ الاحتياطي المجدولة"""
        results = {
            'total_schedules': 0,
            'executed': 0,
            'failed': 0,
            'skipped': 0,
            'details': []
        }
        
        now = timezone.now()
        
        # البحث عن الجدولات المستحقة للتنفيذ
        due_schedules = BackupSchedule.objects.filter(
            is_active=True,
            next_run__lte=now
        )
        
        results['total_schedules'] = due_schedules.count()
        
        for schedule in due_schedules:
            try:
                result = self._execute_scheduled_backup(schedule, now)
                results['details'].append(result)
                
                if result['status'] == 'success':
                    results['executed'] += 1
                elif result['status'] == 'failed':
                    results['failed'] += 1
                else:
                    results['skipped'] += 1
                    
            except Exception as e:
                logger.error(f"خطأ في تنفيذ الجدولة {schedule.name}: {str(e)}")
                results['failed'] += 1
                results['details'].append({
                    'schedule_name': schedule.name,
                    'status': 'failed',
                    'error': str(e)
                })
        
        return results
    
    def _execute_scheduled_backup(self, schedule: BackupSchedule, current_time: datetime) -> dict:
        """تنفيذ نسخة احتياطية مجدولة"""
        try:
            # إنشاء اسم النسخة الاحتياطية
            backup_name = f"{schedule.name}_{current_time.strftime('%Y%m%d_%H%M%S')}"
            
            # تنفيذ النسخ الاحتياطي
            backup_record = self.backup_service.create_backup(
                backup_type=schedule.backup_type,
                name=backup_name,
                description=f"نسخة احتياطية مجدولة: {schedule.name}",
                created_by=schedule.created_by
            )
            
            # تحديث معلومات الجدولة
            schedule.last_run = current_time
            schedule.next_run = self._calculate_next_run(schedule, current_time)
            schedule.save()
            
            # تنظيف النسخ القديمة
            self._cleanup_old_backups(schedule)
            
            return {
                'schedule_name': schedule.name,
                'backup_name': backup_record.name,
                'status': 'success',
                'next_run': schedule.next_run
            }
            
        except Exception as e:
            logger.error(f"فشل في تنفيذ النسخة الاحتياطية المجدولة {schedule.name}: {str(e)}")
            return {
                'schedule_name': schedule.name,
                'status': 'failed',
                'error': str(e)
            }
    
    def _calculate_next_run(self, schedule: BackupSchedule, current_time: datetime) -> datetime:
        """حساب موعد التشغيل التالي"""
        if schedule.frequency == 'daily':
            next_run = current_time.replace(
                hour=schedule.time.hour,
                minute=schedule.time.minute,
                second=0,
                microsecond=0
            ) + timedelta(days=1)
        
        elif schedule.frequency == 'weekly':
            days_ahead = schedule.day_of_week - current_time.weekday()
            if days_ahead <= 0:  # الهدف في هذا الأسبوع أو مضى
                days_ahead += 7
            
            next_run = current_time.replace(
                hour=schedule.time.hour,
                minute=schedule.time.minute,
                second=0,
                microsecond=0
            ) + timedelta(days=days_ahead)
        
        elif schedule.frequency == 'monthly':
            # الشهر التالي
            if current_time.month == 12:
                next_month = current_time.replace(year=current_time.year + 1, month=1)
            else:
                next_month = current_time.replace(month=current_time.month + 1)
            
            # التأكد من أن اليوم المحدد موجود في الشهر
            try:
                next_run = next_month.replace(
                    day=schedule.day_of_month,
                    hour=schedule.time.hour,
                    minute=schedule.time.minute,
                    second=0,
                    microsecond=0
                )
            except ValueError:
                # إذا كان اليوم غير موجود (مثل 31 في فبراير)، استخدم آخر يوم في الشهر
                import calendar
                last_day = calendar.monthrange(next_month.year, next_month.month)[1]
                next_run = next_month.replace(
                    day=min(schedule.day_of_month, last_day),
                    hour=schedule.time.hour,
                    minute=schedule.time.minute,
                    second=0,
                    microsecond=0
                )
        
        else:  # custom
            # للجدولة المخصصة، نضيف يوم واحد كافتراضي
            next_run = current_time + timedelta(days=1)
        
        return next_run
    
    def _cleanup_old_backups(self, schedule: BackupSchedule):
        """حذف النسخ الاحتياطي القديمة"""
        try:
            from core.models import BackupRecord
            import os
            
            # الحصول على النسخ الاحتياطي المرتبطة بهذه الجدولة
            old_backups = BackupRecord.objects.filter(
                backup_type=schedule.backup_type,
                is_scheduled=True,
                status='completed',
                name__startswith=schedule.name
            ).order_by('-created_at')[schedule.keep_count:]
            
            deleted_count = 0
            for backup in old_backups:
                try:
                    if backup.file_path and os.path.exists(backup.file_path):
                        os.remove(backup.file_path)
                    backup.delete()
                    deleted_count += 1
                except Exception as e:
                    logger.warning(f"فشل في حذف النسخة الاحتياطية {backup.name}: {str(e)}")
            
            if deleted_count > 0:
                logger.info(f"تم حذف {deleted_count} نسخة احتياطية قديمة للجدولة {schedule.name}")
                
        except Exception as e:
            logger.error(f"فشل في تنظيف النسخ القديمة للجدولة {schedule.name}: {str(e)}")
    
    def update_schedule_next_run(self, schedule_id: int) -> Optional[datetime]:
        """تحديث موعد التشغيل التالي لجدولة معينة"""
        try:
            schedule = BackupSchedule.objects.get(id=schedule_id, is_active=True)
            current_time = timezone.now()
            
            schedule.next_run = self._calculate_next_run(schedule, current_time)
            schedule.save()
            
            return schedule.next_run
            
        except BackupSchedule.DoesNotExist:
            logger.error(f"الجدولة {schedule_id} غير موجودة أو غير نشطة")
            return None
        except Exception as e:
            logger.error(f"فشل في تحديث موعد التشغيل التالي للجدولة {schedule_id}: {str(e)}")
            return None
    
    def get_next_scheduled_backups(self, hours_ahead: int = 24) -> list:
        """الحصول على النسخ الاحتياطي المجدولة في الساعات القادمة"""
        now = timezone.now()
        future_time = now + timedelta(hours=hours_ahead)
        
        upcoming_schedules = BackupSchedule.objects.filter(
            is_active=True,
            next_run__gte=now,
            next_run__lte=future_time
        ).order_by('next_run')
        
        return [
            {
                'name': schedule.name,
                'backup_type': schedule.get_backup_type_display(),
                'next_run': schedule.next_run,
                'frequency': schedule.get_frequency_display()
            }
            for schedule in upcoming_schedules
        ]
    
    def validate_schedule_settings(self, schedule_data: dict) -> dict:
        """التحقق من صحة إعدادات الجدولة"""
        errors = {}
        
        frequency = schedule_data.get('frequency')
        day_of_week = schedule_data.get('day_of_week')
        day_of_month = schedule_data.get('day_of_month')
        
        if frequency == 'weekly' and day_of_week is None:
            errors['day_of_week'] = 'يجب تحديد يوم الأسبوع للنسخ الأسبوعي'
        
        if frequency == 'monthly' and day_of_month is None:
            errors['day_of_month'] = 'يجب تحديد يوم الشهر للنسخ الشهري'
        
        if day_of_week is not None and (day_of_week < 0 or day_of_week > 6):
            errors['day_of_week'] = 'يوم الأسبوع يجب أن يكون بين 0 و 6'
        
        if day_of_month is not None and (day_of_month < 1 or day_of_month > 31):
            errors['day_of_month'] = 'يوم الشهر يجب أن يكون بين 1 و 31'
        
        keep_count = schedule_data.get('keep_count', 0)
        if keep_count < 1:
            errors['keep_count'] = 'عدد النسخ المحفوظة يجب أن يكون أكبر من صفر'
        
        return errors

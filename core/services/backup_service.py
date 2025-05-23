"""
خدمة النسخ الاحتياطي والاستعادة
"""
import json
import os
import shutil
import zipfile
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management import call_command
from django.db import transaction
from django.utils import timezone

from core.models import BackupRecord, BackupSchedule, SystemSettings
from core.services.settings_service import SettingsService


class BackupService:
    """خدمة النسخ الاحتياطي"""

    def __init__(self):
        self.backup_dir = os.path.join(settings.MEDIA_ROOT, 'backups')
        self.ensure_backup_directory()

    def ensure_backup_directory(self):
        """التأكد من وجود مجلد النسخ الاحتياطي"""
        if not os.path.exists(self.backup_dir):
            os.makedirs(self.backup_dir, exist_ok=True)

    def create_backup(self, backup_type: str, name: str, description: str = '',
                     created_by=None) -> BackupRecord:
        """إنشاء نسخة احتياطية"""
        # إنشاء سجل النسخة الاحتياطية
        backup_record = BackupRecord.objects.create(
            name=name,
            backup_type=backup_type,
            description=description,
            created_by=created_by,
            status='pending'
        )

        try:
            # بدء عملية النسخ الاحتياطي
            backup_record.status = 'running'
            backup_record.started_at = timezone.now()
            backup_record.save()

            # تنفيذ النسخ الاحتياطي حسب النوع
            file_path = self._execute_backup(backup_record)

            # تحديث معلومات النسخة الاحتياطية
            backup_record.file_path = file_path
            backup_record.file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
            backup_record.status = 'completed'
            backup_record.completed_at = timezone.now()
            backup_record.save()

        except Exception as e:
            backup_record.status = 'failed'
            backup_record.error_message = str(e)
            backup_record.completed_at = timezone.now()
            backup_record.save()
            raise

        return backup_record

    def _execute_backup(self, backup_record: BackupRecord) -> str:
        """تنفيذ النسخ الاحتياطي"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"{backup_record.backup_type}_{timestamp}"

        if backup_record.backup_type == 'full':
            return self._create_full_backup(backup_name)
        elif backup_record.backup_type == 'data':
            return self._create_data_backup(backup_name)
        elif backup_record.backup_type == 'files':
            return self._create_files_backup(backup_name)
        elif backup_record.backup_type == 'settings':
            return self._create_settings_backup(backup_name)
        else:
            raise ValueError(f"نوع النسخة الاحتياطية غير مدعوم: {backup_record.backup_type}")

    def _create_full_backup(self, backup_name: str) -> str:
        """إنشاء نسخة احتياطية كاملة"""
        backup_path = os.path.join(self.backup_dir, f"{backup_name}.zip")

        with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # نسخ قاعدة البيانات
            db_file = self._create_database_dump(backup_name)
            zipf.write(db_file, 'database.json')

            # نسخ الملفات المرفوعة
            media_root = settings.MEDIA_ROOT
            if os.path.exists(media_root):
                for root, dirs, files in os.walk(media_root):
                    # تجاهل مجلد النسخ الاحتياطي نفسه
                    if 'backups' in root:
                        continue
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, media_root)
                        zipf.write(file_path, f"media/{arcname}")

            # نسخ الإعدادات
            settings_file = self._create_settings_dump(backup_name)
            zipf.write(settings_file, 'settings.json')

        # حذف الملفات المؤقتة
        self._cleanup_temp_files([db_file, settings_file])

        return backup_path

    def _create_data_backup(self, backup_name: str) -> str:
        """إنشاء نسخة احتياطية للبيانات فقط"""
        db_file = self._create_database_dump(backup_name)
        backup_path = os.path.join(self.backup_dir, f"{backup_name}.json")
        shutil.move(db_file, backup_path)
        return backup_path

    def _create_files_backup(self, backup_name: str) -> str:
        """إنشاء نسخة احتياطية للملفات فقط"""
        backup_path = os.path.join(self.backup_dir, f"{backup_name}.zip")

        with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            media_root = settings.MEDIA_ROOT
            if os.path.exists(media_root):
                for root, dirs, files in os.walk(media_root):
                    if 'backups' in root:
                        continue
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, media_root)
                        zipf.write(file_path, arcname)

        return backup_path

    def _create_settings_backup(self, backup_name: str) -> str:
        """إنشاء نسخة احتياطية للإعدادات فقط"""
        settings_file = self._create_settings_dump(backup_name)
        backup_path = os.path.join(self.backup_dir, f"{backup_name}.json")
        shutil.move(settings_file, backup_path)
        return backup_path

    def _create_database_dump(self, backup_name: str) -> str:
        """إنشاء نسخة من قاعدة البيانات"""
        dump_file = os.path.join(self.backup_dir, f"temp_{backup_name}_db.json")

        try:
            with open(dump_file, 'w', encoding='utf-8') as f:
                call_command('dumpdata',
                            '--natural-foreign',
                            '--natural-primary',
                            '--indent=2',
                            stdout=f)
        except Exception as e:
            # في حالة فشل dumpdata، ننشئ ملف JSON بسيط
            import json

            from django.apps import apps

            data = []
            for model in apps.get_models():
                if model._meta.app_label != 'contenttypes':  # تجاهل contenttypes
                    try:
                        for obj in model.objects.all():
                            data.append({
                                'model': f"{model._meta.app_label}.{model._meta.model_name}",
                                'pk': obj.pk,
                                'fields': self._serialize_model_instance(obj)
                            })
                    except Exception:
                        continue

            with open(dump_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)

        return dump_file

    def _serialize_model_instance(self, obj):
        """تحويل كائن النموذج إلى قاموس"""
        fields = {}
        for field in obj._meta.fields:
            try:
                value = getattr(obj, field.name)
                if hasattr(value, 'isoformat'):  # DateTime fields
                    value = value.isoformat()
                elif hasattr(value, '__str__'):
                    value = str(value)
                fields[field.name] = value
            except Exception:
                fields[field.name] = None
        return fields

    def _create_settings_dump(self, backup_name: str) -> str:
        """إنشاء نسخة من الإعدادات"""
        dump_file = os.path.join(self.backup_dir, f"temp_{backup_name}_settings.json")

        settings_data = {
            'system_settings': list(SystemSettings.objects.values()),
            'backup_timestamp': timezone.now().isoformat(),
            'django_settings': {
                'SECRET_KEY': settings.SECRET_KEY,
                'DEBUG': settings.DEBUG,
                'ALLOWED_HOSTS': settings.ALLOWED_HOSTS,
                'TIME_ZONE': settings.TIME_ZONE,
                'LANGUAGE_CODE': settings.LANGUAGE_CODE,
            }
        }

        with open(dump_file, 'w', encoding='utf-8') as f:
            json.dump(settings_data, f, ensure_ascii=False, indent=2)

        return dump_file

    def _cleanup_temp_files(self, files: List[str]):
        """حذف الملفات المؤقتة"""
        for file_path in files:
            if os.path.exists(file_path):
                os.remove(file_path)

    def restore_backup(self, backup_record: BackupRecord, restore_options: Dict = None) -> bool:
        """استعادة نسخة احتياطية"""
        if not os.path.exists(backup_record.file_path):
            raise FileNotFoundError("ملف النسخة الاحتياطية غير موجود")

        restore_options = restore_options or {}

        try:
            if backup_record.backup_type == 'full':
                return self._restore_full_backup(backup_record.file_path, restore_options)
            elif backup_record.backup_type == 'data':
                return self._restore_data_backup(backup_record.file_path, restore_options)
            elif backup_record.backup_type == 'files':
                return self._restore_files_backup(backup_record.file_path, restore_options)
            elif backup_record.backup_type == 'settings':
                return self._restore_settings_backup(backup_record.file_path, restore_options)
            else:
                raise ValueError(f"نوع النسخة الاحتياطية غير مدعوم: {backup_record.backup_type}")

        except Exception as e:
            raise Exception(f"فشل في استعادة النسخة الاحتياطية: {str(e)}")

    def _restore_full_backup(self, backup_path: str, options: Dict) -> bool:
        """استعادة نسخة احتياطية كاملة"""
        temp_dir = os.path.join(self.backup_dir, 'temp_restore')

        try:
            # استخراج الملفات
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(temp_dir)

            # استعادة قاعدة البيانات
            if options.get('restore_data', True):
                db_file = os.path.join(temp_dir, 'database.json')
                if os.path.exists(db_file):
                    self._restore_database(db_file)

            # استعادة الملفات
            if options.get('restore_files', True):
                media_dir = os.path.join(temp_dir, 'media')
                if os.path.exists(media_dir):
                    self._restore_media_files(media_dir)

            # استعادة الإعدادات
            if options.get('restore_settings', True):
                settings_file = os.path.join(temp_dir, 'settings.json')
                if os.path.exists(settings_file):
                    self._restore_settings(settings_file)

            return True

        finally:
            # تنظيف المجلد المؤقت
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

    def _restore_data_backup(self, backup_path: str, options: Dict) -> bool:
        """استعادة نسخة احتياطية للبيانات"""
        return self._restore_database(backup_path)

    def _restore_files_backup(self, backup_path: str, options: Dict) -> bool:
        """استعادة نسخة احتياطية للملفات"""
        temp_dir = os.path.join(self.backup_dir, 'temp_restore')

        try:
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(temp_dir)

            return self._restore_media_files(temp_dir)

        finally:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

    def _restore_settings_backup(self, backup_path: str, options: Dict) -> bool:
        """استعادة نسخة احتياطية للإعدادات"""
        return self._restore_settings(backup_path)

    def _restore_database(self, db_file: str) -> bool:
        """استعادة قاعدة البيانات"""
        try:
            # حذف البيانات الحالية (اختياري)
            call_command('flush', '--noinput')

            # تحميل البيانات الجديدة
            call_command('loaddata', db_file)

            return True
        except Exception as e:
            raise Exception(f"فشل في استعادة قاعدة البيانات: {str(e)}")

    def _restore_media_files(self, source_dir: str) -> bool:
        """استعادة الملفات المرفوعة"""
        try:
            media_root = settings.MEDIA_ROOT

            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    source_file = os.path.join(root, file)
                    relative_path = os.path.relpath(source_file, source_dir)
                    dest_file = os.path.join(media_root, relative_path)

                    # إنشاء المجلدات إذا لم تكن موجودة
                    os.makedirs(os.path.dirname(dest_file), exist_ok=True)

                    # نسخ الملف
                    shutil.copy2(source_file, dest_file)

            return True
        except Exception as e:
            raise Exception(f"فشل في استعادة الملفات: {str(e)}")

    def _restore_settings(self, settings_file: str) -> bool:
        """استعادة الإعدادات"""
        try:
            with open(settings_file, 'r', encoding='utf-8') as f:
                settings_data = json.load(f)

            # استعادة إعدادات النظام
            if 'system_settings' in settings_data:
                with transaction.atomic():
                    # حذف الإعدادات الحالية
                    SystemSettings.objects.all().delete()

                    # إنشاء الإعدادات الجديدة
                    for setting_data in settings_data['system_settings']:
                        SystemSettings.objects.create(**setting_data)

            # مسح الكاش
            SettingsService.clear_cache()

            return True
        except Exception as e:
            raise Exception(f"فشل في استعادة الإعدادات: {str(e)}")

    def delete_old_backups(self, keep_count: int = 7):
        """حذف النسخ الاحتياطي القديمة"""
        old_backups = BackupRecord.objects.filter(
            status='completed'
        ).order_by('-created_at')[keep_count:]

        for backup in old_backups:
            if backup.file_path and os.path.exists(backup.file_path):
                os.remove(backup.file_path)
            backup.delete()

    def get_backup_info(self, backup_record: BackupRecord) -> Dict:
        """الحصول على معلومات النسخة الاحتياطية"""
        info = {
            'name': backup_record.name,
            'type': backup_record.get_backup_type_display(),
            'status': backup_record.get_status_display(),
            'size': backup_record.file_size_mb,
            'created_at': backup_record.created_at,
            'duration': backup_record.duration,
            'file_exists': os.path.exists(backup_record.file_path) if backup_record.file_path else False
        }

        # معلومات إضافية للنسخ المكتملة
        if backup_record.status == 'completed' and backup_record.file_path:
            if backup_record.backup_type == 'full' and backup_record.file_path.endswith('.zip'):
                info['contents'] = self._get_zip_contents(backup_record.file_path)

        return info

    def _get_zip_contents(self, zip_path: str) -> List[str]:
        """الحصول على محتويات ملف ZIP"""
        try:
            with zipfile.ZipFile(zip_path, 'r') as zipf:
                return zipf.namelist()
        except Exception:
            return []

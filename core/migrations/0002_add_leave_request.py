from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='LeaveRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('request_text', models.TextField(verbose_name='نص الطلب')),
                ('processed', models.BooleanField(default=False, verbose_name='تمت المعالجة')),
                ('leave_type', models.CharField(blank=True, choices=[('sick_leave', 'إجازة مرضية'), ('companion_leave', 'إجازة مرافق')], max_length=20, null=True, verbose_name='نوع الإجازة')),
                ('leave_id', models.CharField(blank=True, max_length=20, null=True, verbose_name='رقم الإجازة')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='تاريخ الإنشاء')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')),
            ],
            options={
                'verbose_name': 'طلب إجازة',
                'verbose_name_plural': 'طلبات الإجازات',
            },
        ),
    ]

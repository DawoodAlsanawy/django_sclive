from django.db import migrations

def add_default_leave_prices(apps, schema_editor):
    """إضافة أسعار افتراضية للإجازات"""
    LeavePrice = apps.get_model('core', 'LeavePrice')
    
    # التحقق من وجود أسعار سابقة
    if LeavePrice.objects.filter(client__isnull=True).exists():
        return
    
    # إضافة أسعار الإجازات المرضية العامة
    sick_leave_prices = [
        {'leave_type': 'sick_leave', 'duration_days': 1, 'price': 100},
        {'leave_type': 'sick_leave', 'duration_days': 3, 'price': 250},
        {'leave_type': 'sick_leave', 'duration_days': 7, 'price': 500},
        {'leave_type': 'sick_leave', 'duration_days': 14, 'price': 900},
        {'leave_type': 'sick_leave', 'duration_days': 30, 'price': 1800},
    ]
    
    for price_data in sick_leave_prices:
        LeavePrice.objects.create(
            leave_type=price_data['leave_type'],
            duration_days=price_data['duration_days'],
            price=price_data['price'],
            client=None,
            is_active=True
        )
    
    # إضافة أسعار إجازات المرافقين العامة
    companion_leave_prices = [
        {'leave_type': 'companion_leave', 'duration_days': 1, 'price': 150},
        {'leave_type': 'companion_leave', 'duration_days': 3, 'price': 400},
        {'leave_type': 'companion_leave', 'duration_days': 7, 'price': 800},
        {'leave_type': 'companion_leave', 'duration_days': 14, 'price': 1500},
        {'leave_type': 'companion_leave', 'duration_days': 30, 'price': 2800},
    ]
    
    for price_data in companion_leave_prices:
        LeavePrice.objects.create(
            leave_type=price_data['leave_type'],
            duration_days=price_data['duration_days'],
            price=price_data['price'],
            client=None,
            is_active=True
        )

def remove_default_leave_prices(apps, schema_editor):
    """إزالة أسعار الإجازات الافتراضية"""
    LeavePrice = apps.get_model('core', 'LeavePrice')
    LeavePrice.objects.filter(client__isnull=True).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_alter_leaveprice_unique_together_leaveprice_client_and_more'),
    ]

    operations = [
        migrations.RunPython(add_default_leave_prices, remove_default_leave_prices),
    ]

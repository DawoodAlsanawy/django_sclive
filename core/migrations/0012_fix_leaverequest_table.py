# Generated manually to fix migration issues

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_merge_0002_add_leave_request_0010_leaverequest'),
    ]

    operations = [
        migrations.RunSQL(
            # SQL to drop the table if it exists
            "DROP TABLE IF EXISTS core_leaverequest;",
            # Reverse SQL (do nothing)
            "SELECT 1;"
        ),
    ]

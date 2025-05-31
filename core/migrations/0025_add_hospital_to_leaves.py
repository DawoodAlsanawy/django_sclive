# Generated manually to add hospital field to leaves

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0024_companionleave_duration_days2_and_more'),
    ]

    operations = [
        # Add hospital field to SickLeave
        migrations.AddField(
            model_name='sickleave',
            name='hospital',
            field=models.ForeignKey(
                default=1,  # Will be set to first hospital
                on_delete=django.db.models.deletion.CASCADE,
                related_name='sick_leaves',
                to='core.hospital',
                verbose_name='المستشفى'
            ),
            preserve_default=False,
        ),
        # Add hospital field to CompanionLeave
        migrations.AddField(
            model_name='companionleave',
            name='hospital',
            field=models.ForeignKey(
                default=1,  # Will be set to first hospital
                on_delete=django.db.models.deletion.CASCADE,
                related_name='companion_leaves',
                to='core.hospital',
                verbose_name='المستشفى'
            ),
            preserve_default=False,
        ),
        # Make doctor field optional in SickLeave
        migrations.AlterField(
            model_name='sickleave',
            name='doctor',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='sick_leaves',
                to='core.doctor',
                verbose_name='الطبيب'
            ),
        ),
        # Make doctor field optional in CompanionLeave
        migrations.AlterField(
            model_name='companionleave',
            name='doctor',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='companion_leaves',
                to='core.doctor',
                verbose_name='الطبيب'
            ),
        ),
    ]

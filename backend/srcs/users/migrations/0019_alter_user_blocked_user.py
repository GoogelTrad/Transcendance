# Generated by Django 5.1.3 on 2025-02-26 20:25

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_delete_blockeduser'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='blocked_user',
            field=models.ManyToManyField(blank=True, null=True, related_name='blocked_by', to=settings.AUTH_USER_MODEL),
        ),
    ]

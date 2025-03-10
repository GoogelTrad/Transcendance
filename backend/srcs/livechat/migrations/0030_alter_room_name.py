# Generated by Django 5.1.3 on 2025-03-10 02:41

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('livechat', '0029_alter_room_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='name',
            field=models.CharField(max_length=15, unique=True, validators=[django.core.validators.RegexValidator(regex='^[0-9a-zA-Z]+$')]),
        ),
    ]

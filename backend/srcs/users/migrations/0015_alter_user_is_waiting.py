# Generated by Django 5.1.3 on 2025-02-11 16:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_alter_user_is_waiting'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='is_waiting',
            field=models.BooleanField(default=False),
        ),
    ]

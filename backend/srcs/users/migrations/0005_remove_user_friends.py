# Generated by Django 5.1.3 on 2024-11-29 15:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_user_friends'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='friends',
        ),
    ]

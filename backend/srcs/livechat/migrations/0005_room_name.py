# Generated by Django 5.1.3 on 2024-12-13 13:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('livechat', '0004_alter_room_password'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='name',
            field=models.CharField(default='default_room', max_length=255),
        ),
    ]

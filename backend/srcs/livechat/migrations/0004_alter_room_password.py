# Generated by Django 5.1.3 on 2024-12-12 17:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('livechat', '0003_alter_message_room_room_delete_private'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='password',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]

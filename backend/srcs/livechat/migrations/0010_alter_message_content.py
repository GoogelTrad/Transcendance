# Generated by Django 5.1.3 on 2025-02-05 14:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('livechat', '0009_remove_message_username_message_user_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='content',
            field=models.TextField(max_length=300),
        ),
    ]

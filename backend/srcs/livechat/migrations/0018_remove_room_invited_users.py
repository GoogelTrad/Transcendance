# Generated by Django 5.1.3 on 2025-02-18 01:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('livechat', '0017_room_invitation_required_room_invited_users_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='invited_users',
        ),
    ]

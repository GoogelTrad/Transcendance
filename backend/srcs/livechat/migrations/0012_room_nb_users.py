# Generated by Django 5.1.3 on 2025-02-12 13:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('livechat', '0011_room_limit'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='nb_users',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]

# Generated by Django 5.1.3 on 2024-12-13 14:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('livechat', '0007_alter_room_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='name',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]

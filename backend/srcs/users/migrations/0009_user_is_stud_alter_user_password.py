# Generated by Django 5.1.3 on 2024-12-18 13:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_user_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_stud',
            field=models.BooleanField(default=False, max_length=255),
        ),
        migrations.AlterField(
            model_name='user',
            name='password',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]

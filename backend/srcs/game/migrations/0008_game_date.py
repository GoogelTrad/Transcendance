# Generated by Django 5.1.3 on 2025-02-17 16:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0007_game_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='date',
            field=models.DateField(auto_now=True),
        ),
    ]

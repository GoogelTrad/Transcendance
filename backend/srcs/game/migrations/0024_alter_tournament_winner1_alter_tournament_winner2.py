# Generated by Django 5.1.3 on 2025-03-03 20:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0023_game_tournamentcode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='winner1',
            field=models.CharField(default=None, max_length=255),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='winner2',
            field=models.CharField(default=None, max_length=255),
        ),
    ]

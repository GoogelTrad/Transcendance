# Generated by Django 5.1.3 on 2025-02-07 13:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0005_remove_game_time_game_timeminutes_game_timeseconds'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='timeMinutes',
            field=models.IntegerField(default=3),
        ),
        migrations.AlterField(
            model_name='game',
            name='timeSeconds',
            field=models.IntegerField(default=0),
        ),
    ]

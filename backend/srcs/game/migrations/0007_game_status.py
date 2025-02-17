# Generated by Django 5.1.3 on 2025-02-11 14:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0006_alter_game_timeminutes_alter_game_timeseconds'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='status',
            field=models.CharField(choices=[('waiting', 'Waiting for Players'), ('started', 'Game Started'), ('finished', 'Game Finished')], default='waiting', max_length=10),
        ),
    ]

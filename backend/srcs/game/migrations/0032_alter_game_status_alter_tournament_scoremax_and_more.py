# Generated by Django 5.1.3 on 2025-03-06 13:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0031_alter_tournament_tie'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='status',
            field=models.CharField(choices=[('waiting', 'Waiting for Players'), ('started', 'Game Started'), ('finished', 'Game Finished'), ('ready', 'Ready waiting to start'), ('aborted', 'Ready waiting to start')], default='waiting', max_length=10),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='scoreMax',
            field=models.IntegerField(default=11),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='size',
            field=models.IntegerField(default=2),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='timeMaxMinutes',
            field=models.IntegerField(default=3),
        ),
    ]

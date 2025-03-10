# Generated by Django 5.1.3 on 2025-03-10 13:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0044_alter_tournament_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='status',
            field=models.CharField(choices=[('waiting', 'Waiting for Players'), ('started', 'Tournament Started'), ('finished', 'Tournament Finished'), ('ready', 'Ready waiting to start'), ('aborted', 'Tournament is aborted'), ('in_Game', 'Games are started')], default='waiting', max_length=10),
        ),
    ]

# Generated by Django 5.1.3 on 2025-03-03 18:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0022_game_scoremax'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='tournamentCode',
            field=models.IntegerField(default=0),
        ),
    ]

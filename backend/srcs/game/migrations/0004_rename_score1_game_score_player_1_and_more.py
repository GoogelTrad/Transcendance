# Generated by Django 5.1.3 on 2025-02-04 15:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_rename_score_game_score1_game_score2'),
    ]

    operations = [
        migrations.RenameField(
            model_name='game',
            old_name='score1',
            new_name='score_player_1',
        ),
        migrations.RenameField(
            model_name='game',
            old_name='score2',
            new_name='score_player_2',
        ),
    ]

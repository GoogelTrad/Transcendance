# Generated by Django 5.1.3 on 2025-03-09 18:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0042_alter_game_player1_alter_game_player2'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='player1',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='game',
            name='player2',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]

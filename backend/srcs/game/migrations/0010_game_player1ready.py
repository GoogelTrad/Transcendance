# Generated by Django 5.1.3 on 2025-02-20 16:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0009_alter_game_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='player1Ready',
            field=models.BooleanField(default=False),
        ),
    ]

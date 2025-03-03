# Generated by Django 5.1.3 on 2025-02-25 17:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0015_tournament'),
        ('users', '0016_merge_0014_user_ip_user_0015_alter_user_is_waiting'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='tournament',
            field=models.ManyToManyField(blank=True, related_name='players', to='game.tournament'),
        ),
    ]

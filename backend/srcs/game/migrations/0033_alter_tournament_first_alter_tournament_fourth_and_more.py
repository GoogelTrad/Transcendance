# Generated by Django 5.1.3 on 2025-03-08 12:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0032_alter_game_status_alter_tournament_scoremax_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='first',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='fourth',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='player1',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='player2',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='player3',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='player4',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='second',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='third',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]

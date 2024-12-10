# Generated by Django 5.1.3 on 2024-11-26 17:35

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time', models.IntegerField()),
                ('score', models.IntegerField()),
                ('player1', models.CharField(max_length=255)),
                ('player2', models.CharField(max_length=255)),
                ('winner', models.CharField(max_length=255)),
                ('loser', models.CharField(max_length=255)),
            ],
        ),
    ]

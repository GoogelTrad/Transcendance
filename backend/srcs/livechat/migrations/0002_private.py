# Generated by Django 5.1.3 on 2024-12-12 15:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('livechat', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Private',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('creation', models.DateTimeField(auto_now_add=True)),
                ('content', models.TextField()),
                ('password', models.CharField(max_length=255)),
                ('createur', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='rooms_create', to=settings.AUTH_USER_MODEL)),
                ('members_limit', models.ManyToManyField(related_name='members_limit', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
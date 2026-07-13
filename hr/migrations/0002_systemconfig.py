from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hr', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SystemConfig',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('setup_completed', models.BooleanField(default=False, verbose_name='اكتملت التهيئة')),
                ('company_name', models.CharField(blank=True, max_length=100, verbose_name='اسم المنشأة')),
                ('company_email', models.EmailField(blank=True, max_length=254, verbose_name='البريد الإلكتروني')),
                ('currency', models.CharField(default='YER', max_length=10, verbose_name='العملة')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='تاريخ التعديل')),
            ],
            options={
                'verbose_name': 'إعدادات النظام',
                'verbose_name_plural': 'إعدادات النظام',
            },
        ),
    ]

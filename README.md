# aljamieat_alwasatia

ssh -i "django.pem" ubuntu@ec2-40-172-123-226.me-central-1.compute.amazonaws.com

## التحقق السريع

يشغل فحص قبول داخلي بدون ترك بيانات اختبار:

```bash
.venv/bin/python scripts/smoke_check.py
```

يغطي الفحص تسجيل الدخول، تجديد التوكن، الموارد المحمية، فلاتر الحضور
والإجازات، CRUD للموظفين، وتغيير كلمة المرور داخل معاملة يتم التراجع عنها.

## نشر الواجهة

### Docker

```bash
cp .env.docker.example .env
docker compose up --build -d
```

عدّل `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, و
`DJANGO_CSRF_TRUSTED_ORIGINS` قبل النشر الحقيقي. إذا كان HTTPS منتهياً عند
reverse proxy خارجي، فعّل قيم secure المناسبة في `.env`.
لا تفعل `DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS` أو
`DJANGO_SECURE_HSTS_PRELOAD` إلا إذا كانت كل النطاقات الفرعية تعمل عبر HTTPS.

الخدمات:

- `frontend`: يبني React ويقدمه عبر Nginx.
- `backend`: يشغل Django عبر Gunicorn.
- `db`: يشغل PostgreSQL ويحفظ البيانات في volume دائم.
- `/api`, `/admin`, و`/static` تمر من Nginx إلى Django.
- بيانات PostgreSQL تحفظ في volume باسم `postgres_data`.

### بناء يدوي للواجهة

```bash
cd frontend
npm install
npm run build
```

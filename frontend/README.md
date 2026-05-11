# واجهة نظام الموارد البشرية

واجهة React/Vite متصلة بباك إند Django عبر مسار API موحد.

## إعداد الربط

انسخ ملف البيئة عند الحاجة:

```bash
cp .env.example .env
```

القيمة الافتراضية:

```env
VITE_API_BASE_URL=/api
VITE_ENABLE_LOGS=false
```

بهذا الشكل تستدعي الواجهة:

- تسجيل الدخول: `/api/token/`
- تجديد التوكن: `/api/token/refresh/`
- تغيير كلمة المرور: `/api/change-password/`
- الموارد: `/api/employees/`, `/api/jobs/`, `/api/leave-requests/`, وغيرها

في التطوير، Vite يمرر `/api` إلى Django على `http://localhost:8000` حسب `vite.config.ts`.
في الإنتاج، يجب أن يمرر خادم الويب نفس المسار `/api` إلى Django، وأن يقدم
ملفات `dist` كواجهة ثابتة مع fallback إلى `index.html` لمسارات React Router.

`VITE_ENABLE_LOGS=true` يفعّل سجلات `info` في الإنتاج عند الحاجة. سجلات
`warn` و`error` تبقى مفعلة دائماً.

## الأوامر

```bash
npm install
npm run dev
npm run build
npm run lint
```

من جذر المشروع يمكن تشغيل فحص قبول كامل:

```bash
.venv/bin/python scripts/smoke_check.py
```

# PROJECT_MAP — نظام الموارد البشرية (HRMS)

## [TECH_STACK]

**تاريخ التخطيط:** 2026-05-07  
**المستوى:** Frontend (SPA)

### الاعتماديات الأساسية (Production)

| الحزمة | الإصدار المستخدم | أحدث مستقر (2026-05) | ملاحظات |
|--------|------------------|---------------------|---------|
| react | ^18.3.1 | 19.2.6 | **تأجيل الترقية** — ترقية Major بلا حاجة وظيفية حالياً |
| react-dom | ^18.3.1 | 19.2.6 | يتبع react |
| react-router-dom | ^7.15.0 | 7.15.0 | ✅ محدث — layout routes مع createBrowserRouter |
| @tanstack/react-query | ^5.100.9 | 5.100.9 | ✅ محدث |
| zustand | ^5.0.13 | 5.0.13 | ✅ محدث |
| zod | ^4.4.3 | 4.4.3 | ✅ محدث — v4 API مختلفة عن v3 |
| react-hook-form | ^7.75.0 | 7.75.0 | ✅ محدث |
| axios | ^1.16.0 | 1.16.0 | ✅ محدث |
| @hookform/resolvers | ^5.2.2 | 5.2.2 | ✅ محدث — متوافق مع zod v4 |
| lucide-react | ^1.14.0 | 1.14.0 | ✅ محدث |
| class-variance-authority | ^0.7.1 | 0.7.1 | ✅ محدث |
| clsx | ^2.1.1 | 2.1.1 | ✅ محدث |
| tailwind-merge | ^3.5.0 | 3.5.0 | ✅ محدث |
| @radix-ui/react-slot | ^1.2.4 | 1.2.4 | ✅ محدث |

### أدوات التطوير (Dev)

| الحزمة | الإصدار المستخدم | أحدث مستقر | ملاحظات |
|--------|------------------|------------|---------|
| vite | ^8.0.11 | 8.0.11 | ✅ محدث |
| typescript | ~6.0.2 | 6.0.3 | ⚠️ Patch متاح — 6.0.3 مستقر |
| @types/react | ^18.3.28 | 18.3.28 | ✅ يتوافق مع React 18 |
| tailwindcss | ^3.4.19 | 4.3.0 | ⚠️ **فجوة إصدار كبيرة** — Tailwind v4: تكوين مختلف (CSS-based)، PostCSS plugin مختلف. الترقية تتطلب إعادة هيكلة ملفات css |
| eslint | ^10.2.1 | 10.3.0 | ⚠️ Patch متاح — ترقية آمنة |
| postcss | ^8.5.14 | 8.5.14 | ✅ محدث |
| autoprefixer | ^10.5.0 | 10.5.0 | ✅ محدث |
| @vitejs/plugin-react | ^6.0.1 | 6.0.1 | ✅ محدث |
| typescript-eslint | ^8.58.2 | 8.58.2 | ✅ محدث |

### البنية التحتية

| العنصر | القيمة |
|--------|--------|
| Bundler | Vite 8 |
| CSS Framework | Tailwind 3 (PostCSS) |
| Language | TypeScript 6 |
| Runtime | Node (>=22 متوقع) |
| Proxy | Vite dev → Django :8000, Docker Nginx → backend:8000 |
| Path Alias | `@/` → `./src/*` |
| Docker | Frontend Nginx + Backend Gunicorn |

---

## [SYSTEM_FLOW]

### تدفق المصادقة (JWT فعلي)

```
[Login Page] → POST /api/token/
    → تخزين access_token + refresh_token + auth_username
    → ProtectedRoute يتحقق من access_token
    → [Dashboard Layout] ← مسارات محمية
    → Axios يضيف Authorization: Bearer <access_token>
    → عند 401: POST /api/token/refresh/
    → إعادة الطلب الأصلي أو الرجوع إلى /login عند الفشل
```

المصادقة تعتمد على Django REST Framework + SimpleJWT، ومسارات التوكن لا تمر
بـ `/api` مرتين داخل Axios.

### تدفق CRUD الديناميكي

```
[Resource Config] → define columns + formFields + endpoint
    → [ResourcePage] → useQuery(endpoint) → Table/Cards
    → [ResourceForm] → Form generation from config
    → useMutation(POST/PATCH/DELETE) → invalidateQueries
```

النظام بأكمله مدفوع بالتهيئة (Configuration-Driven):
- `resource-config.ts` يعرّف 20 موديل
- `ResourcePage.tsx` يقرأ config وينشئ UI ديناميكياً
- `ResourceForm.tsx` يقرأ formFields وينشئ حقول النموذج تلقائياً
- `api.ts` يوفر دوال CRUD عامة

### تدفق البيانات

```
[Browser] → Vite Dev Server (:5173) → Proxy /api/* → Django (:8000)
    → Django REST Framework → SQLite/PostgreSQL
    → JSON Response → React Query Cache → Components
```

### خريطة المسارات (Router)

```
/login                               → LoginPage (غير محمي)
/setup                               → SetupWizardPage (محمي، شرط التهيئة)
/                                    → DashboardLayout (محمي)
  /                                  → DashboardPage
  /employees                         → Redirect → /workflows/employees
  /leaves                            → Redirect → /workflows/leave-approvals
  /resources/:resourceKey            → ResourcePage (CRUD ديناميكي)
  /groups/:groupKey                  → ResourceGroupPage
  /workflows/employees               → EmployeesWorkspacePage
  /workflows/attendance              → AttendanceWorkdayPage
  /workflows/leave-approvals         → LeaveApprovalsPage
  /workflows/reports                 → ReportsPage
  /workflows/fingerprint-integration → FingerprintIntegrationPage
  /settings                          → ⚠️ مسار يتيم — معرف في breadcrumb دون route
  *                                  → Redirect → /
```

---

## [ARCHITECTURE]

### هيكل المجلدات (SRC)

```
src/
├── App.tsx                          # Provider tree (QueryClient, ErrorBoundary, Toast, Router)
├── main.tsx                         # Entry point
├── index.css                        # Tailwind directives
│
├── assets/                          # Static assets (SVG, PNG)
├── config/
│   └── api.ts                       # Base URL config
├── lib/
│   ├── api-client.ts                # Axios instance + JWT refresh interceptor
│   ├── logger.ts                    # Async non-blocking logger
│   └── utils.ts                     # cn() helper
├── store/
│   └── app-store.ts                 # Global UI state (sidebar, theme)
├── router/
│   └── index.tsx                    # All route definitions
├── layouts/
│   └── dashboard-layout.tsx         # Master layout: sidebar + header + Outlet
├── components/
│   ├── error-boundary.tsx           # Catch-all error boundary
│   └── ui/                          # 8 primitives (badge, button, card, ...)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── confirm-dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── toast.tsx
└── features/                        # Domain-driven modules
    ├── auth/
    │   ├── auth-store.ts            # Zustand store (JWT real login)
    │   ├── components/protected-route.tsx
    │   └── pages/login-page.tsx
    ├── dashboard/
    │   └── pages/dashboard-page.tsx
    ├── resources/                   # Core: CRUD Configuration-Driven
    │   ├── api.ts                   # generic CRUD functions
    │   ├── resource-config.ts       # 20 resource definitions
    │   ├── components/resource-form.tsx
    │   ├── components/record-details.tsx
    │   └── pages/
    │       ├── resource-page.tsx    # CRUD table view (server-side pagination)
    │       └── resource-group-page.tsx
    ├── settings/                    # ⚠️ ORPHAN — غير مستورد في Router
    │   └── pages/system-settings-page.tsx
    └── workflows/                   # Specialized operational pages
        ├── pages/
        │   ├── attendance-workday-page.tsx
        │   ├── employees-workspace-page.tsx
        │   ├── fingerprint-integration-page.tsx
        │   ├── leave-approvals-page.tsx
        │   └── reports-page.tsx
        ```

### المبادئ المعمارية

1. **Configuration-Driven UI** — ResourcePage يقرأ Config ويعرض UI ديناميكياً. لا حاجة لصفحات منفصلة لكل موديل.
2. **Feature-based (Domain-Driven)** — كل feature لها مجلدها الخاص مع Store/Components/Pages.
3. **Shared Layer minimal** — `lib/` يحتوي فقط api-client و cn() (منطق متكرر فعلاً).
4. **Safe Logging** — `logger.ts` غير حظري عبر `queueMicrotask`; سجلات `info` متوقفة في production إلا عند `VITE_ENABLE_LOGS=true`.
5. **Zustand للمحلية** — لا Redux، لا Context زائد.
6. **TanStack Query للخادم** — cache, staleTime, refetch, invalidation.
7. **لا Micro-files** — مكونات الـ UI في ملف واحد، الصفحات في ملف واحد.

### نمط المكونات

- **Primitives**: `components/ui/` — مستقلة، Tailwind + CVA
- **Features**: `features/X/pages/` — صفحة كاملة، تدمج Primitives
- **Layout**: `layouts/` — هيكل الصفحة الرئيسي (Sidebar + Header + Main)

---

## [ORPHANS & PENDING]

### ⚠️ Orphans — مفتوحة (تحتاج تدخل)

| الملف | المشكلة | الأولوية |
|-------|---------|----------|
| `features/settings/pages/system-settings-page.tsx` | صفحة كاملة مصدرة ولكن **غير مستوردة** في Router. المسار `/settings` مشار إليه في `dashboard-layout.tsx:286` (breadcrumb) لكن لا يوجد route فعلي. | **عالية** — إما حذف أو ربط بالراوتر |
| `assets/hero.png` | ملف صورة غير مستخدم في أي كود. | **منخفضة** — حذف |
| `features/resources/pages/resource-group-page.tsx` | موجودة في Router ولكن غير موثقة في PROJECT_MAP سابقاً. الوظيفة: عرض موارد مجموعة معينة. | **معلوماتية** — موجودة وتعمل |

### 🔧 Known Issues — مفتوحة

| المشكلة | الموقع | التفاصيل | الأولوية |
|---------|--------|----------|----------|
| FormData بدلاً من react-hook-form | `resource-form.tsx:168` | يستخدم `new FormData(event.currentTarget)` بدلاً من `watch/setValue` من react-hook-form. يعمل لكن غير متسق مع صفحة login. | **متوسطة** |
| بحث عالمي Client-side | `dashboard-layout.tsx:223` | يفلتر employees/leaves في الذاكرة بدلاً من إرسال search term إلى API. مقبول للحجم الصغير. | **منخفضة** |
| Password form يدوي | `dashboard-layout.tsx:110` | يستخدم `useState` بدلاً من react-hook-form. | **منخفضة** |
| Notification queries 4 parallel | `dashboard-layout.tsx:165` | 4 useQueries متوازية في كل رندر للـ Layout (مخفف بـ staleTime: 60_000). | **معلوماتية** |

### قرارات مؤجلة وليست نواقص

| القرار | سبب التأجيل |
|--------|-------------|
| ترقية React 18 → 19 | ترقية Major بلا حاجة وظيفية حالية، وتتطلب دورة تحقق منفصلة. |
| ترقية Tailwind 3 → 4 | ترقية Major تغيّر أسلوب التكوين وتستحق migration مستقل. |
| i18n | النصوص العربية الحالية هي لغة المنتج المطلوبة حالياً. |
| ترقية TypeScript 6.0.2 → 6.0.3 | Patch آمن — مؤجل للدورة التالية لتحديث جميع الـ patches معاً. |
| ترقية ESLint 10.2.1 → 10.3.0 | Patch آمن — مؤجل للدورة التالية. |

### ✅ Orphans — تم الحل

| الملف | المشكلة | الإجراء |
|-------|---------|---------|
| `features/employees/` | بيانات وهمية (hardcoded) + غير مستخدم في Router | ✅ **تم الحذف** (M1) |
| `features/hr/index.ts` | فارغ (`export {}`) | ✅ **تم الحذف** (M1) |
| `features/leaves/` | فارغ (`export {}`) | ✅ **تم الحذف** (M1) |
| `assets/react.svg`, `assets/vite.svg` | أصول قالب Vite غير مستخدمة | ✅ **تم الحذف** (M8) |

### ✅ Known Issues — تم الحل

| المشكلة | الموقع | التفاصيل |
|---------|--------|----------|
| Auth محلي قديم | `auth-store.ts` | كان login يخزن username فقط في localStorage | ✅ **تم — JWT حقيقي** (M2) |
| Form field typo | `resource-config.ts:172` | `JobTitle` بدلاً من `job_title` | ✅ **تم التصحيح** (M1) |
| Filtering client-side | عدة صفحات | ResourcePage, Attendance, Reports, Leave Approvals ترسل فلاتر إلى API | ✅ **تم** (M3, M7) |
| Password modal disconnected | `dashboard-layout.tsx` | modal موجود بدون endpoint حقيقي | ✅ **تم الربط** (M5) |
| Notification queries بدون staleTime صريح | `dashboard-layout.tsx` | تم ضبط `staleTime: 60_000` | ✅ **تم** |
| Production reverse proxy | وثائق التشغيل | موثق في `frontend/README.md`: يجب تمرير `/api` إلى Django في النشر | ✅ **تم** |

---

## [MILESTONES]

### M1 — النظافة (Codebase Hygiene) ✅
- [x] حذف `features/employees/` (غير مستخدم)
- [x] حذف `features/hr/index.ts` و `features/leaves/`
- [x] تصحيح typo `JobTitle` → `job_title` في resource-config.ts

### M2 — تأمين Auth ✅
- [x] login API حقيقي `POST /api/token/` + `POST /api/token/refresh/`
- [x] تخزين access/refresh token في localStorage
- [x] Axios interceptor يعيد refresh تلقائياً (مع queue)
- [x] تسجيل خروج حقيقي ينظف tokens
- [x] `IsAuthenticated` permission على جميع endpoints
- [x] `AllowAny` على push/device للبصمة

### M3 — Server-side Pagination ✅
- [x] إرسال `?page=&page_size=&search=` في getResourceRecords
- [x] تحديث ResourcePage لاستخدام pagination من الخادم
- [x] keepPreviousData لتفادي flickering

### M4 — Logging & Error Handling ✅
- [x] إنشاء `lib/logger.ts` (async, non-blocking via queueMicrotask)
- [x] Axios response interceptor للتسجيل (info للنجاح، error للفشل)
- [x] ErrorBoundary عام على مستوى App
- [x] إيقاف `info` logs في production إلا عند `VITE_ENABLE_LOGS=true`

### M5 — Password Change ✅
- [x] إنشاء `POST /api/change-password/` في الباك إند
- [x] ربط modal مع API كامل مع validation

### M6 — Planning Protocol Refresh ✅
- [x] تثبيت التاريخ من shell: `2026-05`
- [x] التحقق من Vite/React/Tailwind/React Router من npm وGitHub الرسمي
- [x] ترقية Vite patch: `8.0.10` → `8.0.11`
- [x] تحديث README و `.env.example` بمتغيرات الربط والـ logging
- [x] تحديث هذه الخريطة لتعكس Auth الحقيقي وSafe Logging

### M7 — Execution Engine Completion ✅
- [x] إضافة فلاتر API صريحة للحضور: `date`, `month`, `is_present1`
- [x] إضافة فلتر API صريح لطلبات الإجازة: `status`
- [x] نقل AttendanceWorkdayPage إلى فلاتر API حسب التاريخ والبحث
- [x] نقل ReportsPage إلى فلتر API شهري
- [x] نقل LeaveApprovalsPage إلى فلتر API حسب الحالة مع عدادات من API
- [x] التحقق عبر `manage.py check`, `npm run lint`, `npm run build`
- [x] محاكاة API مصادقة لفلاتر `attendance` و `leave-requests`

### M8 — Acceptance & Deployment Readiness ✅
- [x] إضافة `scripts/smoke_check.py` لفحص قبول آلي بدون ترك بيانات اختبار
- [x] تغطية JWT login + refresh + protected API في smoke check
- [x] تغطية CRUD موظف داخل معاملة rollback
- [x] تغطية تغيير كلمة المرور داخل معاملة rollback
- [x] توثيق فحص القبول في `README.md` و `frontend/README.md`
- [x] توثيق خطوات نشر الواجهة وتمرير `/api`
- [x] حذف أصول Vite/React الافتراضية غير المستخدمة

### M9 — Docker Deployment ✅
- [x] إضافة Dockerfile للباك إند مع Gunicorn و collectstatic
- [x] إضافة Dockerfile للفرونت إند مع build stage و Nginx
- [x] إضافة Nginx config لتمرير `/api`, `/admin`, `/static` إلى Django
- [x] إضافة `docker-compose.yml` لتشغيل frontend/backend
- [x] جعل إعدادات Django الإنتاجية قابلة للتهيئة عبر env
- [x] إضافة `.env.docker.example` وتوثيق تشغيل Docker
- [x] إضافة `.dockerignore` للجذر والفرونت لتقليل سياق البناء

### M10 — Architectural Audit & Hygiene (2026-05-10) ⬜
- [ ] **Orphan**: ربط `SystemSettingsPage` بالراوتر في `/settings` أو حذف الملف
- [ ] **Orphan**: حذف `assets/hero.png` (غير مستخدم)
- [ ] **Consistency**: تحويل `resource-form.tsx` إلى react-hook-form بدلاً من FormData
- [ ] **Consistency**: تحويل password modal في `dashboard-layout.tsx` إلى react-hook-form + Zod
- [ ] **Patch**: ترقية TypeScript `~6.0.2` → `~6.0.3`
- [ ] **Patch**: ترقية ESLint `^10.2.1` → `^10.3.0`
- [ ] **Deps**: التحقق من توافق `typescript-eslint` مع TS 6.0.3 و ESLint 10.3.0
- [ ] **Verification**: `npm run lint && npm run build` — سليم

---

*ملف تم تحديثه بواسطة Architectural Audit — 2026-05-10*

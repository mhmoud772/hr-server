import { useQueries } from '@tanstack/react-query'
import {
  AlertTriangle,
  CalendarCheck,
  ClipboardCheck,
  FileSpreadsheet,
  Fingerprint,
  Plus,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { getResourceRecords, type ResourceRecord } from '@/features/resources/api'

const queries = [
  { key: 'employees', endpoint: '/employees/' },
  { key: 'leave-requests', endpoint: '/leave-requests/' },
  { key: 'attendance', endpoint: '/attendance/' },
  { key: 'fingerprint-devices', endpoint: '/fingerprint-devices/' },
  { key: 'employee-fingerprints', endpoint: '/employee-fingerprints/' },
  { key: 'educational-levels', endpoint: '/educational-levels/' },
  { key: 'type-of-employees', endpoint: '/type-of-employees/' },
  { key: 'marital-statuses', endpoint: '/marital-statuses/' },
]

const quickActions = [
  {
    title: 'إضافة موظف',
    description: 'فتح إدارة الموظفين وإضافة سجل جديد.',
    href: '/resources/employees',
    icon: Plus,
  },
  {
    title: 'اعتماد الإجازات',
    description: 'مراجعة الطلبات المعلقة بسرعة.',
    href: '/workflows/leave-approvals',
    icon: ClipboardCheck,
  },
  {
    title: 'حضور اليوم',
    description: 'متابعة الحضور حسب التاريخ.',
    href: '/workflows/attendance',
    icon: CalendarCheck,
  },
  {
    title: 'تقرير شهري',
    description: 'تحميل ملف CSV للحضور.',
    href: '/workflows/reports',
    icon: FileSpreadsheet,
  },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function dateNDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function percent(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

function statusVariant(status: unknown) {
  if (status === 2) return 'success' as const
  if (status === 3) return 'destructive' as const
  return 'warning' as const
}

function statusLabel(status: unknown) {
  if (status === 2) return 'مقبولة'
  if (status === 3) return 'مرفوضة'
  return 'معلقة'
}

function displayName(record: ResourceRecord) {
  return String(record.employee_name ?? record.name ?? record.display ?? 'سجل')
}

export function DashboardPage() {
  const [
    employeesQuery,
    leavesQuery,
    attendanceQuery,
    devicesQuery,
    fingerprintsQuery,
    educationQuery,
    employeeTypesQuery,
    maritalStatusesQuery,
  ] = useQueries({
    queries: queries.map((query) => ({
      queryKey: ['dashboard', query.key],
      queryFn: () => getResourceRecords(query.endpoint),
    })),
  })

  const employees = employeesQuery.data?.records ?? []
  const leaves = leavesQuery.data?.records ?? []
  const attendance = attendanceQuery.data?.records ?? []
  const devices = devicesQuery.data?.records ?? []
  const fingerprints = fingerprintsQuery.data?.records ?? []
  const educationLevels = educationQuery.data?.records ?? []
  const employeeTypes = employeeTypesQuery.data?.records ?? []
  const maritalStatuses = maritalStatusesQuery.data?.records ?? []

  const today = todayIso()
  const todayAttendance = attendance.filter((record) => record.date === today)
  const presentToday = todayAttendance.filter((record) => record.is_present)
  const absentToday = todayAttendance.filter((record) => !record.is_present)
  const lateToday = todayAttendance.filter((record) => record.is_present1 === 2)
  const pendingLeaves = leaves.filter((record) => record.status === 1)
  const approvedLeaves = leaves.filter((record) => record.status === 2)
  const rejectedLeaves = leaves.filter((record) => record.status === 3)
  const activeEmployees = employees.filter((employee) => employee.active)
  const activeDevices = devices.filter((device) => device.is_active)
  const employeesWithoutFingerprint = employees.filter(
    (employee) =>
      !fingerprints.some(
        (fingerprint) => String(fingerprint.employee) === String(employee.id),
      ),
  )
  const missingPunches = attendance.filter(
    (record) => record.is_present1 === 5 || record.is_present1 === 6,
  )
  const activeLeaveToday = leaves.filter(
    (leave) =>
      leave.status === 2 &&
      String(leave.start_day ?? '') <= today &&
      String(leave.end_day ?? '') >= today,
  )

  const attendanceTrend = Array.from({ length: 7 }, (_, index) => {
    const date = dateNDaysAgo(6 - index)
    const dayRecords = attendance.filter((record) => record.date === date)
    return {
      date,
      label: date.slice(5),
      present: dayRecords.filter((record) => record.is_present).length,
      total: dayRecords.length,
    }
  })
  const maxTrend = Math.max(1, ...attendanceTrend.map((item) => item.total))

  const setupSteps = [
    {
      title: 'أضف مستوى تعليمي',
      done: Boolean(educationLevels.length),
      href: '/resources/educational-levels',
    },
    {
      title: 'أضف نوع توظيف',
      done: Boolean(employeeTypes.length),
      href: '/resources/type-of-employees',
    },
    {
      title: 'أضف حالة اجتماعية',
      done: Boolean(maritalStatuses.length),
      href: '/resources/marital-statuses',
    },
    {
      title: 'أضف أول موظف',
      done: Boolean(employees.length),
      href: '/resources/employees',
    },
  ]
  const setupComplete = setupSteps.every((step) => step.done)

  const alerts = [
    {
      title: 'طلبات إجازة معلقة',
      value: pendingLeaves.length,
      href: '/workflows/leave-approvals',
      tone: 'warning',
    },
    {
      title: 'موظفون بدون بصمة',
      value: employeesWithoutFingerprint.length,
      href: '/resources/employee-fingerprints',
      tone: 'info',
    },
    {
      title: 'أجهزة غير مفعلة',
      value: devices.length - activeDevices.length,
      href: '/resources/fingerprint-devices',
      tone: 'destructive',
    },
    {
      title: 'سجلات حضور ناقصة',
      value: missingPunches.length,
      href: '/resources/attendance',
      tone: 'warning',
    },
  ].filter((alert) => alert.value > 0)

  const stats = [
    {
      title: 'الموظفون النشطون',
      value: activeEmployees.length,
      note: `من أصل ${employees.length} موظف`,
      icon: Users,
    },
    {
      title: 'حضور اليوم',
      value: presentToday.length,
      note: `${absentToday.length} غياب، ${lateToday.length} تأخير`,
      icon: CalendarCheck,
    },
    {
      title: 'إجازات اليوم',
      value: activeLeaveToday.length,
      note: `${pendingLeaves.length} طلب معلق`,
      icon: ClipboardCheck,
    },
    {
      title: 'أجهزة البصمة',
      value: activeDevices.length,
      note: `من أصل ${devices.length} جهاز`,
      icon: Fingerprint,
    },
  ]

  const recentLeaves = [...leaves]
    .sort((a, b) => String(b.create_at ?? '').localeCompare(String(a.create_at ?? '')))
    .slice(0, 5)
  const recentAttendance = [...attendance]
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageTransition>
        <section className="rounded-2xl bg-gradient-to-l from-primary via-primary to-blue-600 p-6 text-white shadow-lg shadow-primary/20 lg:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white/70">
              لوحة التحكم
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">
              مركز قيادة الموارد البشرية
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
              ماذا يحدث اليوم؟ ما الذي يحتاج قراراً؟ وما أسرع إجراء مطلوب؟
              هذه الصفحة تجمع الإجابة في مكان واحد.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10">
              <Link to="/workflows/employees">ملف الموظفين</Link>
            </Button>
            <Button
              asChild
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              variant="outline"
            >
              <Link to="/workflows/leave-approvals">اعتماد الإجازات</Link>
            </Button>
          </div>
        </div>
      </section>
      </PageTransition>

      {!setupComplete && (
        <PageTransition delay={50}>
        <Card>
          <CardHeader>
            <CardTitle>ابدأ تهيئة النظام</CardTitle>
            <CardDescription>
              قاعدة البيانات تبدو جديدة. أكمل الخطوات التالية ليصبح النظام جاهزاً
              للاستخدام.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {setupSteps.map((step, index) => (
              <Link
                className="rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                key={step.title}
                to={step.href}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <Badge variant={step.done ? 'success' : 'warning'}>
                    {step.done ? 'مكتمل' : 'مطلوب'}
                  </Badge>
                </div>
                <p className="mt-4 font-semibold text-foreground">{step.title}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        </PageTransition>
      )}

      <PageTransition delay={100}>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <p className="mt-1 text-sm text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      </PageTransition>

      <PageTransition delay={200}>
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>المهام اليومية الأكثر استخداماً.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => (
              <Link
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                key={action.href}
                to={action.href}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <action.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{action.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تنبيهات تحتاج متابعة</CardTitle>
            <CardDescription>أهم ما يحتاج انتباهك الآن.</CardDescription>
          </CardHeader>
          <CardContent>
            {!alerts.length && (
              <div className="rounded-xl border border-dashed border-border bg-muted/50 p-10 text-center text-muted-foreground">
                لا توجد تنبيهات حالياً.
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {alerts.map((alert) => (
                <Link
                  className="rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                  key={alert.title}
                  to={alert.href}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <span className="font-semibold text-foreground">{alert.title}</span>
                    </div>
                    <Badge
                      variant={
                        alert.tone === 'destructive'
                          ? 'destructive'
                          : alert.tone === 'warning'
                            ? 'warning'
                            : 'default'
                      }
                    >
                      {alert.value}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      </PageTransition>

      <PageTransition delay={300}>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>حضور آخر 7 أيام</CardTitle>
            <CardDescription>مخطط سريع من سجلات الحضور المتاحة.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end gap-3">
              {attendanceTrend.map((item) => (
                <div className="flex flex-1 flex-col items-center gap-2" key={item.date}>
                  <div className="flex h-40 w-full items-end rounded-md bg-muted">
                    <div
                      className="w-full rounded-md bg-primary"
                      style={{
                        height: `${Math.max(6, percent(item.present, maxTrend))}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الإجازات</CardTitle>
            <CardDescription>ملخص حالات طلبات الإجازة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ['معلقة', pendingLeaves.length, 'bg-warning'],
              ['مقبولة', approvedLeaves.length, 'bg-success'],
              ['مرفوضة', rejectedLeaves.length, 'bg-destructive'],
            ].map(([label, value, color]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{String(value)}</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div
                    className={`h-3 rounded-full ${color}`}
                    style={{
                      width: `${Math.max(4, percent(Number(value), Math.max(1, leaves.length)))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>آخر طلبات الإجازة</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!recentLeaves.length && (
              <div className="rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center text-muted-foreground">
                لا توجد طلبات إجازة بعد.
              </div>
            )}
            {recentLeaves.map((request) => (
              <div
                className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm md:flex-row md:items-center"
                key={String(request.id)}
              >
                <div>
                  <p className="font-semibold text-foreground">{displayName(request)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {String(request.leave_type_name ?? 'إجازة')} من{' '}
                    {String(request.start_day ?? '-')} إلى{' '}
                    {String(request.end_day ?? '-')}
                  </p>
                </div>
                <Badge variant={statusVariant(request.status)}>
                  {statusLabel(request.status)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر سجلات الحضور</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!recentAttendance.length && (
              <div className="rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center text-muted-foreground">
                لا توجد سجلات حضور بعد.
              </div>
            )}
            {recentAttendance.map((record) => (
              <div
                className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm md:flex-row md:items-center"
                key={String(record.id)}
              >
                <div>
                  <p className="font-semibold text-foreground">{displayName(record)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {String(record.date ?? '-')} | دخول:{' '}
                    {String(record.time_in ?? '-')} | خروج:{' '}
                    {String(record.time_out ?? '-')}
                  </p>
                </div>
                <Badge variant={record.is_present ? 'success' : 'destructive'}>
                  {String(record.status_name ?? '-')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      </PageTransition>
    </div>
  )
}

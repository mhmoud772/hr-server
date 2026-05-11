import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BriefcaseBusiness, Fingerprint, Mail, Phone, Plus, Search, UserRoundCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getResourceRecords, type ResourceRecord } from '@/features/resources/api'

function text(value: unknown) {
  return value === null || value === undefined || value === '' ? '-' : String(value)
}

export function EmployeesWorkspacePage() {
  const [search, setSearch] = useState('')
  const employeesQuery = useQuery({
    queryKey: ['workspace', 'employees'],
    queryFn: () => getResourceRecords('/employees/'),
  })
  const jobsQuery = useQuery({
    queryKey: ['workspace', 'jobs'],
    queryFn: () => getResourceRecords('/jobs/'),
  })
  const fingerprintsQuery = useQuery({
    queryKey: ['workspace', 'employee-fingerprints'],
    queryFn: () => getResourceRecords('/employee-fingerprints/'),
  })

  const employees = useMemo(() => {
    const records = employeesQuery.data?.records ?? []
    const normalized = search.trim().toLowerCase()

    if (!normalized) return records

    return records.filter((employee) =>
      [employee.name, employee.number_employee, employee.phone, employee.email]
        .map(text)
        .some((value) => value.toLowerCase().includes(normalized)),
    )
  }, [employeesQuery.data?.records, search])

  const jobByEmployee = useMemo(() => {
    const map = new Map<string, ResourceRecord>()
    ;(jobsQuery.data?.records ?? []).forEach((job) => {
      map.set(String(job.employee), job)
    })
    return map
  }, [jobsQuery.data?.records])

  const fingerprintCountByEmployee = useMemo(() => {
    const map = new Map<string, number>()
    ;(fingerprintsQuery.data?.records ?? []).forEach((fingerprint) => {
      const key = String(fingerprint.employee)
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [fingerprintsQuery.data?.records])

  const activeCount = (employeesQuery.data?.records ?? []).filter(
    (employee) => employee.active,
  ).length

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-label-md text-on-surface-variant">الموارد البشرية</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-on-surface">
            ملف الموظفين
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            واجهة مخصصة لاستعراض الموظفين وربط الوظيفة والبصمة بسرعة.
          </p>
        </div>
        <Button asChild>
          <Link to="/resources/employees">
            <Plus className="h-4 w-4" />
            إضافة موظف
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي الموظفين</CardTitle>
            <CardDescription>{employeesQuery.data?.count ?? 0} موظف</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>النشطون</CardTitle>
            <CardDescription>{activeCount} موظف</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>بصمات مسجلة</CardTitle>
            <CardDescription>
              {fingerprintsQuery.data?.count ?? 0} ربط بصمة
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>قائمة الموظفين</CardTitle>
            <CardDescription>بطاقات مختصرة مناسبة للعرض أمام العميل.</CardDescription>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pr-9"
              placeholder="بحث بالاسم أو الرقم أو الهاتف"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {employeesQuery.isLoading && (
            <div className="grid gap-4 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <article key={i} className="rounded-lg border border-outline-variant bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </article>
              ))}
            </div>
          )}

          {!employeesQuery.isLoading && !employees.length && (
            <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-10 text-center">
              <UserRoundCheck className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-semibold">لا توجد نتائج</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                أضف موظفين أو غيّر عبارة البحث.
              </p>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            {employees.map((employee) => {
              const job = jobByEmployee.get(String(employee.id))
              const fingerprintCount = fingerprintCountByEmployee.get(String(employee.id)) ?? 0

              return (
                <article
                  className="rounded-lg border border-outline-variant bg-card p-4 shadow-sm transition-shadow hover:shadow-soft"
                  key={String(employee.id)}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold tracking-normal">
                          {text(employee.name)}
                        </h3>
                        <Badge variant={employee.active ? 'success' : 'muted'}>
                          {employee.active ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        رقم الموظف: {text(employee.number_employee)}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/resources/employees">إدارة</Link>
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-on-surface-variant sm:grid-cols-2">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      {text(employee.phone)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      {text(employee.email)}
                    </span>
                    <span className="flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 text-primary" />
                      {text(job?.job_title_name ?? job?.JobTitle)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-primary" />
                      {fingerprintCount} بصمة
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

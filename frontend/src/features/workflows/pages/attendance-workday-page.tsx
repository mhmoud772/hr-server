import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, UserRoundX, Users } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { getResourceRecords } from '@/features/resources/api'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function AttendanceWorkdayPage() {
  const [date, setDate] = useState(todayIso())
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const query = useQuery({
    queryKey: ['workflow', 'attendance', date, debouncedSearch],
    queryFn: () =>
      getResourceRecords('/attendance/', {
        date: date || undefined,
        search: debouncedSearch,
      }),
  })
  const records = query.data?.records ?? []

  return (
    <div className="space-y-6">
      <section>
        <p className="text-label-md text-muted-foreground">الحضور</p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">
          متابعة حضور اليوم
        </h2>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
          <CardDescription>فلترة مباشرة من API حسب التاريخ واسم الموظف.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Input
            placeholder="بحث باسم الموظف"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
            <CardTitle>السجلات</CardTitle>
            <CardDescription>{records.length} سجل</CardDescription>
            </div>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
            <CardTitle>الحضور</CardTitle>
            <CardDescription>
              {records.filter((record) => record.is_present).length} موظف
            </CardDescription>
            </div>
            <CalendarCheck className="h-6 w-6 text-success" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
            <CardTitle>الغياب</CardTitle>
            <CardDescription>
              {records.filter((record) => !record.is_present).length} موظف
            </CardDescription>
            </div>
            <UserRoundX className="h-6 w-6 text-destructive" />
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجلات الحضور</CardTitle>
        </CardHeader>
        <CardContent>
          {!query.isLoading && !records.length && (
            <div className="mb-4 rounded-lg border border-dashed border-border bg-muted p-10 text-center text-muted-foreground">
              لا توجد سجلات حضور مطابقة للفلاتر الحالية.
            </div>
          )}
          <div className="overflow-hidden rounded-md border border-border">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-10 bg-card text-muted-foreground shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-right">الموظف</th>
                    <th className="px-4 py-3 text-right">التاريخ</th>
                    <th className="px-4 py-3 text-right">الدخول</th>
                    <th className="px-4 py-3 text-right">الخروج</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {query.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      </tr>
                    ))
                  ) : (
                    records.map((record) => (
                    <tr key={String(record.id)}>
                      <td className="px-4 py-3 font-medium">
                        {String(record.employee_name ?? '-')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {String(record.date ?? '-')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {String(record.time_in ?? '-')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {String(record.time_out ?? '-')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={record.is_present ? 'success' : 'destructive'}>
                          {String(record.status_name ?? '-')}
                        </Badge>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {query.isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div className="rounded-lg border border-border bg-card p-4" key={i}>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              : records.map((record) => (
                  <div className="rounded-lg border border-border bg-card p-4 shadow-sm" key={String(record.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{String(record.employee_name ?? '-')}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{String(record.date ?? '-')}</p>
                      </div>
                      <Badge variant={record.is_present ? 'success' : 'destructive'}>
                        {String(record.status_name ?? '-')}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الدخول</span>
                        <span>{String(record.time_in ?? '-')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الخروج</span>
                        <span>{String(record.time_out ?? '-')}</span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, UserRoundX, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getResourceRecords } from '@/features/resources/api'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function AttendanceWorkdayPage() {
  const [date, setDate] = useState(todayIso())
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['workflow', 'attendance', date, search],
    queryFn: () =>
      getResourceRecords('/attendance/', {
        date: date || undefined,
        search,
      }),
  })
  const records = query.data?.records ?? []

  return (
    <div className="space-y-6">
      <section>
        <p className="text-label-md text-on-surface-variant">الحضور</p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal text-on-surface">
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
            <div className="mb-4 rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-10 text-center text-on-surface-variant">
              لا توجد سجلات حضور مطابقة للفلاتر الحالية.
            </div>
          )}
          <div className="overflow-hidden rounded-md border border-outline-variant">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-surface-container text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3 text-right">الموظف</th>
                    <th className="px-4 py-3 text-right">التاريخ</th>
                    <th className="px-4 py-3 text-right">الدخول</th>
                    <th className="px-4 py-3 text-right">الخروج</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant bg-card">
                  {records.map((record) => (
                    <tr key={String(record.id)}>
                      <td className="px-4 py-3 font-medium">
                        {String(record.employee_name ?? '-')}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {String(record.date ?? '-')}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {String(record.time_in ?? '-')}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {String(record.time_out ?? '-')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={record.is_present ? 'success' : 'destructive'}>
                          {String(record.status_name ?? '-')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

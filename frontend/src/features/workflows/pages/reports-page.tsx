import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getResourceRecords } from '@/features/resources/api'

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const headers = ['employee_name', 'date', 'time_in', 'time_out', 'status_name', 'note']
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`)
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const query = useQuery({
    queryKey: ['workflow', 'reports-attendance', month],
    queryFn: () => getResourceRecords('/attendance/', { month }),
  })

  const rows = query.data?.records ?? []

  return (
    <div className="space-y-6">
      <section>
        <p className="text-label-md text-on-surface-variant">التقارير</p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal text-on-surface">
          تقرير الحضور الشهري
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          تصدير CSV من سجلات الحضور التي يرجعها API للشهر المحدد.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>إعداد التقرير</CardTitle>
          <CardDescription>اختر الشهر ثم حمّل الملف.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            className="max-w-xs"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
          <Button
            disabled={!rows.length}
            onClick={() => downloadCsv(`attendance-${month}.csv`, rows)}
            type="button"
          >
            <Download className="h-4 w-4" />
            تحميل CSV
          </Button>
          <span className="text-sm text-on-surface-variant">
            {rows.length} سجل مطابق
          </span>
        </CardContent>
      </Card>
    </div>
  )
}

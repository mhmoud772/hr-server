import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import {
  getResourceRecords,
  updateResourceRecord,
  type ResourceRecord,
} from '@/features/resources/api'

const endpoint = '/leave-requests/'
const statusValues = {
  pending: 1,
  approved: 2,
  rejected: 3,
} as const

function statusVariant(status: unknown) {
  if (status === 2) return 'success' as const
  if (status === 3) return 'destructive' as const
  return 'warning' as const
}

export function LeaveApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const query = useQuery({
    queryKey: ['workflow', 'leave-approvals', statusFilter],
    queryFn: () =>
      getResourceRecords(endpoint, {
        status: statusFilter === 'all' ? undefined : statusValues[statusFilter],
      }),
  })
  const [pendingQuery, approvedQuery, rejectedQuery] = useQueries({
    queries: [
      ['pending', statusValues.pending],
      ['approved', statusValues.approved],
      ['rejected', statusValues.rejected],
    ].map(([key, status]) => ({
      queryKey: ['workflow', 'leave-approvals-count', key],
      queryFn: () => getResourceRecords(endpoint, { status }),
      staleTime: 60_000,
    })),
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: number }) =>
      updateResourceRecord(endpoint, id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workflow', 'leave-approvals'] })
      await queryClient.invalidateQueries({ queryKey: ['workflow', 'leave-approvals-count'] })
      await queryClient.invalidateQueries({ queryKey: ['resource', 'leave-requests'] })
      notify({
        title: 'تم تحديث الطلب',
        message: 'تم تغيير حالة طلب الإجازة بنجاح.',
        variant: 'success',
      })
    },
    onError: () =>
      notify({
        title: 'تعذر تحديث الطلب',
        message: 'راجع اتصال الباك أو صلاحية البيانات.',
        variant: 'error',
      }),
  })

  const requests = query.data?.records ?? []
  const pendingCount = pendingQuery.data?.count ?? 0
  const approvedCount = approvedQuery.data?.count ?? 0
  const rejectedCount = rejectedQuery.data?.count ?? 0

  return (
    <div className="space-y-6">
      <section>
        <p className="text-label-md text-on-surface-variant">الإجازات</p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal text-on-surface">
          اعتماد طلبات الإجازة
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          شاشة تشغيلية سريعة لقبول أو رفض الطلبات المعلقة.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>المعلقة</CardTitle>
            <CardDescription>{pendingCount} طلب</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>المقبولة</CardTitle>
            <CardDescription>{approvedCount} طلب</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>المرفوضة</CardTitle>
            <CardDescription>{rejectedCount} طلب</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات الإجازة</CardTitle>
          <CardDescription>راجع الطلبات واتخذ القرار المناسب بسرعة.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              ['pending', 'المعلقة'],
              ['approved', 'المقبولة'],
              ['rejected', 'المرفوضة'],
              ['all', 'الكل'],
            ].map(([value, label]) => (
              <Button
                key={value}
                onClick={() => setStatusFilter(value as typeof statusFilter)}
                size="sm"
                type="button"
                variant={statusFilter === value ? 'default' : 'outline'}
              >
                {label}
              </Button>
            ))}
          </div>

          {query.isLoading && (
            <div className="py-12 text-center text-on-surface-variant">
              جار تحميل الطلبات...
            </div>
          )}

          {!query.isLoading && !requests.length && (
            <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-10 text-center text-on-surface-variant">
              لا توجد طلبات في هذا التصنيف.
            </div>
          )}

          <div className="grid gap-3">
            {requests.map((request: ResourceRecord) => (
              <div
                className="flex flex-col justify-between gap-3 rounded-md border border-outline-variant bg-card p-4 md:flex-row md:items-center"
                key={String(request.id)}
              >
                <div>
                  <p className="font-semibold text-on-surface">
                    {String(request.employee_name ?? 'موظف غير محدد')}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {String(request.leave_type_name ?? 'إجازة')} من{' '}
                    {String(request.start_day ?? '-')} إلى{' '}
                    {String(request.end_day ?? '-')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(request.status)}>
                    {String(request.status_name ?? 'في الانتظار')}
                  </Badge>
                  <Button
                    disabled={mutation.isPending || request.status === 2}
                    onClick={() =>
                      request.id && mutation.mutate({ id: request.id, status: 2 })
                    }
                    size="sm"
                    type="button"
                    variant="success"
                  >
                    <Check className="h-4 w-4" />
                    قبول
                  </Button>
                  <Button
                    disabled={mutation.isPending || request.status === 3}
                    onClick={() =>
                      request.id && mutation.mutate({ id: request.id, status: 3 })
                    }
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    <X className="h-4 w-4" />
                    رفض
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

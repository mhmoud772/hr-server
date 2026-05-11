import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Database,
  Download,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import {
  createResourceRecord,
  deleteResourceRecord,
  getResourceRecords,
  updateResourceRecord,
  type ResourceRecord,
} from '@/features/resources/api'
import { RecordDetails } from '@/features/resources/components/record-details'
import { ResourceForm } from '@/features/resources/components/resource-form'
import { getResourceByKey } from '@/features/resources/resource-config'

const groupLabels = {
  hr: 'الموارد البشرية',
  attendance: 'الحضور والبصمة',
  leaves: 'الإجازات',
  settings: 'الإعدادات',
} as const

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا'
  }

  if (Array.isArray(value)) {
    return value.length ? value.join('، ') : '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function getRecordKey(record: ResourceRecord, index: number) {
  return record.id ?? `${record.display ?? record.name ?? 'record'}-${index}`
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    return JSON.stringify(response?.data ?? error)
  }

  return 'حدث خطأ أثناء تنفيذ العملية.'
}

function renderCellValue(value: unknown) {
  if (typeof value === 'boolean') {
    return <Badge variant={value ? 'success' : 'muted'}>{value ? 'نعم' : 'لا'}</Badge>
  }

  return formatValue(value)
}

function ResourceSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="grid animate-pulse gap-3 rounded-lg border border-outline-variant p-4 md:grid-cols-5"
          key={index}
        >
          <div className="h-4 rounded bg-muted md:col-span-2" />
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function ResourcePage() {
  const { resourceKey } = useParams()
  const resource = getResourceByKey(resourceKey)
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ResourceRecord | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ResourceRecord | null>(null)
  const [detailsRecord, setDetailsRecord] = useState<ResourceRecord | null>(null)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const pageSize = 10

  const query = useQuery({
    queryKey: ['resource', resource?.key, page, searchTerm],
    queryFn: () =>
      getResourceRecords(resource!.endpoint, {
        page,
        pageSize,
        search: searchTerm || undefined,
      }),
    enabled: Boolean(resource),
    placeholderData: keepPreviousData,
  })

  const invalidateResource = async () => {
    await queryClient.invalidateQueries({ queryKey: ['resource', resource?.key] })
    await queryClient.invalidateQueries({ queryKey: ['dashboard-stat'] })
    await queryClient.invalidateQueries({ queryKey: ['relation-options'] })
  }

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      if (!resource) {
        throw new Error('Resource is not available')
      }

      if (editingRecord?.id) {
        return updateResourceRecord(resource.endpoint, editingRecord.id, payload)
      }

      return createResourceRecord(resource.endpoint, payload)
    },
    onSuccess: async () => {
      setFormOpen(false)
      setEditingRecord(null)
      setFormError(null)
      await invalidateResource()
      notify({
        title: editingRecord ? 'تم حفظ التعديل' : 'تمت الإضافة',
        message: `تم تحديث بيانات ${resource?.title ?? 'السجل'} بنجاح.`,
        variant: 'success',
      })
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setFormError(message)
      notify({
        title: 'تعذر الحفظ',
        message,
        variant: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => {
      if (!resource) {
        throw new Error('Resource is not available')
      }

      return deleteResourceRecord(resource.endpoint, id)
    },
    onSuccess: async () => {
      setDeleteTarget(null)
      await invalidateResource()
      notify({
        title: 'تم الحذف',
        message: 'تم حذف السجل بنجاح.',
        variant: 'success',
      })
    },
    onError: (error) => {
      notify({
        title: 'تعذر الحذف',
        message: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  if (!resource) {
    return <Navigate replace to="/" />
  }

  const Icon = resource.icon

  const openCreateForm = () => {
    setEditingRecord(null)
    setFormError(null)
    setFormOpen(true)
  }

  const openEditForm = (record: ResourceRecord) => {
    setEditingRecord(record)
    setFormError(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setEditingRecord(null)
    setFormError(null)
    setFormOpen(false)
  }

  const handleDelete = (record: ResourceRecord) => {
    if (!record.id) {
      return
    }

    setDeleteTarget(record)
  }

  const exportCsv = () => {
    const headers = resource.columns.map((column) => column.label)
    const rows = records.map((record) =>
      resource.columns.map((column) =>
        `"${formatValue(record[column.key]).replaceAll('"', '""')}"`,
      ),
    )
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${resource.key}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const records = query.data?.records ?? []
  const totalCount = query.data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(page, totalPages)

  return (
    <div className="space-y-6">
      <ConfirmDialog
        description={`سيتم حذف السجل من ${resource.title}. لا يمكن التراجع عن هذه العملية من الواجهة.`}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?.id) {
            deleteMutation.mutate(deleteTarget.id)
          }
        }}
        open={Boolean(deleteTarget)}
        title="تأكيد الحذف"
      />
      <RecordDetails
        onClose={() => setDetailsRecord(null)}
        open={Boolean(detailsRecord)}
        record={detailsRecord}
        title={resource.title}
      />

      <section className="rounded-xl border border-outline-variant bg-card p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-primary p-3 text-primary-foreground shadow-sm">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-label-md text-on-surface-variant">
                {groupLabels[resource.group]}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-normal text-on-surface">
                {resource.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                {resource.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={openCreateForm} type="button">
              <Plus className="h-4 w-4" />
              إضافة
            </Button>
            <Button
              disabled={query.isFetching}
              onClick={() => query.refetch()}
              type="button"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
            <p className="text-xs text-on-surface-variant">إجمالي السجلات</p>
            <p className="mt-1 text-xl font-bold">{query.data?.count ?? 0}</p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
            <p className="text-xs text-on-surface-variant">المعروض حالياً</p>
            <p className="mt-1 text-xl font-bold">{records.length}</p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
            <p className="text-xs text-on-surface-variant">حقول النموذج</p>
            <p className="mt-1 text-xl font-bold">{resource.formFields.length}</p>
          </div>
        </div>
      </section>

      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingRecord ? `تعديل ${resource.title}` : `إضافة ${resource.title}`}
            </CardTitle>
            <CardDescription>
              الحقول التي تحمل علامة * مطلوبة من الباك إند.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceForm
              editingRecord={editingRecord}
              errorMessage={formError}
              isSaving={saveMutation.isPending}
              onCancel={closeForm}
              onSubmit={(payload) => saveMutation.mutate(payload)}
              resource={resource}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="rounded-md bg-primary-fixed p-2 text-primary-fixed-foreground">
                <Icon className="h-5 w-5" />
              </span>
              {resource.title}
            </CardTitle>
            <CardDescription>
              {records.length} سجل ظاهر من أصل {query.data?.count ?? 0}.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {query.isLoading && <ResourceSkeleton />}

          {query.isError && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-md border border-destructive-container bg-destructive-container/40 p-6 text-center text-destructive-container-foreground">
              <AlertCircle className="h-8 w-8" />
              <p className="font-semibold">تعذر جلب البيانات من الباك إند.</p>
              <p className="text-sm">
                تأكد أن Django يعمل على المنفذ 8000 وأن المسار {resource.endpoint}{' '}
                متاح.
              </p>
            </div>
          )}

          {query.data && (
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pr-9"
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setPage(1)
                  }}
                  placeholder={`بحث داخل ${resource.title}`}
                  type="search"
                  value={searchTerm}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  disabled={!records.length}
                  onClick={exportCsv}
                  type="button"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>
                <div className="rounded-md bg-muted px-3 py-2 text-sm text-on-surface-variant">
                  الصفحة {currentPage} من {totalPages}
                </div>
              </div>
            </div>
          )}

          {query.data && !records.length && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-md border border-outline-variant bg-surface-container-low p-6 text-center text-on-surface-variant">
              <Database className="h-8 w-8" />
              <p className="font-semibold">لا توجد سجلات بعد.</p>
              <p className="max-w-md text-sm">
                ابدأ بإضافة أول سجل، وسيظهر هنا مباشرة مع إمكانية البحث والتعديل.
              </p>
              <Button onClick={openCreateForm} type="button">
                <Plus className="h-4 w-4" />
                إضافة أول سجل
              </Button>
            </div>
          )}

          {query.data && records.length > 0 && !records.length && (
            <div className="flex min-h-40 items-center justify-center rounded-md border border-outline-variant bg-surface-container-low p-6 text-center text-on-surface-variant">
              لا توجد نتائج مطابقة للبحث.
            </div>
          )}

          {query.data && records.length > 0 && (
            <>
              <div className="grid gap-3 md:hidden">
                {records.map((record, index) => (
                  <div
                    className="rounded-lg border border-outline-variant bg-card p-4 shadow-sm"
                    key={getRecordKey(record, index)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {formatValue(record[resource.columns[0]?.key])}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {resource.title}
                        </p>
                      </div>
                      <Button
                        onClick={() => setDetailsRecord(record)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        تفاصيل
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                      {resource.columns.slice(1, 4).map((column) => (
                        <div
                          className="flex items-center justify-between gap-3 text-sm"
                          key={column.key}
                        >
                          <span className="text-on-surface-variant">
                            {column.label}
                          </span>
                          <span className="max-w-40 truncate font-medium">
                            {renderCellValue(record[column.key])}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => openEditForm(record)}
                        type="button"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(record)}
                        type="button"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-md border border-outline-variant md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-surface-container text-on-surface-variant">
                      <tr>
                        {resource.columns.map((column) => (
                          <th
                            className="px-4 py-3 text-right font-semibold"
                            key={column.key}
                          >
                            {column.label}
                          </th>
                        ))}
                        <th className="w-32 px-4 py-3 text-right font-semibold">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant bg-card">
                      {records.map((record, index) => (
                        <tr
                          className="transition-colors hover:bg-surface-container-low"
                          key={getRecordKey(record, index)}
                        >
                          {resource.columns.map((column) => (
                            <td
                              className="max-w-[280px] truncate px-4 py-3 text-on-surface-variant"
                              key={column.key}
                              title={formatValue(record[column.key])}
                            >
                              {renderCellValue(record[column.key])}
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                            <Button
                              onClick={() => setDetailsRecord(record)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">تفاصيل</span>
                            </Button>
                            <Button
                              onClick={() => openEditForm(record)}
                              size="icon"
                              type="button"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">تعديل</span>
                              </Button>
                              <Button
                                disabled={deleteMutation.isPending}
                                onClick={() => handleDelete(record)}
                                size="icon"
                                type="button"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">حذف</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  عرض {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, records.length)} من{' '}
                  {records.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    type="button"
                    variant="outline"
                  >
                    السابق
                  </Button>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setPage((value) => Math.min(totalPages, value + 1))
                    }
                    type="button"
                    variant="outline"
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

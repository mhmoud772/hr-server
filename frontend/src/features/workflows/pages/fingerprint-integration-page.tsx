import { useMemo, useState } from 'react'
import axios from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Fingerprint,
  MapPin,
  Network,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react'

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
import { Select } from '@/components/ui/select'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ui/toast'

type LegacyDevice = {
  id: number
  name: string
  location: string
  ip_address: string
  port: number
  is_active: boolean
}

type LegacyDeviceResponse = {
  data: LegacyDevice[]
}

type PushPayload = {
  device_finger_print: number
  user_id: number
  timestamp: string
  status: string
}


const fingerprintSchema = z.object({
  device_finger_print: z.string().min(1, 'رقم الجهاز مطلوب'),
  user_id: z.string().min(1, 'رقم البصمة مطلوب'),
  timestamp: z.string().min(1, 'الوقت والتاريخ مطلوب'),
  status: z.string().min(1, 'الحالة مطلوبة'),
});

type FingerprintFormValues = z.infer<typeof fingerprintSchema>;

const punchStatusOptions = [
  { label: 'دخول', value: 'in' },
  { label: 'خروج', value: 'out' },
  { label: 'حالة أخرى', value: 'manual' },
]

const legacyClient = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

function currentDatetimeValue() {
  return new Date().toISOString().slice(0, 16)
}

function toApiTimestamp(value: string) {
  return value.length === 16 ? `${value}:00` : value
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    return JSON.stringify(response?.data ?? error)
  }

  return 'تعذر تنفيذ الطلب.'
}

function getStatusLabel(value: string) {
  return punchStatusOptions.find((option) => option.value === value)?.label ?? value
}

export function FingerprintIntegrationPage() {
  const { notify } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastSubmitted, setLastSubmitted] = useState<PushPayload | null>(null)
  const {
    control,
    register,
    handleSubmit,
  } = useForm<FingerprintFormValues>({
    resolver: zodResolver(fingerprintSchema),
    defaultValues: {
      device_finger_print: '',
      user_id: '',
      timestamp: currentDatetimeValue(),
      status: 'in',
    }
  })

  const [formDevice, formUserId, formStatus, formTimestamp] = useWatch({
    control,
    name: ['device_finger_print', 'user_id', 'status', 'timestamp'],
  })

  const devicesQuery = useQuery({
    queryKey: ['legacy-fingerprint-devices'],
    queryFn: async () => {
      const { data } = await legacyClient.get<LegacyDeviceResponse>('device')
      return data.data
    },
  })

  const activeDevices = useMemo(
    () => devicesQuery.data?.filter((device) => device.is_active).length ?? 0,
    [devicesQuery.data],
  )
  const totalDevices = devicesQuery.data?.length ?? 0
  const systemStatus = devicesQuery.isError
    ? {
        label: 'تعذر الفحص',
        description: 'لا يمكن الوصول إلى أجهزة البصمة حالياً',
        icon: WifiOff,
        tone: 'destructive' as const,
      }
    : activeDevices > 0
      ? {
          label: 'جاهز للفحص',
          description: `${activeDevices} جهاز نشط`,
          icon: Wifi,
          tone: 'success' as const,
        }
      : {
          label: 'بحاجة لإعداد',
          description: totalDevices ? 'لا توجد أجهزة نشطة' : 'لا توجد أجهزة مسجلة',
          icon: AlertCircle,
          tone: 'warning' as const,
        }
  const StatusIcon = systemStatus.icon
  const selectedDevice = useMemo(
    () =>
      devicesQuery.data?.find(
        (device) => String(device.id) === String(formDevice),
      ),
    [devicesQuery.data, formDevice],
  )

  const pushMutation = useMutation({
    mutationFn: async (payload: PushPayload) => {
      const { data } = await legacyClient.post('push', payload)
      return data
    },
    onSuccess: (_data, payload) => {
      setLastSubmitted(payload)
      setConfirmOpen(false)
      notify({
        title: 'تم تسجيل الاختبار',
        message: 'تم إنشاء سجل بصمة اختبار بنجاح.',
        variant: 'success',
      })
    },
    onError: (error) => {
      notify({
        title: 'فشل إرسال البصمة',
        message: getErrorMessage(error),
        variant: 'error',
      })
    },
  })

  const buildPayload = (): PushPayload => ({
      device_finger_print: Number(formDevice),
      user_id: Number(formUserId),
      timestamp: toApiTimestamp(formTimestamp),
      status: formStatus,
  })

  const submitPush = handleSubmit(() => {
    setConfirmOpen(true)
  })

  return (
    <div className="space-y-6">
      <ConfirmDialog
        description={
          selectedDevice
            ? `سيتم إنشاء سجل بصمة اختبار للجهاز ${selectedDevice.name}.`
            : 'سيتم إنشاء سجل بصمة اختبار.'
        }
        loading={pushMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => pushMutation.mutate(buildPayload())}
        open={confirmOpen}
        title="تأكيد إرسال الاختبار"
      />

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-primary p-3 text-primary-foreground shadow-sm">
              <Fingerprint className="h-6 w-6" />
            </span>
            <div>
              <p className="text-label-md text-muted-foreground">أجهزة الحضور</p>
              <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">
                فحص اتصال البصمة
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                راجع الأجهزة المسجلة وأرسل بصمة اختبار عند الحاجة للتأكد من أن الاستقبال يعمل.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-52 items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3">
              <span
                className={
                  systemStatus.tone === 'success'
                    ? 'rounded-full bg-success/15 p-2 text-success'
                    : systemStatus.tone === 'warning'
                      ? 'rounded-full bg-warning/15 p-2 text-warning'
                      : 'rounded-full bg-destructive/15 p-2 text-destructive'
                }
              >
                <StatusIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold">{systemStatus.label}</p>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.description}
                </p>
              </div>
            </div>
            <Button
              disabled={devicesQuery.isFetching}
              onClick={() => devicesQuery.refetch()}
              type="button"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3">
            <span className="rounded-md bg-primary-fixed p-2 text-primary-fixed-foreground">
              <Server className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي الأجهزة</p>
              <p className="mt-1 text-xl font-bold">{totalDevices}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3">
            <span className="rounded-md bg-success/15 p-2 text-success">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">الأجهزة النشطة</p>
              <p className="mt-1 text-xl font-bold">{activeDevices}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3">
            <span className="rounded-md bg-info/15 p-2 text-info">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">آخر اختبار</p>
              <p className="mt-1 text-xl font-bold">{lastSubmitted ? 'ناجح' : 'لم يتم'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              أجهزة البصمة
            </CardTitle>
            <CardDescription>الأجهزة المتاحة لاستقبال سجلات الحضور.</CardDescription>
          </CardHeader>
          <CardContent>
            {devicesQuery.isLoading && (
              <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                جاري تحميل الأجهزة...
              </div>
            )}

            {devicesQuery.isError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive-container bg-destructive-container/40 p-4 text-sm text-destructive-container-foreground">
                <AlertCircle className="h-5 w-5" />
                تعذر تحميل أجهزة البصمة.
              </div>
            )}

            {devicesQuery.data && devicesQuery.data.length === 0 && (
              <div className="rounded-lg border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
                لا توجد أجهزة بصمة مسجلة حالياً.
              </div>
            )}

            {devicesQuery.data && devicesQuery.data.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full min-w-[620px] text-sm">
                  <thead className="bg-card text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold">الجهاز</th>
                      <th className="px-4 py-3 text-right font-semibold">الموقع</th>
                      <th className="px-4 py-3 text-right font-semibold">العنوان</th>
                      <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {devicesQuery.data.map((device) => (
                      <tr className="transition-colors hover:bg-muted" key={device.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={
                                device.is_active
                                  ? 'h-2.5 w-2.5 rounded-full bg-success'
                                  : 'h-2.5 w-2.5 rounded-full bg-muted-foreground'
                              }
                            />
                            <div>
                              <p className="font-medium">{device.name}</p>
                              <p className="text-xs text-muted-foreground">
                                رقم الجهاز {device.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {device.location}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-mono text-xs">
                            <Network className="h-3.5 w-3.5" />
                            {device.ip_address}:{device.port}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={device.is_active ? 'success' : 'muted'}>
                            {device.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              إرسال بصمة اختبار
            </CardTitle>
            <CardDescription>استخدمها للتأكد من وصول سجلات الأجهزة إلى النظام.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <p className="text-muted-foreground">
                هذا الإجراء ينشئ سجل حضور اختباري، لذلك استخدم رقم بصمة مخصصاً للاختبار متى أمكن.
              </p>
            </div>

            <form className="space-y-4" onSubmit={submitPush}>
              <section className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </span>
                  <p className="font-semibold">اختر الجهاز</p>
                </div>
                <Select
                  {...register('device_finger_print')}
                  required
                >
                  <option value="">اختر جهازاً...</option>
                  {devicesQuery.data?.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </Select>
              </section>

              <section className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </span>
                  <p className="font-semibold">أدخل بيانات البصمة</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    <span>رقم البصمة</span>
                    <Input
                      min={1}
                      {...register('user_id')}
                      required
                      type="number"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium">
                    <span>الحالة</span>
                    <Select
                      {...register('status')}
                      required
                    >
                      {punchStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <label className="space-y-2 text-sm font-medium sm:col-span-2">
                    <span>الوقت والتاريخ</span>
                    <Input
                      {...register('timestamp')}
                      required
                      type="datetime-local"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-lg border border-primary/20 bg-primary-fixed p-4 text-sm">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    3
                  </span>
                  <p className="font-semibold text-primary-fixed-foreground">راجع الاختبار</p>
                </div>
                <div className="mt-3 grid gap-2 text-muted-foreground">
                  <div className="flex justify-between gap-3">
                    <span>الجهاز</span>
                    <span className="font-medium text-foreground">
                      {selectedDevice?.name ?? 'لم يتم الاختيار'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>رقم البصمة</span>
                    <span className="font-medium text-foreground">
                      {formUserId || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>الحالة</span>
                    <span className="font-medium text-foreground">
                      {getStatusLabel(formStatus)}
                    </span>
                  </div>
                </div>
              </section>

              <Button className="w-full" disabled={pushMutation.isPending} type="submit">
                <Send className="h-4 w-4" />
                إرسال الاختبار
              </Button>
            </form>

            {lastSubmitted && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <div>
                  <p className="font-semibold">آخر اختبار تم بنجاح</p>
                  <p className="mt-1 text-muted-foreground">
                    رقم البصمة {lastSubmitted.user_id} في {lastSubmitted.timestamp}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

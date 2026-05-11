import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api-client'

const passwordSchema = z.object({
  old_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  new_password: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  confirm_password: z.string().min(1, 'تأكيد كلمة المرور مطلوب')
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'كلمة المرور الجديدة غير متطابقة',
  path: ['confirm_password'],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

type PasswordModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
  const { notify } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { old_password: '', new_password: '', confirm_password: '' }
  })
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: PasswordFormValues) =>
      apiClient.post('/change-password/', payload),
    onSuccess: () => {
      onClose()
      reset()
      setError(null)
      notify({ title: 'تم التغيير', message: 'تم تغيير كلمة المرور بنجاح.', variant: 'success' })
    },
    onError: (err: unknown) => {
      const detail =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail ?? 'فشل تغيير كلمة المرور'
          : 'تعذر الاتصال بالخادم'
      setError(detail)
    },
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-popover p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold">تغيير كلمة المرور</p>
            <p className="mt-1 text-sm text-muted-foreground">
              أدخل كلمة المرور الحالية والجديدة.
            </p>
          </div>
          <Button
            onClick={() => { onClose(); setError(null); reset() }}
            size="icon"
            title="إغلاق"
            type="button"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form className="mt-5 space-y-3" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <div>
            <Input
              placeholder="كلمة المرور الحالية"
              type="password"
              {...register('old_password')}
            />
            {errors.old_password && <p className="mt-1 text-xs text-destructive">{errors.old_password.message}</p>}
          </div>
          <div>
            <Input
              placeholder="كلمة المرور الجديدة"
              type="password"
              {...register('new_password')}
            />
            {errors.new_password && <p className="mt-1 text-xs text-destructive">{errors.new_password.message}</p>}
          </div>
          <div>
            <Input
              placeholder="تأكيد كلمة المرور الجديدة"
              type="password"
              {...register('confirm_password')}
            />
            {errors.confirm_password && <p className="mt-1 text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>
          {error && (
            <div className="mt-3 rounded-md border border-destructive-container bg-destructive-container/40 p-3 text-sm text-destructive-container-foreground">
              {error}
            </div>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button
              onClick={() => { onClose(); setError(null); reset() }}
              type="button"
              variant="outline"
            >
              إلغاء
            </Button>
            <Button
              disabled={mutation.isPending}
              type="submit"
            >
              {mutation.isPending ? 'جار الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

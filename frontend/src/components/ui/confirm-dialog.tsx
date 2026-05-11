import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ConfirmDialogProps = {
  description: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
}

export function ConfirmDialog({
  description,
  loading = false,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-card p-5 shadow-elevated">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-destructive-container p-2 text-destructive-container-foreground">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-on-surface">{title}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={loading} onClick={onCancel} type="button" variant="outline">
            إلغاء
          </Button>
          <Button
            disabled={loading}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            حذف
          </Button>
        </div>
      </div>
    </div>
  )
}

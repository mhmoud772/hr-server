import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ResourceRecord } from '@/features/resources/api'

type RecordDetailsProps = {
  onClose: () => void
  open: boolean
  record: ResourceRecord | null
  title: string
}

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

export function RecordDetails({ onClose, open, record, title }: RecordDetailsProps) {
  if (!open || !record) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/45 backdrop-blur-sm">
      <aside className="absolute inset-y-0 left-0 flex w-full max-w-xl flex-col border-r border-outline-variant bg-card shadow-elevated">
        <header className="flex h-16 items-center justify-between border-b border-outline-variant px-5">
          <div>
            <p className="text-sm text-on-surface-variant">تفاصيل السجل</p>
            <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
          </div>
          <Button onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="h-5 w-5" />
            <span className="sr-only">إغلاق</span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <dl className="grid gap-3">
            {Object.entries(record).map(([key, value]) => (
              <div
                className="rounded-md border border-outline-variant bg-surface-container-lowest p-3"
                key={key}
              >
                <dt className="text-xs font-semibold text-on-surface-variant">
                  {key}
                </dt>
                <dd className="mt-1 break-words text-sm text-on-surface">
                  {formatValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  )
}

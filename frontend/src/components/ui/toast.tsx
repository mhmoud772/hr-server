/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  title: string
  variant: ToastVariant
}

type ToastContextValue = {
  notify: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const value = useMemo<ToastContextValue>(
    () => ({
      notify: (toast) => {
        const id = Date.now()
        setToasts((current) => [...current, { ...toast, id }])
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id))
        }, 4200)
      },
    }),
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 left-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = icons[toast.variant]

          return (
            <div
              className={cn(
                'flex items-start gap-3 rounded-lg border bg-card p-4 text-sm shadow-elevated',
                toast.variant === 'success' && 'border-secondary-container',
                toast.variant === 'error' && 'border-destructive-container',
                toast.variant === 'info' && 'border-outline-variant',
              )}
              key={toast.id}
            >
              <Icon
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  toast.variant === 'success' && 'text-success',
                  toast.variant === 'error' && 'text-destructive',
                  toast.variant === 'info' && 'text-primary',
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-on-surface">{toast.title}</p>
                <p className="mt-1 break-words text-on-surface-variant">
                  {toast.message}
                </p>
              </div>
              <Button
                onClick={() =>
                  setToasts((current) =>
                    current.filter((item) => item.id !== toast.id),
                  )
                }
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">إغلاق</span>
              </Button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}

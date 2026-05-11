import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface SlideOverProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: SlideOverProps) {
  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "relative z-50 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-outline-variant/30 bg-surface/90 shadow-2xl backdrop-blur-2xl transition-transform dark:bg-surface-variant/90 sm:w-[400px]",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-outline-variant/30 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-low text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">إغلاق</span>
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="relative flex-1 overflow-y-auto p-6 no-scrollbar">
          {children}
        </div>

        {/* Footer (Optional) */}
        {footer && (
          <div className="border-t border-outline-variant/30 bg-surface/50 p-6 backdrop-blur-xl dark:bg-surface-variant/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

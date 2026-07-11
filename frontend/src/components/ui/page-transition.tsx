import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageTransitionProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function PageTransition({ children, className, delay = 0 }: PageTransitionProps) {
  return (
    <div
      className={cn(
        'animate-[fadeSlideUp_0.4s_ease-out_both]',
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

type StaggerProps = {
  children: ReactNode
  className?: string
  staggerMs?: number
}

export function Stagger({ children, className, staggerMs = 60 }: StaggerProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className="animate-[fadeSlideUp_0.35s_ease-out_both]"
              style={{ animationDelay: `${index * staggerMs}ms` }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}

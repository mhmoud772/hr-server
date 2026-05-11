import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary-fixed text-primary-fixed-foreground',
        success: 'bg-secondary-container text-secondary-container-foreground',
        warning: 'bg-tertiary-fixed text-tertiary-fixed-variant',
        destructive: 'bg-destructive-container text-destructive-container-foreground',
        muted: 'bg-surface-container-high text-on-surface-variant',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  )
}

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        gold: 'bg-gold/15 text-gold border border-gold/30',
        success: 'bg-success/15 text-success-light border border-success/30',
        warning: 'bg-warning/15 text-warning-light border border-warning/30',
        danger: 'bg-danger/15 text-danger-light border border-danger/30',
        muted: 'bg-white/8 text-muted border border-white/10',
        white: 'bg-white/10 text-white border border-white/15',
        primary: 'bg-gold text-black border border-gold',
        outline: 'bg-transparent text-white border border-white/20',
      },
      size: {
        sm: 'px-2 py-0.5 text-2xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', {
            'bg-gold': variant === 'gold',
            'bg-success-light': variant === 'success',
            'bg-warning-light': variant === 'warning',
            'bg-danger-light': variant === 'danger',
            'bg-muted': variant === 'muted',
            'bg-white': variant === 'white' || variant === 'outline',
          })}
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }

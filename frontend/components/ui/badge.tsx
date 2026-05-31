import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Explicit union type — prevents TypeScript Type Overlap errors
export type BadgeVariant =
  | 'gold'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'white'
  | 'primary'
  | 'outline'

export type BadgeSize = 'sm' | 'md' | 'lg'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        gold: 'bg-[#C8A85D]/15 text-[#C8A85D] border border-[#C8A85D]/30',
        success: 'bg-[#1F8A4D]/15 text-[#27AE60] border border-[#1F8A4D]/30',
        warning: 'bg-[#D49A2A]/15 text-[#F0B429] border border-[#D49A2A]/30',
        danger: 'bg-[#C0392B]/15 text-[#E74C3C] border border-[#C0392B]/30',
        muted: 'bg-white/8 text-[#A0A0A0] border border-white/10',
        white: 'bg-white/10 text-white border border-white/15',
        primary: 'bg-[#C8A85D] text-black border border-[#C8A85D]',
        outline: 'bg-transparent text-white border border-white/20',
      } satisfies Record<BadgeVariant, string>,
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      } satisfies Record<BadgeSize, string>,
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
    },
  },
)

const dotColorMap: Record<BadgeVariant, string> = {
  gold: 'bg-[#C8A85D]',
  success: 'bg-[#27AE60]',
  warning: 'bg-[#F0B429]',
  danger: 'bg-[#E74C3C]',
  muted: 'bg-[#A0A0A0]',
  white: 'bg-white',
  primary: 'bg-black',
  outline: 'bg-white',
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  variant?: BadgeVariant
  size?: BadgeSize
}

function Badge({ className, variant = 'gold', size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dotColorMap[variant])}
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }

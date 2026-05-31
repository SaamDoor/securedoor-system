'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

export type ProgressVariant = 'gold' | 'success' | 'danger' | 'muted'

const variantClasses: Record<ProgressVariant, string> = {
  gold: 'bg-gradient-to-r from-[#C8A85D] via-[#E7D3A5] to-[#C8A85D]',
  success: 'bg-[#1F8A4D]',
  danger: 'bg-[#C0392B]',
  muted: 'bg-[#A0A0A0]',
}

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: ProgressVariant
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'gold', ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-white/10',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 transition-all duration-500', variantClasses[variant])}
      style={{ transform: `translateX(${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

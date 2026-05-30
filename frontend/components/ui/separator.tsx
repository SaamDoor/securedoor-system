'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '@/lib/utils'

interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: 'default' | 'gold' | 'gradient'
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = 'horizontal', decorative = true, variant = 'default', ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      variant === 'default' && 'bg-white/8',
      variant === 'gold' && 'bg-gold/30',
      variant === 'gradient' && orientation === 'horizontal' && [
        'border-0 bg-transparent',
        'bg-gradient-to-r from-transparent via-white/10 to-transparent',
      ],
      className,
    )}
    {...props}
  />
))

Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

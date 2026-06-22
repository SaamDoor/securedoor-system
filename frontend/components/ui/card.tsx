import * as React from 'react'
import { cn } from '@/lib/utils'

export type CardVariant = 'default' | 'glass' | 'bordered' | 'gold' | 'elevated'

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-[#181818] border border-white/8',
  glass: 'bg-[#181818]/80 backdrop-blur-xl border border-white/8',
  bordered: 'bg-transparent border border-white/15',
  gold: 'bg-[#181818] border border-[#C8A85D]/30 shadow-[0_2px_8px_rgba(200,168,93,0.15)]',
  elevated: 'bg-[#181818] border border-white/8 shadow-[0_10px_40px_rgba(0,0,0,0.6)]',
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl',
        variantClasses[variant],
        hoverable && [
          'transition-all duration-400 cursor-pointer',
          'hover:border-[#C8A85D]/30 hover:shadow-[0_4px_20px_rgba(200,168,93,0.25)]',
          'hover:-translate-y-1',
        ],
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-2 p-6', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-bold text-white leading-tight', className)}
      {...props}
    />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-[#A0A0A0] leading-relaxed', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-3 p-6 pt-0', className)}
      {...props}
    />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }


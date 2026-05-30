'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'gold' | 'elevated'
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => {
    const variants = {
      default: 'bg-surface border border-white/8',
      glass: 'bg-surface/80 backdrop-blur-xl border border-white/8',
      bordered: 'bg-transparent border border-white/15',
      gold: 'bg-surface border border-gold/30 shadow-gold-sm',
      elevated: 'bg-surface border border-white/8 shadow-luxury-sm',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          variants[variant],
          hoverable && [
            'transition-all duration-400 ease-luxury cursor-pointer',
            'hover:border-gold/30 hover:shadow-gold hover:-translate-y-1',
          ],
          className,
        )}
        {...props}
      />
    )
  },
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

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted leading-relaxed', className)} {...props} />
  ),
)

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

const MotionCard = motion.create(
  React.forwardRef<HTMLDivElement, CardProps>(
    (props, ref) => <Card ref={ref} {...props} />,
  ),
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MotionCard }

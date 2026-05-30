'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-xl',
    'transition-all duration-300 ease-luxury',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        gold: [
          'bg-gold-gradient text-black shadow-gold',
          'hover:shadow-gold-lg hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        'gold-outline': [
          'border border-gold-400 text-gold bg-transparent',
          'hover:bg-gold/10 hover:shadow-gold',
          'active:scale-[0.98]',
        ],
        dark: [
          'bg-surface border border-white/8 text-white',
          'hover:border-gold/30 hover:bg-surface-gradient',
          'active:scale-[0.98]',
        ],
        ghost: [
          'text-muted hover:text-white hover:bg-white/5',
          'active:scale-[0.98]',
        ],
        danger: [
          'bg-danger text-white',
          'hover:bg-danger-light hover:shadow-[0_4px_20px_rgba(192,57,43,0.4)]',
          'active:scale-[0.98]',
        ],
        success: [
          'bg-success text-white',
          'hover:bg-success-light',
          'active:scale-[0.98]',
        ],
        link: [
          'text-gold underline-offset-4 hover:underline p-0 h-auto',
          'font-medium',
        ],
      },
      size: {
        xs: 'h-7 px-3 text-xs rounded-lg',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-13 px-8 text-lg',
        xl: 'h-15 px-10 text-xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  },
)

Button.displayName = 'Button'

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

const MotionButton = motion.create(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => <Button ref={ref} {...props} />,
  ),
)

export { Button, MotionButton, buttonVariants }

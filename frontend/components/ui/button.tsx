'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-xl',
    'transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A85D]',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        gold: [
          'bg-gradient-to-r from-[#C8A85D] via-[#E7D3A5] to-[#C8A85D]',
          'text-black font-bold',
          'shadow-[0_4px_20px_rgba(200,168,93,0.25)]',
          'hover:shadow-[0_8px_40px_rgba(200,168,93,0.35)] hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        'gold-outline': [
          'border border-[#C8A85D] text-[#C8A85D] bg-transparent',
          'hover:bg-[#C8A85D]/10 hover:shadow-[0_4px_20px_rgba(200,168,93,0.25)]',
          'active:scale-[0.98]',
        ],
        dark: [
          'bg-[#181818] border border-white/8 text-white',
          'hover:border-[#C8A85D]/30',
          'active:scale-[0.98]',
        ],
        ghost: [
          'text-[#A0A0A0] hover:text-white hover:bg-white/5',
          'active:scale-[0.98]',
        ],
        danger: [
          'bg-[#C0392B] text-white',
          'hover:bg-[#E74C3C]',
          'active:scale-[0.98]',
        ],
        success: [
          'bg-[#1F8A4D] text-white',
          'hover:bg-[#27AE60]',
          'active:scale-[0.98]',
        ],
        link: [
          'text-[#C8A85D] underline-offset-4 hover:underline p-0 h-auto',
          'font-medium rounded-none',
        ],
      },
      size: {
        xs: 'h-7 px-3 text-xs rounded-lg',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-13 px-8 text-lg',
        xl: 'h-14 px-10 text-xl',
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
      aria-hidden="true"
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

export { Button, buttonVariants }

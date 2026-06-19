'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-2xl',
    'transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        gold: [
          'bg-gradient-to-r from-[#C41E3A] via-[#E8506A] to-[#C41E3A]',
          'text-white font-bold',
          'shadow-lg shadow-[rgba(196,30,58,0.3)]',
          'hover:shadow-xl hover:shadow-[rgba(196,30,58,0.4)] hover:scale-[1.02]',
          'active:scale-95',
        ],
        'gold-outline': [
          'border border-[#C41E3A] text-[#C41E3A] bg-transparent',
          'hover:bg-[#C41E3A]/10 hover:shadow-lg hover:shadow-[rgba(196,30,58,0.2)]',
          'active:scale-95',
        ],
        dark: [
          'bg-[#27272A] border border-white/8 text-white',
          'hover:border-[#C41E3A]/30 hover:shadow-lg',
          'active:scale-95',
        ],
        ghost: [
          'text-[#A1A1AA] hover:text-white hover:bg-white/5',
          'active:scale-95',
        ],
        danger: [
          'bg-[#DC2626] text-white shadow-lg shadow-red-900/30',
          'hover:bg-[#EF4444] hover:shadow-xl',
          'active:scale-95',
        ],
        success: [
          'bg-[#15803D] text-white shadow-lg shadow-green-900/30',
          'hover:bg-[#22C55E] hover:shadow-xl',
          'active:scale-95',
        ],
        link: [
          'text-[#C41E3A] underline-offset-4 hover:underline p-0 h-auto',
          'font-medium rounded-none',
        ],
      },
      size: {
        xs:       'h-7 px-3 text-xs rounded-xl',
        sm:       'h-9 px-4 text-sm',
        md:       'h-11 px-6 text-base',
        lg:       'h-13 px-8 text-lg',
        xl:       'h-14 px-10 text-xl',
        icon:     'h-11 w-11 rounded-2xl',
        'icon-sm': 'h-8 w-8 rounded-xl',
        'icon-lg': 'h-12 w-12 rounded-2xl',
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

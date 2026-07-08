'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold select-none',
    'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/60',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'disabled:pointer-events-none disabled:opacity-40 disabled:scale-100',
  ].join(' '),
  {
    variants: {
      variant: {
        /* ── Primary — Luxury Crimson ── */
        gold: [
          'bg-gradient-to-b from-[#D42B47] via-[#C41E3A] to-[#A51830]',
          'text-white font-bold',
          'shadow-[0_4px_24px_rgba(196,30,58,0.40),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-2px_0_rgba(0,0,0,0.18)]',
          'hover:shadow-[0_8px_36px_rgba(196,30,58,0.55),inset_0_1px_0_rgba(255,255,255,0.28)] hover:scale-[1.03] hover:from-[#E03050] hover:via-[#D42B47]',
          'active:scale-[0.97] active:shadow-[0_2px_10px_rgba(196,30,58,0.30),inset_0_2px_0_rgba(0,0,0,0.12)]',
        ],
        /* ── Outline ── */
        'gold-outline': [
          'border-2 border-[#C41E3A] text-[#C41E3A] bg-transparent',
          'shadow-[0_0_0_0_rgba(196,30,58,0),inset_0_1px_0_rgba(196,30,58,0.08)]',
          'hover:bg-[#C41E3A]/10 hover:shadow-[0_4px_24px_rgba(196,30,58,0.30)] hover:scale-[1.02]',
          'active:scale-[0.97]',
        ],
        /* ── Dark / Surface ── */
        dark: [
          'bg-gradient-to-b from-zinc-700/90 to-zinc-800',
          'border border-white/[0.08] text-white',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.3)]',
          'hover:border-[#C41E3A]/40 hover:from-zinc-600/90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:scale-[1.01]',
          'active:scale-[0.98]',
        ],
        /* ── Ghost ── */
        ghost: [
          'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]',
          'hover:scale-[1.01]',
          'active:scale-[0.98]',
        ],
        /* ── Danger ── */
        danger: [
          'bg-gradient-to-b from-red-500 to-red-600 text-white',
          'shadow-[0_4px_18px_rgba(239,68,68,0.40),inset_0_1px_0_rgba(255,255,255,0.2)]',
          'hover:from-red-400 hover:shadow-[0_8px_28px_rgba(239,68,68,0.55)] hover:scale-[1.02]',
          'active:scale-[0.97]',
        ],
        /* ── Success ── */
        success: [
          'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white',
          'shadow-[0_4px_18px_rgba(16,185,129,0.40),inset_0_1px_0_rgba(255,255,255,0.2)]',
          'hover:from-emerald-400 hover:shadow-[0_8px_28px_rgba(16,185,129,0.55)] hover:scale-[1.02]',
          'active:scale-[0.97]',
        ],
        /* ── Link ── */
        link: [
          'text-[#C41E3A] underline-offset-4 hover:underline p-0 h-auto',
          'font-medium rounded-none shadow-none',
          'hover:scale-100',
        ],
      },
      size: {
        xs:        'h-7 px-3 text-xs rounded-xl',
        sm:        'h-9 px-5 text-sm rounded-full',
        md:        'h-11 px-7 text-base rounded-full',
        lg:        'h-[52px] px-9 text-lg rounded-full',
        xl:        'h-14 px-12 text-xl rounded-full',
        icon:      'h-11 w-11 rounded-2xl',
        'icon-sm': 'h-8  w-8  rounded-xl',
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
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const classes = cn(buttonVariants({ variant, size, className }))

    // Slot (asChild) merges props onto its single child. Wrapping children in a
    // Fragment would forward className onto React.Fragment and crash.
    let content: React.ReactNode = children
    if (loading) {
      content = (
        <>
          <LoadingSpinner />
          {children}
        </>
      )
    } else if (leftIcon || rightIcon) {
      content = (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )
    }

    if (asChild) {
      if (loading || leftIcon || rightIcon) {
        console.warn(
          '[Button] asChild ignores loading/leftIcon/rightIcon — wrap icons inside the child element instead.',
        )
      }
      return (
        <Comp ref={ref} className={classes} {...props}>
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export { Button, buttonVariants }

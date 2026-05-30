'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? React.useId()

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-muted"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'w-full h-11 rounded-xl px-4 py-3',
              'bg-white/5 border border-white/10',
              'text-white placeholder:text-muted-foreground text-sm',
              'transition-all duration-250 ease-smooth',
              'focus:outline-none focus:border-gold focus:bg-white/8',
              'focus:ring-2 focus:ring-gold/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'autofill:bg-surface',
              leftIcon && 'pr-10',
              rightIcon && 'pl-10',
              error && 'border-danger focus:border-danger focus:ring-danger/20',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 text-muted',
                onRightIconClick && 'cursor-pointer hover:text-white transition-colors',
              )}
              onClick={onRightIconClick}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger flex items-center gap-1">
            <span>⚠</span>
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-muted">{hint}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? React.useId()

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-muted">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl px-4 py-3 min-h-[120px]',
            'bg-white/5 border border-white/10',
            'text-white placeholder:text-muted-foreground text-sm',
            'transition-all duration-250 ease-smooth resize-y',
            'focus:outline-none focus:border-gold focus:bg-white/8',
            'focus:ring-2 focus:ring-gold/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-danger focus:border-danger',
            className,
          )}
          {...props}
        />

        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

export { Input, Textarea }

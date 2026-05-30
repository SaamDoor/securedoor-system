'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toPersianNumber } from '@/lib/utils'

interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  showCount?: boolean
  count?: number
  className?: string
  interactive?: boolean
  onChange?: (value: number) => void
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count = 0,
  className,
  interactive = false,
  onChange,
}: RatingProps) {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(value)
          const partial = !filled && i < value

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => onChange?.(i + 1)}
              className={cn(
                'relative flex-shrink-0',
                interactive && 'cursor-pointer hover:scale-110 transition-transform',
                !interactive && 'pointer-events-none',
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  'transition-colors',
                  filled
                    ? 'fill-gold text-gold'
                    : partial
                      ? 'fill-gold/40 text-gold/40'
                      : 'fill-muted/20 text-muted/30',
                )}
              />
            </button>
          )
        })}
      </div>

      {showValue && (
        <span className={cn('font-semibold text-gold', textSizes[size])}>
          {toPersianNumber(value.toFixed(1))}
        </span>
      )}

      {showCount && count > 0 && (
        <span className={cn('text-muted', textSizes[size])}>
          ({toPersianNumber(count)} نظر)
        </span>
      )}
    </div>
  )
}

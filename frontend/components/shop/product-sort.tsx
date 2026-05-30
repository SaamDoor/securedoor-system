'use client'

import { ChevronDown } from 'lucide-react'
import { SORT_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ProductSortProps {
  value: string
  onChange: (value: string) => void
}

export function ProductSort({ value, onChange }: ProductSortProps) {
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'appearance-none h-9 pr-3 pl-8 rounded-xl text-sm',
          'bg-surface border border-white/8',
          'text-white cursor-pointer',
          'focus:outline-none focus:border-gold',
          'hover:border-white/20 transition-colors',
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-surface">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
    </div>
  )
}

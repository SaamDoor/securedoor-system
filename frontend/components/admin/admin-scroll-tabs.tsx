'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface AdminScrollTabItem {
  id: string
  label: string
  icon: React.ElementType
  hasError?: boolean
}

interface AdminScrollTabsProps {
  tabs: AdminScrollTabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

/**
 * Touch-friendly horizontal tab strip for admin forms.
 * Auto-scrolls the active tab into view on mobile/tablet.
 */
export function AdminScrollTabs({
  tabs,
  activeId,
  onChange,
  className,
}: AdminScrollTabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const btn = activeRef.current
    const scroller = scrollerRef.current
    if (!btn || !scroller) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    btn.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [activeId])

  return (
    <div className={cn('relative mb-6 sm:mb-8', className)}>
      {/* Edge fades hint horizontal scroll on narrow screens */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-r-2xl bg-gradient-to-l from-zinc-900 to-transparent sm:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 rounded-l-2xl bg-gradient-to-r from-zinc-900 to-transparent sm:hidden"
      />

      <div
        ref={scrollerRef}
        role="tablist"
        className={cn(
          'flex items-center gap-1 p-1.5 rounded-2xl',
          'bg-zinc-900/90 border border-white/8',
          'overflow-x-auto overscroll-x-contain hide-scrollbar',
          'snap-x snap-mandatory scroll-px-2',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
          '-mx-1 px-1 sm:mx-0 sm:px-1.5',
        )}
      >
        {tabs.map(({ id, label, icon: Icon, hasError }) => {
          const isActive = activeId === id
          return (
            <button
              key={id}
              ref={isActive ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 snap-start',
                'min-h-10 px-3.5 py-2.5 sm:min-h-0 sm:px-3 sm:py-2',
                'rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap',
                'active:scale-[0.98]',
                isActive
                  ? 'bg-gold text-black shadow-gold-sm'
                  : 'text-muted hover:text-white hover:bg-white/5',
                hasError && !isActive && 'text-red-400',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
              {hasError && !isActive && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

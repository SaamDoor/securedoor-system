'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ─── Context to share active value for sliding indicator ─── */
const ActiveTabCtx = React.createContext<string | undefined>(undefined)

/* ─── Tabs Root — syncs active state to context ─── */
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ value, defaultValue, onValueChange, children, ...props }, ref) => {
  const [active, setActive] = React.useState<string | undefined>(value ?? defaultValue)

  React.useEffect(() => {
    if (value !== undefined) setActive(value)
  }, [value])

  return (
    <ActiveTabCtx.Provider value={active}>
      <TabsPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(v) => { setActive(v); onValueChange?.(v) }}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </ActiveTabCtx.Provider>
  )
})
Tabs.displayName = 'Tabs'

/* ─── TabsList — iOS Segmented Control container ─── */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'relative inline-flex items-center gap-1 p-1.5',
      'rounded-2xl',
      /* pill tray — inset shadow for "sunken" feel */
      'bg-zinc-900/80 border border-white/[0.06]',
      'shadow-[inset_0_2px_8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(0,0,0,0.3)]',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/* ─── TabsTrigger — with Framer Motion sliding indicator ─── */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, children, ...props }, ref) => {
  const active = React.useContext(ActiveTabCtx)
  const isActive = active === value

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap',
        'rounded-xl px-5 py-2 text-sm font-semibold z-10',
        'cursor-pointer select-none',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900',
        'disabled:pointer-events-none disabled:opacity-40',
        isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200',
        className,
      )}
      {...props}
    >
      {/* Sliding capsule indicator — animated via Framer Motion layoutId */}
      {isActive && (
        <motion.span
          layoutId="segmented-indicator"
          className={cn(
            'absolute inset-0 rounded-xl z-[-1]',
            'bg-gradient-to-b from-zinc-600/90 to-zinc-700',
            'shadow-[0_1px_8px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.15)]',
          )}
          aria-hidden
          transition={{ type: 'spring', bounce: 0.18, duration: 0.38 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/* ─── TabsContent ─── */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/40',
      'data-[state=inactive]:animate-none',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'right' | 'center' | 'left'
  className?: string
  titleClassName?: string
  animate?: boolean
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'right',
  className,
  titleClassName,
  animate = true,
}: SectionHeaderProps) {
  const alignClass = {
    right: 'text-right',
    center: 'text-center mx-auto',
    left: 'text-left',
  }[align]

  const Wrapper = animate ? motion.div : 'div'
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
      }
    : {}

  return (
    <Wrapper
      className={cn('max-w-2xl', alignClass, className)}
      {...animProps}
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-gold text-sm font-semibold tracking-widest uppercase">
            {eyebrow}
          </span>
          <div className="h-px w-8 bg-gold" />
        </div>
      )}

      <h2
        className={cn(
          'section-title mb-4',
          titleClassName,
        )}
      >
        {title}
      </h2>

      {description && (
        <p className="section-subtitle">{description}</p>
      )}
    </Wrapper>
  )
}

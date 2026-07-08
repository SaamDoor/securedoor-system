'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/utils'

export type LogoVariant =
  | 'default'      // لوگو طلایی روی پس‌زمینه تیره (هدر، ناوبار)
  | 'gold'         // نسخه طلایی کامل (footer تاریک، splash)
  | 'light'        // نسخه روشن برای پس‌زمینه‌های سفید / روشن
  | 'admin'        // نسخه فشرده برای سایدبار ادمین
  | 'icon-only'    // فقط آیکون (موبایل، favicon-like)

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  variant?: LogoVariant
  size?: LogoSize
  href?: string | false   // false = بدون لینک
  className?: string
  showTagline?: boolean   // نمایش "گروه صنعتی مشعوف" زیر لوگو
}

const sizeMap: Record<LogoSize, { icon: number; text: string; sub: string }> = {
  xs: { icon: 28,  text: 'text-base',  sub: 'text-[8px]' },
  sm: { icon: 32,  text: 'text-lg',    sub: 'text-[9px]' },
  md: { icon: 40,  text: 'text-xl',    sub: 'text-2xs'   },
  lg: { icon: 52,  text: 'text-2xl',   sub: 'text-xs'    },
  xl: { icon: 72,  text: 'text-4xl',   sub: 'text-sm'    },
}

// Variant → whether to use gold SVG or default SVG
const usesGoldSvg: Record<LogoVariant, boolean> = {
  default: false,
  gold: true,
  light: false,
  admin: false,
  'icon-only': false,
}

// Text color per variant
const textColorMap: Record<LogoVariant, { name: string; tagline: string }> = {
  default:    { name: 'text-white',        tagline: 'text-gold'          },
  gold:       { name: 'text-gold',         tagline: 'text-gold-light'    },
  light:      { name: 'text-deep-black',   tagline: 'text-deep-black/70' },
  admin:      { name: 'text-white',        tagline: 'text-gold'          },
  'icon-only':{ name: '',                  tagline: ''                   },
}

function LogoContent({ variant = 'default', size = 'md', showTagline = false }: Omit<LogoProps, 'href' | 'className'>) {
  const s = sizeMap[size]
  const isGold = usesGoldSvg[variant]
  const colors = textColorMap[variant]
  const iconSize = s.icon

  if (variant === 'icon-only') {
    return (
      <div
        style={{ width: iconSize, height: iconSize }}
        className="relative flex-shrink-0"
      >
        <Image
          src={isGold ? '/logo-gold.svg' : '/logo.svg'}
          alt="گروه صنعتی مشعوف"
          width={iconSize}
          height={iconSize}
          priority
          className="object-contain"
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2.5', variant === 'admin' && 'gap-2')}>
      {/* آیکون لوگو */}
      <div
        style={{ width: iconSize, height: iconSize }}
        className="relative flex-shrink-0"
      >
        <Image
          src={isGold ? '/logo-gold.svg' : '/logo.svg'}
          alt="گروه صنعتی مشعوف"
          width={iconSize}
          height={iconSize}
          priority
          className="object-contain"
        />
      </div>

      {/* متن لوگو */}
      <div className="flex flex-col leading-none">
        <span className={cn('font-black tracking-tight leading-none', s.text, colors.name)}>
          مشعوف
        </span>
        <span className={cn('font-medium tracking-widest leading-none mt-0.5 uppercase', s.sub, colors.tagline)}>
          {BRAND.english}
        </span>
        {showTagline && (
          <span className={cn('font-normal mt-1 leading-none', s.sub, colors.tagline)}>
            گروه صنعتی مشعوف
          </span>
        )}
      </div>
    </div>
  )
}

export function Logo({ variant = 'default', size = 'md', href = '/', className, showTagline }: LogoProps) {
  const content = <LogoContent variant={variant} size={size} showTagline={showTagline} />

  if (href === false) {
    return <div className={cn('inline-flex items-center', className)}>{content}</div>
  }

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center',
        'transition-opacity duration-200 hover:opacity-85',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg',
        className,
      )}
      aria-label="صفحه اصلی گروه صنعتی مشعوف"
    >
      {content}
    </Link>
  )
}

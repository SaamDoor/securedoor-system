import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  amount: number,
  currency: string = 'تومان',
  options?: { compact?: boolean },
): string {
  if (options?.compact) {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)} میلیارد ${currency}`
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)} میلیون ${currency}`
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(0)} هزار ${currency}`
    }
  }

  try {
    const formatted = new Intl.NumberFormat('fa-IR').format(amount)
    return `${formatted} ${currency}`
  } catch {
    return `${amount.toLocaleString()} ${currency}`
  }
}

export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

export function toEnglishNumber(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

export function formatJalaliDate(
  dateString: string,
  options?: {
    format?: 'short' | 'long' | 'relative'
    includeTime?: boolean
  },
): string {
  try {
    const date = new Date(dateString)
    const now = new Date()

    if (options?.format === 'relative') {
      const diffMs = now.getTime() - date.getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      const diffMins = Math.floor(diffSecs / 60)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffSecs < 60) return 'لحظاتی پیش'
      if (diffMins < 60) return `${toPersianNumber(diffMins)} دقیقه پیش`
      if (diffHours < 24) return `${toPersianNumber(diffHours)} ساعت پیش`
      if (diffDays < 7) return `${toPersianNumber(diffDays)} روز پیش`
    }

    const jalaliFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: options?.format === 'long' ? 'long' : '2-digit',
      day: '2-digit',
      ...(options?.includeTime && {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })

    return jalaliFormatter.format(date)
  } catch {
    return dateString
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w؀-ۿ-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/** Prefer ASCII/SKU slugs for stable storefront URLs. */
export function productSlugFromName(name: string, sku?: string): string {
  const base = slugify(name)
  const hasAscii = /[a-z0-9]/.test(base)
  if (hasAscii) {
    return base
      .replace(/[؀-ۿ]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  const cleanSku = (sku || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleanSku ? `p-${cleanSku}` : `product-${Date.now().toString(36)}`
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '۰ بایت'
  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${toPersianNumber(parseFloat((bytes / Math.pow(k, i)).toFixed(2)))} ${sizes[i]}`
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `SD-${timestamp}-${random}`
}

export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone
  return phone.slice(0, 4) + '***' + phone.slice(-3)
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const maskedLocal = local.length > 2 ? local[0] + '***' + local.slice(-1) : '***'
  return `${maskedLocal}@${domain}`
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function isValidIranPhone(phone: string): boolean {
  const cleaned = toEnglishNumber(phone).replace(/\D/g, '')
  return /^09[0-9]{9}$/.test(cleaned)
}

/** Normalize phone to 11-digit Iranian format (09XXXXXXXXX) */
export function normalizePhone(phone: string): string {
  const digits = toEnglishNumber(phone).replace(/\D/g, '')
  if (digits.startsWith('98') && digits.length === 12) return '0' + digits.slice(2)
  if (digits.startsWith('9') && digits.length === 10) return '0' + digits
  return digits
}

/**
 * Derive a stable internal email from a phone number for Supabase Auth.
 * Supabase requires a valid-format email; we map phone → fake-but-valid email.
 * The domain mashuf.auth.local is never reachable — no email is ever sent to it.
 * NOTE: must use a TLD Supabase accepts (.com / .net / etc.) — .internal is rejected.
 */
export function phoneToAuthEmail(phone: string): string {
  const digits = normalizePhone(phone).replace(/\D/g, '')
  return `ph_${digits}@mashuf.com`
}

export function isValidNationalId(id: string): boolean {
  const cleaned = toEnglishNumber(id).replace(/\D/g, '')
  if (cleaned.length !== 10) return false
  if (/^(.)\1+$/.test(cleaned)) return false
  const digits = cleaned.split('').map(Number)
  const checkDigit = digits[9]
  const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0)
  const remainder = sum % 11
  return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

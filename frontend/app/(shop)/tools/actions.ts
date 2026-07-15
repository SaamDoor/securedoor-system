'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function toEnglishDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

function normalizePhone(raw: string): string | null {
  const digits = toEnglishDigits(raw).replace(/\D/g, '')
  if (/^09\d{9}$/.test(digits)) return digits
  if (/^9\d{9}$/.test(digits)) return `0${digits}`
  if (/^989\d{9}$/.test(digits)) return `0${digits.slice(2)}`
  return null
}

/** Best-effort phone capture. Never blocks report download on the client. */
export async function saveToolsLeadPhoneAction(input: {
  phone: string
  source?: string
  tool?: string
}) {
  const normalized = normalizePhone(input.phone)
  if (!normalized) {
    return {
      ok: false as const,
      reason: 'invalid_phone' as const,
      error: 'شماره موبایل معتبر وارد کنید (مثال: 09121234567)',
    }
  }

  const tool = input.tool ?? 'materials-calculator'
  const payload = {
    name: 'کاربر ابزار مهندسی',
    email: `${normalized}@tools.local`,
    phone: normalized,
    subject: `درخواست گزارش ابزار: ${tool}`,
    message: `منبع: ${input.source ?? 'tools'} — فقط شماره تماس ذخیره شد.`,
    is_read: false,
    is_replied: false,
  }

  try {
    // Prefer admin client so RLS/auth never blocks lead capture
    try {
      const admin = createAdminClient()
      const { error } = await admin.from('contact_messages').insert(payload)
      if (error) throw error
      return { ok: true as const, reason: 'saved' as const }
    } catch (adminErr) {
      console.warn('[tools-lead] admin insert fallback', adminErr)
      const supabase = await createClient()
      const { error } = await supabase.from('contact_messages').insert(payload)
      if (error) throw error
      return { ok: true as const, reason: 'saved' as const }
    }
  } catch (e) {
    console.error('[tools-lead]', e)
    return {
      ok: false as const,
      reason: 'save_failed' as const,
      error: e instanceof Error ? e.message : 'ثبت شماره ناموفق بود',
    }
  }
}

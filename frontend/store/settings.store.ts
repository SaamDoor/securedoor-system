/**
 * Global Dynamic Settings Store
 *
 * Single source of truth for all values managed by the Super Admin's
 * "Global Settings Manager". Components read from this store instead of
 * hardcoding strings — the store is hydrated once at app boot and updated
 * optimistically when the Super Admin saves a change.
 *
 * Usage (reading):
 *   const heroTitle = useSettingsStore(s => s.get('hero_title'))
 *
 * Usage (updating, super_admin only):
 *   await useSettingsStore.getState().update('hero_title', 'نام جدید')
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { SettingKey, SettingsMap } from '@/types/dashboard'
import { SETTINGS_DEFAULTS } from '@/types/dashboard'
import {
  fetchPublicSettings,
  fetchAllSettings,
  updateSetting,
  buildSettingsMap,
} from '@/lib/supabase/settings'

// ─────────────────────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface SettingsState {
  /** Flat key→value map, used by components for O(1) reads */
  map:      SettingsMap
  isLoaded: boolean
  isLoading: boolean
  error:    string | null

  /**
   * Type-safe getter with fallback to SETTINGS_DEFAULTS.
   * Accepts an optional explicit fallback for one-off overrides.
   */
  get<K extends SettingKey>(key: K, fallback?: SettingsMap[K]): SettingsMap[K]

  /**
   * Load public settings (safe for any page, including SSG-backed pages).
   * Call from a top-level Provider component.
   */
  loadPublic(): Promise<void>

  /**
   * Load ALL settings including private ones.
   * Call only from admin/super-admin protected routes.
   */
  loadAll(): Promise<void>

  /**
   * Optimistically update a key in the store, then persist to Supabase.
   * Rolls back on DB error. super_admin RLS enforced server-side.
   */
  update<K extends SettingKey>(key: K, value: SettingsMap[K]): Promise<void>

  /** Hard-reset (e.g. after sign-out) */
  reset(): void
}

// ─────────────────────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector((set, get) => ({
    map:       { ...SETTINGS_DEFAULTS },
    isLoaded:  false,
    isLoading: false,
    error:     null,

    get(key, fallback) {
      const val = get().map[key]
      if (val !== undefined && val !== null && val !== '') {
        return val as SettingsMap[typeof key]
      }
      return (fallback ?? SETTINGS_DEFAULTS[key]) as SettingsMap[typeof key]
    },

    async loadPublic() {
      if (get().isLoaded || get().isLoading) return
      set({ isLoading: true, error: null })
      try {
        const records = await fetchPublicSettings()
        set({
          map:       { ...SETTINGS_DEFAULTS, ...buildSettingsMap(records) },
          isLoaded:  true,
          isLoading: false,
        })
      } catch (err) {
        set({
          isLoading: false,
          error:     err instanceof Error ? err.message : 'Failed to load settings',
        })
      }
    },

    async loadAll() {
      set({ isLoading: true, error: null })
      try {
        const records = await fetchAllSettings()
        set({
          map:       { ...SETTINGS_DEFAULTS, ...buildSettingsMap(records) },
          isLoaded:  true,
          isLoading: false,
        })
      } catch (err) {
        set({
          isLoading: false,
          error:     err instanceof Error ? err.message : 'Failed to load settings',
        })
      }
    },

    async update(key, value) {
      // Optimistic update
      const previous = get().map[key]
      set((s) => ({ map: { ...s.map, [key]: value } }))
      try {
        await updateSetting(key, value)
      } catch (err) {
        // Roll back
        set((s) => ({ map: { ...s.map, [key]: previous }, error: String(err) }))
        throw err
      }
    },

    reset() {
      set({ map: { ...SETTINGS_DEFAULTS }, isLoaded: false, error: null })
    },
  })),
)

// ─────────────────────────────────────────────────────────────────────────────
//  CONVENIENCE SELECTORS  (stable references for React.memo / useMemo)
// ─────────────────────────────────────────────────────────────────────────────

export const selectHeroSettings = (s: SettingsState) => ({
  title:    s.map.hero_title,
  subtitle: s.map.hero_subtitle,
  ctaText:  s.map.hero_cta_text,
  ctaUrl:   s.map.hero_cta_url,
  imageUrl: s.map.hero_image_url,
})

export const selectContactSettings = (s: SettingsState) => ({
  phone:    s.map.contact_phone,
  phone2:   s.map.contact_phone_2,
  email:    s.map.contact_email,
  address:  s.map.contact_address,
  mapEmbed: s.map.contact_map_embed,
  hours:    s.map.working_hours,
})

export const selectFinancialSettings = (s: SettingsState) => ({
  taxRate:          s.map.tax_rate_percent,
  commissionPct:    s.map.global_commission_pct,
  minPayoutAmount:  s.map.min_payout_amount,
})

export const selectAnnouncementSettings = (s: SettingsState) => ({
  text:     s.map.announcement_text,
  isActive: s.map.is_announcement_active,
  color:    s.map.announcement_color,
})

export const selectBrandSettings = (s: SettingsState) => ({
  siteName:    s.map.site_name,
  logoUrl:     s.map.site_logo_url,
  faviconUrl:  s.map.site_favicon_url,
  footerAbout: s.map.footer_about,
})

export const selectSocialSettings = (s: SettingsState) => ({
  instagram: s.map.social_instagram,
  telegram:  s.map.social_telegram,
  whatsapp:  s.map.social_whatsapp,
  linkedin:  s.map.social_linkedin,
})

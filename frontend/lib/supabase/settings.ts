import { createClient } from './client'
import type { SettingKey, SettingRecord, SettingsMap } from '@/types/dashboard'

// ─────────────────────────────────────────────────────────────────────────────
//  RAW DB ROW → typed value
//  The `settings` table stores values as JSONB, so strings are JSON strings
//  (e.g. `"\"some text\""`) and numbers/booleans are raw JSON scalars.
// ─────────────────────────────────────────────────────────────────────────────

function unwrapJsonb(raw: unknown): string | number | boolean | object {
  // If Supabase already parsed the JSONB, `raw` is the JS primitive/object.
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return raw
  }
  if (raw !== null && typeof raw === 'object') return raw as object
  return ''
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLIENT-SIDE FETCH  (used by the Zustand store)
//  Fetches only is_public=TRUE rows for anonymous/SSG callers.
//  Authenticated staff callers get all rows (RLS on settings is open-read by default).
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPublicSettings(): Promise<SettingRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('key, value, group, description, is_public, updated_at')
    .eq('is_public', true)
    .order('group')

  if (error) throw new Error(`fetchPublicSettings: ${error.message}`)
  return (data ?? []).map((row) => ({
    key:        row.key as SettingKey,
    value:      unwrapJsonb(row.value),
    group:      row.group,
    description: row.description ?? undefined,
    is_public:  row.is_public,
    updated_at: row.updated_at,
  }))
}

export async function fetchAllSettings(): Promise<SettingRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('key, value, group, description, is_public, updated_at')
    .order('group')

  if (error) throw new Error(`fetchAllSettings: ${error.message}`)
  return (data ?? []).map((row) => ({
    key:        row.key as SettingKey,
    value:      unwrapJsonb(row.value),
    group:      row.group,
    description: row.description ?? undefined,
    is_public:  row.is_public,
    updated_at: row.updated_at,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE  (super_admin only — RLS enforced on the DB side)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateSetting(
  key: SettingKey,
  value: string | number | boolean | object,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) throw new Error(`updateSetting(${key}): ${error.message}`)
}

export async function upsertSetting(
  key: SettingKey,
  value: string | number | boolean | object,
  group: string,
  description?: string,
  isPublic = false,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('settings').upsert(
    { key, value, group, description, is_public: isPublic, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (error) throw new Error(`upsertSetting(${key}): ${error.message}`)
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convert the flat settings array into a typed Record for O(1) lookup. */
export function buildSettingsMap(records: SettingRecord[]): SettingsMap {
  return records.reduce<SettingsMap>((acc, r) => {
    ;(acc as unknown as Record<string, unknown>)[r.key] = r.value
    return acc
  }, {} as SettingsMap)
}

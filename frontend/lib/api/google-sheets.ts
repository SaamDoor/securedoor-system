// ─── Config ───────────────────────────────────────────────────────────────────

const SHEET_ID = '1TLZ3rWizte5QKKIiqt7b-pCvAtkbQa6zi-fr3xAhUh8'
// GID of the "مشتری" (Customer) tab
const SHEET_GID = '1456944364'
const CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`

// Product codes for the frame rows we care about (مشتری tab)
const FRAME_CODE_MIN = 1101
const FRAME_CODE_MAX = 1110

// Supabase key in the price_snapshots table
const SNAPSHOT_KEY = 'frame_prices'
const PRICE_CACHE_TTL_MS = 10 * 60 * 1000
const EXTERNAL_FETCH_TIMEOUT_MS = 4_000
const SNAPSHOT_FETCH_TIMEOUT_MS = 1_500

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PriceRow {
  colorName: string
  colorHex: string
  hasHinge: boolean
  price3klaf: number
  klaf4Addon: number
}

export interface SheetFramePrices {
  frenchPrices: PriceRow[]
  mexicanPrices: PriceRow[]
  /**
   * Persian (Shamsi) datetime of the last time prices actually changed in the
   * Google Sheet — NOT the last time the page was revalidated.
   * Empty string when the value cannot be determined.
   */
  lastUpdated: string
}

let cachedPrices: { value: SheetFramePrices; expiresAt: number } | null = null
let pendingPrices: Promise<SheetFramePrices> | null = null

// ─── Color map ────────────────────────────────────────────────────────────────

// Keys use a single ZWNJ (U+200C). Names from the sheet are ZWNJ-normalised
// before matching, so double-ZWNJ variants (e.g. row 1107) work transparently.
const COLOR_ENTRIES: ReadonlyArray<[string, string]> = [
  ['قهوه‌ای', '#5C3317'],
  ['طوسی',          '#7A8599'],
  ['مشکی',          '#232323'],
  ['سفید',          '#EFEFEF'],
]

// ─── CSV parser (RFC 4180 subset) ─────────────────────────────────────────────

/** Splits a single CSV line respecting double-quoted fields (e.g. "3,600,000"). */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(field.trim()); field = ''
    } else {
      field += ch
    }
  }
  fields.push(field.trim())
  return fields
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Collapse consecutive ZWNJs → single ZWNJ for reliable color matching. */
function normalizeZwnj(s: string): string {
  return s.replace(/‌+/g, '‌')
}

/** Strip quotes/commas/whitespace then parse price integer. */
function parsePrice(raw: string): number {
  return parseInt(raw.replace(/^["'\s]+|["'\s]+$/g, '').replace(/[,\s]/g, ''), 10)
}

function extractColorInfo(name: string): { colorName: string; colorHex: string } | null {
  for (const [key, hex] of COLOR_ENTRIES) {
    if (name.includes(key)) {
      const noHinge = name.includes('بدون لولا')
      return { colorName: noHinge ? `${key} بدون لولا` : key, colorHex: hex }
    }
  }
  return null
}

// ─── Date formatter ───────────────────────────────────────────────────────────

/**
 * Converts a UTC Date to a Persian (Shamsi) datetime string in Asia/Tehran
 * timezone. Runs server-side; safe from hydration mismatches.
 * Example: "۱۷ خرداد ۱۴۰۵ — ۱۴:۳۰"
 */
function formatPersianDateTime(date: Date): string {
  const datePart = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    calendar: 'persian',
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date)

  const timePart = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date)

  return `${datePart} — ${timePart}`
}

// ─── Price hash ───────────────────────────────────────────────────────────────

/**
 * Produces a stable string fingerprint of the parsed price rows.
 * We only hash the values that matter to users (price3klaf per colorName).
 */
function hashPrices(french: PriceRow[], mexican: PriceRow[]): string {
  const key = (rows: PriceRow[]) =>
    rows.map((r) => `${r.colorName}:${r.price3klaf}`).join('|')
  return `${key(french)}||${key(mexican)}`
}

// ─── Supabase snapshot helpers ─────────────────────────────────────────────

interface Snapshot { price_hash: string; changed_at: string }

async function readSnapshot(): Promise<Snapshot | null> {
  const { getSupabaseAnonKey, getSupabaseUrl } = await import('@/lib/supabase/env')
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!url || !key) return null

  try {
    const res = await fetch(
      `${url}/rest/v1/price_snapshots?key=eq.${SNAPSHOT_KEY}&select=price_hash,changed_at`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(SNAPSHOT_FETCH_TIMEOUT_MS),
      },
    )
    if (!res.ok) return null
    const rows: Snapshot[] = await res.json()
    return rows[0] ?? null
  } catch {
    return null
  }
}

async function upsertSnapshot(newHash: string): Promise<string> {
  const { getSupabaseAnonKey, getSupabaseUrl } = await import('@/lib/supabase/env')
  const url = getSupabaseUrl()
  // Writes require the service role key; fall back to anon key if not set
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    getSupabaseAnonKey()

  const changedAt = new Date().toISOString()

  if (!url || !key) return changedAt

  try {
    await fetch(`${url}/rest/v1/price_snapshots`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ key: SNAPSHOT_KEY, price_hash: newHash, changed_at: changedAt }),
      cache: 'no-store',
      signal: AbortSignal.timeout(SNAPSHOT_FETCH_TIMEOUT_MS),
    })
  } catch {
    // Snapshot persistence is optional metadata. A network outage must not
    // slow down or flood logs for customer-facing pages.
  }

  return changedAt
}

// ─── Main fetcher ─────────────────────────────────────────────────────────────

async function fetchFramePricesUncached(): Promise<SheetFramePrices> {
  const empty: SheetFramePrices = { frenchPrices: [], mexicanPrices: [], lastUpdated: '' }

  try {
    // 1. Fetch CSV from Google Sheets (ISR: revalidated every 10 min by the page)
    const res = await fetch(CSV_URL, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`Google Sheets HTTP ${res.status}`)
    const text = await res.text()

    // 2. Parse CSV rows
    const frenchPrices: PriceRow[] = []
    const mexicanPrices: PriceRow[] = []

    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line) continue
      const cols = parseCSVLine(line)

      const code = parseInt(cols[0] ?? '', 10)
      if (isNaN(code) || code < FRAME_CODE_MIN || code > FRAME_CODE_MAX) continue

      const name = normalizeZwnj(cols[1] ?? '')
      if (!name) continue

      const price = parsePrice(cols[2] ?? '')
      if (isNaN(price) || price <= 0) continue

      const isFrench = name.includes('فرانسوی')
      const isMexican = name.includes('مکزیکی')
      if (!isFrench && !isMexican) continue

      const colorInfo = extractColorInfo(name)
      if (!colorInfo) continue

      const row: PriceRow = {
        colorName: colorInfo.colorName,
        colorHex: colorInfo.colorHex,
        hasHinge: !name.includes('بدون لولا'),
        price3klaf: price,
        klaf4Addon: isFrench ? 600_000 : 900_000,
      }

      if (isFrench) frenchPrices.push(row)
      else mexicanPrices.push(row)
    }

    // 3. Compute fingerprint of the current prices
    const currentHash = hashPrices(frenchPrices, mexicanPrices)

    // 4. Read the previously stored snapshot from Supabase
    const snapshot = await readSnapshot()

    let changedAtIso: string

    if (!snapshot || snapshot.price_hash !== currentHash) {
      // Prices changed (or first run) → write new snapshot, timestamp = now
      changedAtIso = await upsertSnapshot(currentHash)
    } else {
      // Prices are identical → keep the original change timestamp
      changedAtIso = snapshot.changed_at
    }

    const lastUpdated = formatPersianDateTime(new Date(changedAtIso))

    return { frenchPrices, mexicanPrices, lastUpdated }
  } catch {
    return cachedPrices?.value ?? empty
  }
}

/**
 * Share one in-flight request and keep the last successful value for ten
 * minutes. Both the homepage and frame product page call this function.
 */
export async function fetchFramePrices(): Promise<SheetFramePrices> {
  const now = Date.now()
  if (cachedPrices && cachedPrices.expiresAt > now) return cachedPrices.value
  if (pendingPrices) return pendingPrices

  pendingPrices = fetchFramePricesUncached()
    .then((value) => {
      if (value.frenchPrices.length || value.mexicanPrices.length) {
        cachedPrices = { value, expiresAt: Date.now() + PRICE_CACHE_TTL_MS }
      }
      return value
    })
    .finally(() => {
      pendingPrices = null
    })

  return pendingPrices
}

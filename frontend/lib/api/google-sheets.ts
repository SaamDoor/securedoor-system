// ─── Config ───────────────────────────────────────────────────────────────────

const SHEET_ID = '1TLZ3rWizte5QKKIiqt7b-pCvAtkbQa6zi-fr3xAhUh8'
// GID of the "مشتری" (Customer) tab
const SHEET_GID = '1456944364'
const CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`

// Product codes for the frame rows we care about (مشتری tab)
const FRAME_CODE_MIN = 1101
const FRAME_CODE_MAX = 1110

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
  /** Pre-formatted Persian datetime string in Asia/Tehran timezone (set at fetch time). */
  lastUpdated: string
}

// ─── Color map ────────────────────────────────────────────────────────────────

// Keys intentionally use a single ZWNJ (U+200C). Names from the sheet are
// ZWNJ-normalised before matching, so double-ZWNJ variants (e.g. row 1107) are
// handled transparently.
const COLOR_ENTRIES: ReadonlyArray<[string, string]> = [
  ['قهوه‌ای', '#5C3317'],
  ['طوسی',          '#7A8599'],
  ['مشکی',          '#232323'],
  ['سفید',          '#EFEFEF'],
]

// ─── CSV parser (RFC 4180 subset) ─────────────────────────────────────────────

/**
 * Splits a single CSV line into fields, respecting double-quoted values.
 * Handles prices exported as "3,600,000" without breaking on the internal commas.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped double-quote inside a quoted field
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(field.trim())
      field = ''
    } else {
      field += ch
    }
  }

  fields.push(field.trim())
  return fields
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Replace one-or-more consecutive ZWNJs with a single ZWNJ for safe comparison. */
function normalizeZwnj(s: string): string {
  return s.replace(/‌+/g, '‌')
}

/** Strip surrounding quotes, then remove commas/whitespace and parse as integer. */
function parsePrice(raw: string): number {
  const cleaned = raw
    .replace(/^["'\s]+|["'\s]+$/g, '') // leading/trailing quotes and whitespace
    .replace(/[,\s]/g, '')             // thousand-separator commas and spaces
  return parseInt(cleaned, 10)
}

function extractColorInfo(
  name: string,
): { colorName: string; colorHex: string } | null {
  for (const [colorKey, hex] of COLOR_ENTRIES) {
    if (name.includes(colorKey)) {
      const noHinge = name.includes('بدون لولا')
      return {
        colorName: noHinge ? `${colorKey} بدون لولا` : colorKey,
        colorHex: hex,
      }
    }
  }
  return null
}

// ─── Date formatter ───────────────────────────────────────────────────────────

/**
 * Returns a Persian (Shamsi) date-time string in Asia/Tehran timezone.
 * Runs server-side so the formatted string is consistent across server/client
 * and avoids React hydration mismatches.
 * Example output: "۱۷ خرداد ۱۴۰۵ — ۱۴:۳۰"
 */
function formatPersianDateTime(date: Date): string {
  const datePart = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    calendar:  'persian',
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  }).format(date)

  const timePart = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  return `${datePart} — ${timePart}`
}

// ─── Main fetcher ─────────────────────────────────────────────────────────────

export async function fetchFramePrices(): Promise<SheetFramePrices> {
  try {
    const res = await fetch(CSV_URL, {
      next: { revalidate: 600 },
    })

    if (!res.ok) {
      throw new Error(`Google Sheets fetch failed: HTTP ${res.status}`)
    }

    const text = await res.text()

    const frenchPrices: PriceRow[] = []
    const mexicanPrices: PriceRow[] = []

    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line) continue

      const cols = parseCSVLine(line)

      // Column 0: product code
      const code = parseInt(cols[0] ?? '', 10)
      if (isNaN(code) || code < FRAME_CODE_MIN || code > FRAME_CODE_MAX) continue

      // Column 1: product name — normalise ZWNJ before any string matching
      const name = normalizeZwnj(cols[1] ?? '')
      if (!name) continue

      // Column 2: price
      const price = parsePrice(cols[2] ?? '')
      if (isNaN(price) || price <= 0) continue

      const isFrench  = name.includes('فرانسوی')
      const isMexican = name.includes('مکزیکی')
      if (!isFrench && !isMexican) continue

      const colorInfo = extractColorInfo(name)
      if (!colorInfo) continue

      const hasHinge   = !name.includes('بدون لولا')
      const klaf4Addon = isFrench ? 600_000 : 900_000

      const row: PriceRow = {
        colorName:  colorInfo.colorName,
        colorHex:   colorInfo.colorHex,
        hasHinge,
        price3klaf: price,
        klaf4Addon,
      }

      if (isFrench) frenchPrices.push(row)
      else           mexicanPrices.push(row)
    }

    return {
      frenchPrices,
      mexicanPrices,
      lastUpdated: formatPersianDateTime(new Date()),
    }
  } catch (err) {
    console.error('[fetchFramePrices] Failed to load prices from Google Sheet:', err)
    return { frenchPrices: [], mexicanPrices: [], lastUpdated: '' }
  }
}

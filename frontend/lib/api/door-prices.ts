// ─── Config ───────────────────────────────────────────────────────────────────

const SHEET_ID = '1TLZ3rWizte5QKKIiqt7b-pCvAtkbQa6zi-fr3xAhUh8'

const DOOR_CODE_MIN = 1001
const DOOR_CODE_MAX = 1046

// Supabase key in the price_snapshots table
const SNAPSHOT_KEY = 'door_prices'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DoorPriceMap {
  prices: Record<number, number>  // code → price in Tomans
  lastUpdated: string             // Persian datetime string
}

// ─── CSV parser (RFC 4180 subset) ─────────────────────────────────────────────

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

function parsePrice(raw: string): number {
  return parseInt(raw.replace(/^["'\s]+|["'\s]+$/g, '').replace(/[,\s]/g, ''), 10)
}

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

function hashPrices(prices: Record<number, number>): string {
  return Object.entries(prices)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([code, price]) => `${code}:${price}`)
    .join('|')
}

// ─── Supabase snapshot helpers ─────────────────────────────────────────────

interface Snapshot { price_hash: string; changed_at: string }

async function readSnapshot(): Promise<Snapshot | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
    })
  } catch (err) {
    console.error('[upsertSnapshot door_prices] error:', err)
  }

  return changedAt
}

// ─── Main fetcher ─────────────────────────────────────────────────────────────

export async function fetchDoorPrices(): Promise<DoorPriceMap> {
  const empty: DoorPriceMap = { prices: {}, lastUpdated: '' }

  const sheetGid = process.env.DOOR_PRICES_SHEET_GID
  if (!sheetGid) {
    console.warn('[fetchDoorPrices] DOOR_PRICES_SHEET_GID env var is not set — skipping fetch')
    return empty
  }

  const csvUrl =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${sheetGid}`

  try {
    // 1. Fetch CSV from Google Sheets
    const res = await fetch(csvUrl, { next: { revalidate: 600 } })
    if (!res.ok) throw new Error(`Google Sheets HTTP ${res.status}`)
    const text = await res.text()

    // 2. Parse CSV rows
    const prices: Record<number, number> = {}

    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line) continue
      const cols = parseCSVLine(line)

      const code = parseInt(cols[0] ?? '', 10)
      if (isNaN(code) || code < DOOR_CODE_MIN || code > DOOR_CODE_MAX) continue

      const price = parsePrice(cols[2] ?? '')
      if (isNaN(price) || price <= 0) continue

      prices[code] = price
    }

    // 3. Compute fingerprint
    const currentHash = hashPrices(prices)

    // 4. Read previous snapshot from Supabase
    const snapshot = await readSnapshot()

    let changedAtIso: string

    if (!snapshot || snapshot.price_hash !== currentHash) {
      changedAtIso = await upsertSnapshot(currentHash)
    } else {
      changedAtIso = snapshot.changed_at
    }

    const lastUpdated = formatPersianDateTime(new Date(changedAtIso))

    return { prices, lastUpdated }
  } catch (err) {
    console.error('[fetchDoorPrices] error:', err)
    return empty
  }
}

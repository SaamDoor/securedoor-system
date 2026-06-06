const SHEET_ID = '1TLZ3rWizte5QKKIiqt7b-pCvAtkbQa6zi-fr3xAhUh8'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`

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
}

// Maps Persian color keywords found in product names to hex codes
const COLOR_MAP: [string, string][] = [
  ['قهوه‌ای', '#5C3317'], // قهوه‌ای (with ZWNJ)
  ['طوسی', '#7A8599'], // طوسی
  ['مشکی', '#232323'], // مشکی
  ['سفید', '#EFEFEF'], // سفید
]

function extractColorInfo(name: string): { colorName: string; colorHex: string } | null {
  for (const [color, hex] of COLOR_MAP) {
    if (name.includes(color)) {
      const noHinge = name.includes('بدون لولا') // بدون لولا
      return {
        colorName: noHinge ? `${color} بدون لولا` : color,
        colorHex: hex,
      }
    }
  }
  return null
}

// Simple CSV parser — handles CRLF and LF, does not handle quoted commas
function parseCSVRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(','))
}

export async function fetchFramePrices(): Promise<SheetFramePrices> {
  try {
    const res = await fetch(CSV_URL, {
      next: { revalidate: 600 },
    })

    if (!res.ok) {
      throw new Error(`Google Sheets fetch failed: HTTP ${res.status}`)
    }

    const text = await res.text()
    const rows = parseCSVRows(text)

    const frenchPrices: PriceRow[] = []
    const mexicanPrices: PriceRow[] = []

    for (const row of rows) {
      const code = parseInt(row[0]?.trim() ?? '', 10)
      // Only process frame product codes (1100+)
      if (isNaN(code) || code < 1100) continue

      const name = row[1]?.trim() ?? ''
      const rawPrice = row[2]?.trim().replace(/\D/g, '') ?? ''
      const price = parseInt(rawPrice, 10)

      if (!name || isNaN(price) || price <= 0) continue

      const isFrench = name.includes('فرانسوی') // فرانسوی
      const isMexican = name.includes('مکزیکی') // مکزیکی

      if (!isFrench && !isMexican) continue

      const colorInfo = extractColorInfo(name)
      if (!colorInfo) continue

      const hasHinge = !name.includes('بدون لولا') // بدون لولا
      const klaf4Addon = isFrench ? 600_000 : 900_000

      const priceRow: PriceRow = {
        colorName: colorInfo.colorName,
        colorHex: colorInfo.colorHex,
        hasHinge,
        price3klaf: price,
        klaf4Addon,
      }

      if (isFrench) frenchPrices.push(priceRow)
      else mexicanPrices.push(priceRow)
    }

    return { frenchPrices, mexicanPrices }
  } catch (err) {
    console.error('[fetchFramePrices] Failed to load Google Sheet prices:', err)
    return { frenchPrices: [], mexicanPrices: [] }
  }
}

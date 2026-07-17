import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'

/** Standard product gallery size — square WebP, max 200KB after compress. */
export const PRODUCT_IMAGE = {
  width: 1200,
  height: 1200,
  quality: 82,
  format: 'webp' as const,
  maxOutputBytes: 200 * 1024,
  maxInputBytes: 15 * 1024 * 1024,
  allowedMime: new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/heic',
    'image/heif',
  ]),
}

function assertImageFile(file: File) {
  if (file.size <= 0) throw new Error('فایل خالی است')
  if (file.size > PRODUCT_IMAGE.maxInputBytes) {
    throw new Error('حداکثر حجم هر تصویر ۱۵ مگابایت است')
  }
  const type = (file.type || '').toLowerCase()
  if (type && !PRODUCT_IMAGE.allowedMime.has(type) && !type.startsWith('image/')) {
    throw new Error('فرمت تصویر پشتیبانی نمی‌شود')
  }
}

/** Normalize any uploaded image to ≤200KB square WebP (cover crop, EXIF-rotated). */
export async function normalizeProductImage(file: File): Promise<Buffer> {
  assertImageFile(file)
  const input = Buffer.from(await file.arrayBuffer())

  try {
    let edge = PRODUCT_IMAGE.width
    let quality = PRODUCT_IMAGE.quality
    let buffer: Buffer | null = null

    for (let attempt = 0; attempt < 10; attempt += 1) {
      buffer = await sharp(input, { failOn: 'none' })
        .rotate()
        .resize(edge, edge, {
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: false,
        })
        .webp({ quality, effort: 4 })
        .toBuffer()

      if (buffer.byteLength <= PRODUCT_IMAGE.maxOutputBytes) return buffer

      if (quality > 48) {
        quality -= 8
      } else {
        edge = Math.max(480, Math.round(edge * 0.85))
        quality = Math.max(42, quality - 4)
      }
    }

    if (!buffer || buffer.byteLength > PRODUCT_IMAGE.maxOutputBytes) {
      throw new Error(`تصویر «${file.name}» پس از فشرده‌سازی از ۲۰۰ کیلوبایت بزرگ‌تر است`)
    }
    return buffer
  } catch (error) {
    if (error instanceof Error && error.message.includes('۲۰۰ کیلوبایت')) throw error
    throw new Error(`پردازش تصویر «${file.name}» ناموفق بود`)
  }
}

export async function uploadNormalizedProductImages(files: File[]): Promise<string[]> {
  if (!files.length) return []
  const supabase = await createClient()
  const urls: string[] = []

  for (const file of files) {
    const body = await normalizeProductImage(file)
    const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`

    const { error } = await supabase.storage.from('products').upload(path, body, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    })
    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('products').getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return urls
}

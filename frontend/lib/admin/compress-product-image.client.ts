/** Client-side product image compression before upload. */

export const PRODUCT_UPLOAD_MAX_BYTES = 200 * 1024 // 200 KB
export const PRODUCT_UPLOAD_MAX_EDGE = 1200

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('خواندن تصویر ناموفق بود'))
      img.src = url
    })
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

function drawCover(
  image: HTMLImageElement,
  edge: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = edge
  canvas.height = edge
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas در این مرورگر پشتیبانی نمی‌شود')

  const scale = Math.max(edge / image.naturalWidth, edge / image.naturalHeight)
  const drawW = image.naturalWidth * scale
  const drawH = image.naturalHeight * scale
  const dx = (edge - drawW) / 2
  const dy = (edge - drawH) / 2

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, edge, edge)
  ctx.drawImage(image, dx, dy, drawW, drawH)
  return canvas
}

async function encodeUnderLimit(
  canvas: HTMLCanvasElement,
  maxBytes: number,
): Promise<Blob> {
  const preferWebp = typeof document
    .createElement('canvas')
    .toDataURL('image/webp')
    .startsWith('data:image/webp')

  const types = preferWebp
    ? (['image/webp', 'image/jpeg'] as const)
    : (['image/jpeg'] as const)

  let best: Blob | null = null

  for (const type of types) {
    for (let quality = 0.86; quality >= 0.42; quality -= 0.08) {
      const blob = await canvasToBlob(canvas, type, quality)
      if (!blob) continue
      if (!best || blob.size < best.size) best = blob
      if (blob.size <= maxBytes) return blob
    }
  }

  if (!best) throw new Error('فشرده‌سازی تصویر ناموفق بود')
  return best
}

/**
 * Compress a gallery image in the browser to ≤ maxBytes (default 200KB),
 * square WebP/JPEG at up to 1200×1200.
 */
export async function compressProductImageFile(
  file: File,
  options?: { maxBytes?: number; maxEdge?: number },
): Promise<File> {
  const maxBytes = options?.maxBytes ?? PRODUCT_UPLOAD_MAX_BYTES
  const maxEdge = options?.maxEdge ?? PRODUCT_UPLOAD_MAX_EDGE

  if (!file.type.startsWith('image/') && file.type !== '') {
    throw new Error(`«${file.name}» تصویر نیست`)
  }

  // Already small enough and web-friendly — still normalize for consistency
  const image = await loadImage(file)
  let edge = Math.min(maxEdge, Math.max(image.naturalWidth, image.naturalHeight))
  if (edge < 320) edge = Math.max(image.naturalWidth, image.naturalHeight, 1)

  let blob: Blob | null = null

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const canvas = drawCover(image, Math.max(320, Math.round(edge)))
    blob = await encodeUnderLimit(canvas, maxBytes)
    if (blob.size <= maxBytes) break
    edge *= 0.82
  }

  if (!blob) throw new Error(`فشرده‌سازی «${file.name}» ناموفق بود`)

  if (blob.size > maxBytes) {
    throw new Error(
      `تصویر «${file.name}» حتی پس از فشرده‌سازی از ۲۰۰ کیلوبایت بزرگ‌تر است`,
    )
  }

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const base = file.name.replace(/\.[^.]+$/, '') || 'product'
  return new File([blob], `${base}.${ext}`, {
    type: blob.type,
    lastModified: Date.now(),
  })
}

export async function compressProductImageFiles(files: File[]): Promise<File[]> {
  const out: File[] = []
  for (const file of files) {
    out.push(await compressProductImageFile(file))
  }
  return out
}

/** Product detail path — prefer Latin keyword slug for SEO; UUID only as fallback. */
export function getProductPath(product: { id: string; slug?: string | null }) {
  const slug = product.slug?.trim()
  if (slug) return `/products/${encodeURI(slug)}`
  return `/products/${product.id}`
}

export function decodeProductParam(raw: string): string {
  let value = raw.trim()
  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(value)
      if (decoded === value) break
      value = decoded
    } catch {
      break
    }
  }
  return value
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isProductUuid(value: string): boolean {
  return UUID_RE.test(value)
}

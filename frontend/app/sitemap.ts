import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/constants'
import { SEO_COLLECTIONS } from '@/lib/seo/collections'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'

export const revalidate = 3600

function createPublicClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    {
      url: `${baseUrl}/products/chaharcharb-felezi-faransavi`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/warranty`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/certificates`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    {
      url: `${baseUrl}/tools/materials-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const collectionRoutes: MetadataRoute.Sitemap = SEO_COLLECTIONS.map((item) => ({
    url: `${baseUrl}/collections/${item.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = createPublicClient()
    if (supabase) {
      const { data } = await supabase
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(2000)

      productRoutes = (data ?? [])
        .filter((row) => Boolean(row.slug))
        .map((row) => ({
          url: `${baseUrl}/products/${encodeURI(row.slug as string)}`,
          lastModified: row.updated_at ? new Date(row.updated_at as string) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
    }
  } catch (error) {
    console.error('[sitemap] products fetch failed', error)
  }

  return [...staticRoutes, ...collectionRoutes, ...productRoutes]
}

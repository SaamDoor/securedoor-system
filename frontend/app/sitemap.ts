import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL

  const staticRoutes = [
    { url: `${baseUrl}/`, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/categories`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/blog`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/about`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/faq`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/warranty`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/certificates`, priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  const categoryRoutes = [
    'darb-zed-sereqat',
    'darb-zed-hariq',
    'darb-apartmani',
    'darb-villaei',
    'darb-edari',
    'moteallaqat',
  ].map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }))

  return [...staticRoutes, ...categoryRoutes]
}

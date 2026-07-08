import type { Metadata } from 'next'
import {
  BRAND,
  CONTACT,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
} from './constants'

interface SeoOptions {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
  path?: string
}

export function generateSeo(options: SeoOptions = {}): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    keywords = [],
    image = `${SITE_URL}/og-image.jpg`,
    noIndex = false,
    path = '',
  } = options

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const url = `${SITE_URL}${path}`

  return {
    title: fullTitle,
    description,
    keywords: [
      'گروه صنعتی مشعوف', 'درب ضد سرقت', 'درب امنیتی', 'درب لوکس',
      ...keywords,
    ],
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'fa_IR',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title ?? SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  }
}

export function productSchema(product: {
  name: string
  description: string
  price: number
  image?: string
  sku?: string
  availability?: boolean
  rating?: number
  reviewCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'IRR',
      availability: product.availability
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount ?? 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: [BRAND.nameShort, BRAND.english, BRAND.group],
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: CONTACT.email,
    telephone: `+98-${CONTACT.phone.slice(1)}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IR',
      addressRegion: 'مازندران',
      addressLocality: 'قائم شهر',
      streetAddress: CONTACT.address,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+98-${CONTACT.phone.slice(1)}`,
      contactType: 'customer service',
      availableLanguage: 'Persian',
      areaServed: 'IR',
    },
    sameAs: [
      SOCIAL_LINKS.instagram,
      SOCIAL_LINKS.telegram,
      SOCIAL_LINKS.eitaa,
      SOCIAL_LINKS.rubika,
    ],
  }
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function articleSchema(article: {
  title: string
  description: string
  image?: string
  author: string
  publishedAt: string
  updatedAt?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': article.url },
  }
}

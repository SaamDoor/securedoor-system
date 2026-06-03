import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProjectDetailClient } from './project-detail-client'
import type { ConstructionProject } from '@/types'
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_COLOR } from '@/types'
import { MapPin, Calendar, Maximize2, Building2, Bed, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CONTACT } from '@/lib/constants'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('construction_projects')
    .select('title, seo_title, seo_description, short_description, thumbnail_url')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'پروژه یافت نشد' }
  return {
    title: data.seo_title ?? `${data.title} | گروه صنعتی مشعوف`,
    description: data.seo_description ?? data.short_description ?? undefined,
    openGraph: {
      title: data.seo_title ?? data.title,
      description: data.seo_description ?? data.short_description ?? '',
      images: data.thumbnail_url ? [{ url: data.thumbnail_url, width: 1200, height: 800 }] : [],
    },
  }
}

function formatPrice(n: number | null): string {
  if (!n) return ''
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} میلیارد تومان`
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} میلیون تومان`
  return n.toLocaleString('fa-IR') + ' تومان'
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('construction_projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !project) notFound()

  const p = project as ConstructionProject

  // Increment view count in background
  supabase
    .from('construction_projects')
    .update({ view_count: (p.view_count ?? 0) + 1 })
    .eq('id', p.id)
    .then(() => {})

  return (
    <div className="min-h-screen bg-deep-black">

      {/* ── Hero ── */}
      <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
        {p.thumbnail_url ? (
          <Image
            src={p.thumbnail_url}
            alt={p.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface to-deep-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/50 to-transparent" />

        {/* Back link */}
        <div className="absolute top-6 right-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-sm border border-white/15 hover:border-white/30 transition-all"
          >
            ← بازگشت
          </Link>
        </div>

        <div className="relative container pb-12">
          {/* Status */}
          {p.status && (
            <div className="mb-4">
              <span className={cn('px-3 py-1 rounded-full text-xs font-bold border', PROJECT_STATUS_COLOR[p.status])}>
                {PROJECT_STATUS_LABEL[p.status]}
              </span>
            </div>
          )}

          {/* Location */}
          {p.location && (
            <div className="flex items-center gap-1.5 text-gold text-sm mb-3">
              <MapPin className="h-4 w-4" />
              {p.location}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
            {p.title}
          </h1>

          {/* Key stats */}
          <div className="flex flex-wrap gap-6">
            {p.area && (
              <div className="flex items-center gap-2 text-white/80">
                <Maximize2 className="h-4 w-4 text-gold" />
                <span className="text-sm">{p.area.toLocaleString('fa-IR')} متر مربع</span>
              </div>
            )}
            {p.floors && (
              <div className="flex items-center gap-2 text-white/80">
                <Building2 className="h-4 w-4 text-gold" />
                <span className="text-sm">{p.floors.toLocaleString('fa-IR')} طبقه</span>
              </div>
            )}
            {p.bedrooms && (
              <div className="flex items-center gap-2 text-white/80">
                <Bed className="h-4 w-4 text-gold" />
                <span className="text-sm">{p.bedrooms.toLocaleString('fa-IR')} خواب</span>
              </div>
            )}
            {p.completion_year && (
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="h-4 w-4 text-gold" />
                <span className="text-sm">تحویل {p.completion_year.toLocaleString('fa-IR')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Description */}
            {p.description && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-white">درباره این پروژه</h2>
                <div className="h-px bg-gold/20" />
                <p className="text-white/70 leading-loose text-lg">
                  {p.description}
                </p>
              </section>
            )}

            {/* Architecture */}
            {p.architecture_description && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-white">معماری و طراحی</h2>
                <div className="h-px bg-gold/20" />
                <div className="p-6 rounded-2xl border border-gold/15 bg-gold/5">
                  <p className="text-white/80 leading-loose">
                    {p.architecture_description}
                  </p>
                </div>
              </section>
            )}

            {/* Gallery */}
            {p.gallery?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-white">گالری تصاویر</h2>
                <div className="h-px bg-gold/20" />
                <ProjectDetailClient gallery={p.gallery} title={p.title} />
              </section>
            )}

            {/* Amenities */}
            {p.amenities?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-white">امکانات</h2>
                <div className="h-px bg-gold/20" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {p.amenities.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/3 hover:border-gold/20 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-lg flex-shrink-0">
                        ✦
                      </span>
                      <span className="text-white text-sm font-medium">{a.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Price card */}
            {(p.price_from || p.price_to) && (
              <div className="sticky top-24 bg-surface border border-white/10 rounded-2xl p-6 space-y-5">
                <div>
                  <span className="text-muted text-sm">قیمت شروع از</span>
                  <div className="text-2xl font-black text-gold mt-1">
                    {formatPrice(p.price_from)}
                  </div>
                  {p.price_to && p.price_from !== p.price_to && (
                    <div className="text-sm text-muted">
                      تا {formatPrice(p.price_to)}
                    </div>
                  )}
                </div>

                <a
                  href={`tel:${CONTACT.phone}`}
                  className="flex items-center justify-center gap-2 w-full h-12 bg-gold text-black rounded-xl font-bold hover:bg-gold-light transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  مشاوره رایگان
                </a>

                <a
                  href={`https://wa.me/${CONTACT.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 border border-white/15 text-muted rounded-xl text-sm hover:border-white/30 hover:text-white transition-all"
                >
                  ارتباط از طریق واتساپ
                </a>
              </div>
            )}

            {/* Specifications table */}
            {p.specifications?.length > 0 && (
              <div className="bg-surface border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/8">
                  <h3 className="font-bold text-white">مشخصات فنی</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {p.specifications.map((s, i) => (
                    <div key={i} className="flex justify-between items-center px-5 py-3 text-sm">
                      <span className="text-muted">{s.label}</span>
                      <span className="text-white font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/images/projects-cta-bg.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-deep-black/90 to-deep-black" />
        <div className="relative container text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white">
            به <span className="text-gold">مشاوره رایگان</span> نیاز دارید؟
          </h2>
          <p className="text-white/60 text-lg">
            کارشناسان گروه صنعتی مشعوف آماده پاسخگویی هستند
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`tel:${CONTACT.phone}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-black rounded-xl font-bold hover:bg-gold-light transition-colors"
            >
              <Phone className="h-5 w-5" />
              {CONTACT.phone}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl font-medium hover:border-white/40 transition-all"
            >
              فرم تماس
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

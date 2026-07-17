import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public.server'
import { BRAND, SITE_NAME } from '@/lib/constants'
import { ProjectsGrid } from './projects-grid'
import type { ConstructionProject } from '@/types'

export const metadata: Metadata = {
  title: `پروژه‌های ساختمانی | ${SITE_NAME}`,
  description: `مجموعه پروژه‌های معماری و ساختمانی ${SITE_NAME} — از پیش‌فروش تا تحویل.`,
}

async function getData() {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('construction_projects')
      .select('id, title, slug, short_description, status, area, location, floors, units, price_from, price_to, completion_year, is_featured, thumbnail_url, amenities')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
    return (data ?? []) as Partial<ConstructionProject>[]
  } catch {
    return []
  }
}

export default async function ProjectsPage() {
  const projects = await getData()

  return (
    <div className="min-h-screen bg-deep-black">

      {/* ── Hero banner ── */}
      <section className="relative h-[40vh] min-h-[320px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/projects-hero-banner.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/60 to-transparent" />
        <div className="relative container pb-12">
          <p className="text-gold text-sm tracking-[0.3em] uppercase font-medium mb-3">
            {BRAND.english}
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            پروژه‌های <br />
            <span className="text-gradient-gold">ساختمانی ما</span>
          </h1>
        </div>
      </section>

      {/* ── Filter tabs ── */}
      <section className="sticky top-[72px] z-30 bg-deep-black/95 backdrop-blur-xl border-b border-white/8">
        <div className="container">
          <Suspense fallback={null}>
            <ProjectsGrid projects={projects} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

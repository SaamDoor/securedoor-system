'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Maximize2, Building2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConstructionProject, ProjectStatus } from '@/types'
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_COLOR } from '@/types'

type FilterValue = 'all' | ProjectStatus

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'همه پروژه‌ها' },
  { value: 'pre_sale', label: 'پیش‌فروش' },
  { value: 'for_sale', label: 'برای فروش' },
  { value: 'delivered', label: 'تحویل‌شده' },
]

interface Props {
  projects: Partial<ConstructionProject>[]
}

function formatPrice(n: number | null | undefined): string {
  if (!n) return ''
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} میلیارد تومان`
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} میلیون تومان`
  return n.toLocaleString('fa-IR') + ' تومان'
}

export function ProjectsGrid({ projects }: Props) {
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered = filter === 'all'
    ? projects
    : projects.filter((p) => p.status === filter)

  return (
    <>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 py-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              filter === f.value
                ? 'bg-gold text-black font-bold'
                : 'text-muted hover:text-white hover:bg-white/8',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="container py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted">
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>پروژه‌ای در این دسته‌بندی یافت نشد</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  )
}

function ProjectCard({ project }: { project: Partial<ConstructionProject> }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block bg-surface border border-white/8 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-gold transition-all duration-400"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        {project.thumbnail_url ? (
          <Image
            src={project.thumbnail_url}
            alt={project.title ?? ''}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="h-16 w-16 text-white/10" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge */}
        {project.status && (
          <div className="absolute top-4 right-4">
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm',
              PROJECT_STATUS_COLOR[project.status],
            )}>
              {PROJECT_STATUS_LABEL[project.status]}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {project.is_featured && (
          <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold border border-gold/30 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-gold" />
              ویژه
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {project.location && (
          <div className="flex items-center gap-1.5 text-muted text-xs">
            <MapPin className="h-3.5 w-3.5 text-gold flex-shrink-0" />
            {project.location}
          </div>
        )}

        <h3 className="font-bold text-white text-lg leading-snug group-hover:text-gold transition-colors duration-200">
          {project.title}
        </h3>

        {project.short_description && (
          <p className="text-muted text-sm leading-relaxed line-clamp-2">
            {project.short_description}
          </p>
        )}

        {/* Specs row */}
        <div className="flex items-center gap-4 pt-1">
          {project.area && (
            <div className="flex items-center gap-1.5 text-muted text-xs">
              <Maximize2 className="h-3.5 w-3.5 text-gold" />
              <span>{project.area.toLocaleString('fa-IR')} م²</span>
            </div>
          )}
          {project.floors && (
            <div className="flex items-center gap-1.5 text-muted text-xs">
              <Building2 className="h-3.5 w-3.5 text-gold" />
              <span>{project.floors.toLocaleString('fa-IR')} طبقه</span>
            </div>
          )}
          {project.units && (
            <div className="text-muted text-xs">
              {project.units.toLocaleString('fa-IR')} واحد
            </div>
          )}
        </div>

        {/* Price */}
        {(project.price_from || project.price_to) && (
          <div className="pt-2 border-t border-white/8">
            <span className="text-sm text-muted">از </span>
            <span className="text-gold font-bold text-sm">{formatPrice(project.price_from)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

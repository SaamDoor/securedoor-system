export type ProjectStatus = 'for_sale' | 'pre_sale' | 'delivered'

export interface ProjectGalleryItem {
  url: string
  caption?: string
  order: number
}

export interface ProjectAmenity {
  icon: string   // نام آیکون (lucide یا emoji)
  label: string
}

export interface ProjectSpecification {
  label: string
  value: string
}

export interface ConstructionProject {
  id: string
  title: string
  slug: string
  short_description: string | null
  description: string | null
  architecture_description: string | null
  location: string | null
  area: number | null
  floors: number | null
  units: number | null
  bedrooms: number | null
  price_from: number | null
  price_to: number | null
  completion_year: number | null
  status: ProjectStatus
  is_featured: boolean
  is_active: boolean
  thumbnail_url: string | null
  gallery: ProjectGalleryItem[]
  amenities: ProjectAmenity[]
  specifications: ProjectSpecification[]
  latitude: number | null
  longitude: number | null
  seo_title: string | null
  seo_description: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export type ConstructionProjectInsert = Omit<ConstructionProject,
  'id' | 'view_count' | 'created_at' | 'updated_at'>

export type ConstructionProjectUpdate = Partial<ConstructionProjectInsert>

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  for_sale: 'برای فروش',
  pre_sale: 'پیش‌فروش',
  delivered: 'تحویل‌شده',
}

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, string> = {
  for_sale:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pre_sale:  'bg-amber-500/15   text-amber-400   border-amber-500/30',
  delivered: 'bg-sky-500/15     text-sky-400     border-sky-500/30',
}

// ─── Shared Primitive Types ──────────────────────────────────────────────────

export type ViewMode = 'grid' | 'list'

export type Status = 'active' | 'inactive' | 'pending' | 'archived'

export type AlertType = 'warning' | 'info' | 'success' | 'error'

export type BadgeVariant =
  | 'gold'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'white'
  | 'primary'
  | 'outline'

export type SortOption = {
  label: string
  value: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}

// ─── Select ───────────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

// ─── File ─────────────────────────────────────────────────────────────────────

export interface FileUpload {
  id: string
  url: string
  name: string
  size: number
  type: string
  bucket: string
  path: string
  createdAt: string
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface Address {
  id: string
  userId: string
  label: string
  recipientName: string
  phone: string
  province: string
  city: string
  district?: string
  street: string
  postalCode: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'order'
  | 'payment'
  | 'message'
  | 'system'
  | 'promotion'
  | 'review'

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: NotificationType
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export type BannerPosition =
  | 'hero'
  | 'homepage_middle'
  | 'category_top'
  | 'sidebar'
  | 'product_page'
  | 'checkout'

export interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  mobileImageUrl?: string
  linkUrl?: string
  position: BannerPosition
  isActive: boolean
  order: number
  startDate?: string
  endDate?: string
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export interface MenuItem {
  id: string
  label: string
  url: string
  icon?: string
  children?: MenuItem[]
  isExternal?: boolean
  order: number
}

export interface Menu {
  id: string
  name: string
  slug: string
  items: MenuItem[]
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface SocialLinks {
  instagram?: string
  telegram?: string
  whatsapp?: string
  linkedin?: string
  youtube?: string
  twitter?: string
}

export interface SeoDefaults {
  title: string
  description: string
  keywords: string[]
  ogImage: string
}

export interface SiteSettings {
  siteName: string
  siteUrl: string
  logo: string
  favicon: string
  phone: string
  email: string
  address: string
  workingHours: string
  socialLinks: SocialLinks
  seoDefaults: SeoDefaults
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FaqCategory {
  id: string
  name: string
  slug: string
  order: number
}

export interface Faq {
  id: string
  question: string
  answer: string
  categoryId?: string
  order: number
  isActive: boolean
}

// ─── Testimonial ──────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string
  name: string
  role?: string
  company?: string
  avatar?: string
  content: string
  rating: number
  isActive: boolean
  order: number
}

// ─── Certificate ──────────────────────────────────────────────────────────────

export interface Certificate {
  id: string
  name: string
  issuer: string
  imageUrl: string
  validUntil?: string
  order: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

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

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

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

export type NotificationType =
  | 'order'
  | 'payment'
  | 'message'
  | 'system'
  | 'promotion'
  | 'review'

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

export type BannerPosition =
  | 'hero'
  | 'homepage_middle'
  | 'category_top'
  | 'sidebar'
  | 'product_page'
  | 'checkout'

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

export interface Faq {
  id: string
  question: string
  answer: string
  categoryId?: string
  order: number
  isActive: boolean
}

export interface FaqCategory {
  id: string
  name: string
  slug: string
  order: number
}

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

export interface Certificate {
  id: string
  name: string
  issuer: string
  imageUrl: string
  validUntil?: string
  order: number
}

export type SortOption = {
  label: string
  value: string
}

export type ViewMode = 'grid' | 'list'

export type Status = 'active' | 'inactive' | 'pending' | 'archived'

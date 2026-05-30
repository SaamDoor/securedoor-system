import type { User } from './auth'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  metaTitle?: string
  metaDescription?: string
  postCount?: number
  isActive: boolean
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  postCount?: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  categoryId: string
  category: BlogCategory
  tags: BlogTag[]
  authorId: string
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  readingTime?: number
  viewCount: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface BlogFilter {
  categoryId?: string
  tagId?: string
  authorId?: string
  search?: string
  status?: 'draft' | 'published' | 'archived'
  isFeatured?: boolean
  page?: number
  limit?: number
}

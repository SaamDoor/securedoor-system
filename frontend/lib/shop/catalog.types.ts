export type ShopSortBy =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'most_viewed'
  | 'best_rated'
  | 'featured'

export interface ShopCatalogParams {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: ShopSortBy | string
  page?: number
  featured?: boolean
  inStock?: boolean
  limit?: number
}

export interface ShopCategory {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  order: number
  productCount: number
  children: ShopCategory[]
}

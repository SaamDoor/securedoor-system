export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  bannerUrl?: string
  parentId?: string
  parent?: ProductCategory
  children?: ProductCategory[]
  productCount?: number
  metaTitle?: string
  metaDescription?: string
  order: number
  isActive: boolean
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  alt?: string
  isPrimary: boolean
  order: number
}

export interface ProductAttribute {
  id: string
  name: string
  slug: string
  type: 'text' | 'number' | 'boolean' | 'color' | 'select'
  unit?: string
  options?: string[]
}

export interface ProductAttributeValue {
  id: string
  productId: string
  attributeId: string
  attribute: ProductAttribute
  value: string
}

export interface ProductSpecification {
  id: string
  productId: string
  label: string
  value: string
  unit?: string
  group?: string
  order: number
}

export interface ProductDownload {
  id: string
  productId: string
  name: string
  description?: string
  fileUrl: string
  fileSize?: number
  fileType?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  shortDescription?: string
  description: string
  price: number
  comparePrice?: number
  costPrice?: number
  categoryId: string
  category: ProductCategory
  images: ProductImage[]
  attributes: ProductAttributeValue[]
  specifications: ProductSpecification[]
  downloads: ProductDownload[]
  tags?: string[]
  stock: number
  stockStatus: StockStatus
  weight?: number
  dimensions?: ProductDimensions
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  viewCount: number
  reviewCount: number
  averageRating: number
  linkedFrameIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductDimensions {
  width?: number
  height?: number
  depth?: number
  unit: 'cm' | 'mm' | 'm'
}

export type StockStatus = 'in_stock' | 'out_of_stock' | 'pre_order' | 'discontinued'

export interface ProductReview {
  id: string
  productId: string
  userId: string
  user: {
    firstName: string
    lastName: string
    avatar?: string
  }
  rating: number
  title?: string
  content: string
  isVerified: boolean
  isApproved: boolean
  images?: string[]
  createdAt: string
}

export interface ProductFilter {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isFeatured?: boolean
  tags?: string[]
  attributes?: Record<string, string[]>
  search?: string
  sortBy?: ProductSortBy
  page?: number
  limit?: number
}

export type ProductSortBy =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'most_viewed'
  | 'best_rated'
  | 'most_reviewed'

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  couponCode?: string
}

export interface Wishlist {
  id: string
  userId: string
  products: Product[]
  createdAt: string
}

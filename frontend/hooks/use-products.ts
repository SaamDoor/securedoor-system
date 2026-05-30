import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, getProductBySlug, getFeaturedProducts } from '@/lib/api/products'
import type { ProductFilter } from '@/types'

export function useProducts(filter: ProductFilter = {}) {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: () => getProducts(filter),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  })
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000,
  })
}

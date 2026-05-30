import { useQuery } from '@tanstack/react-query'
import { getBlogPosts, getBlogPost, getFeaturedBlogPosts } from '@/lib/api/blog'
import type { BlogFilter } from '@/types'

export function useBlogPosts(filter: BlogFilter = {}) {
  return useQuery({
    queryKey: ['blog', 'posts', filter],
    queryFn: () => getBlogPosts(filter),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => getBlogPost(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  })
}

export function useFeaturedBlogPosts(limit = 3) {
  return useQuery({
    queryKey: ['blog', 'featured', limit],
    queryFn: () => getFeaturedBlogPosts(limit),
    staleTime: 10 * 60 * 1000,
  })
}

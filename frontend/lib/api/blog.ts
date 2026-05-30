import { createClient } from '@/lib/supabase/client'
import type { BlogPost, BlogFilter } from '@/types'

export async function getBlogPosts(filter: BlogFilter = {}) {
  const supabase = createClient()

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:users(id, first_name, last_name, avatar),
      tags:blog_post_tags(tag:blog_tags(*))
    `)
    .eq('status', 'published')

  if (filter.categoryId) query = query.eq('category_id', filter.categoryId)
  if (filter.isFeatured !== undefined) query = query.eq('is_featured', filter.isFeatured)
  if (filter.search) query = query.ilike('title', `%${filter.search}%`)

  query = query.order('published_at', { ascending: false })

  const page = filter.page ?? 1
  const limit = filter.limit ?? 12
  query = query.range((page - 1) * limit, page * limit - 1)

  const { data, error, count } = await query
  if (error) throw error

  return {
    posts: (data ?? []) as unknown as BlogPost[],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getBlogPost(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:users(id, first_name, last_name, avatar),
      tags:blog_post_tags(tag:blog_tags(*))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) throw error

  supabase.rpc('increment_blog_view', { post_slug: slug }).then(() => {})

  return data as unknown as BlogPost
}

export async function getFeaturedBlogPosts(limit = 3) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id, title, slug, excerpt, cover_image, reading_time, view_count, published_at,
      category:blog_categories(name, slug),
      author:users(first_name, last_name)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as BlogPost[]
}

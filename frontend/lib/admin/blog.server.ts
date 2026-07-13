import { createClient } from '@/lib/supabase/server'

export async function fetchBlogPostsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, status, view_count, created_at, published_at, category:blog_categories(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchBlogPostServer(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function fetchBlogCategoriesServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('blog_categories').select('*').order('order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchBlogTagsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('blog_tags').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchBlogCommentsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_comments')
    .select('id, content, is_approved, created_at, author_name, post:blog_posts(title)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function saveBlogPostServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const row = { ...input, author_id: input.author_id ?? user?.id ?? null }

  if (id) {
    const { error } = await supabase.from('blog_posts').update(row).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('blog_posts').insert(row).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function deleteBlogPostServer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw error
}

export async function saveBlogCategoryServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('blog_categories').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('blog_categories').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function saveBlogTagServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('blog_tags').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('blog_tags').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function setBlogCommentApprovedServer(id: string, isApproved: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('blog_comments').update({ is_approved: isApproved }).eq('id', id)
  if (error) throw error
}

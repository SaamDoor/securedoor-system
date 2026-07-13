import { createClient } from '@/lib/supabase/server'

export async function fetchPagesServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('pages').select('*').order('title')
  if (error) throw error
  return data ?? []
}

export async function savePageServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('pages').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('pages').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function deletePageServer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('pages').delete().eq('id', id)
  if (error) throw error
}

export async function fetchFaqsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*, category:faq_categories(name)')
    .order('order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function saveFaqServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('faqs').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('faqs').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function fetchMenusServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menus')
    .select('*, items:menu_items(*)')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function saveMenuServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('menus').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('menus').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function fetchBannersServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('banners').select('*').order('order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function saveBannerServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('banners').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('banners').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function fetchRedirectsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('redirects').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function saveRedirectServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('redirects').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('redirects').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function fetchSeoSettingsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('seo_settings').select('*').order('page_label')
  if (error) throw error
  return data ?? []
}

export async function saveSeoSettingServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('seo_settings').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('seo_settings').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

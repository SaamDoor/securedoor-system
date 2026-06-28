import { createClient } from './client'

export const BUCKETS = {
  products: process.env.SUPABASE_PRODUCTS_BUCKET ?? 'products',
  blog: process.env.SUPABASE_BLOG_BUCKET ?? 'blog',
  banners: process.env.SUPABASE_BANNERS_BUCKET ?? 'banners',
  brands: process.env.SUPABASE_BRANDS_BUCKET ?? 'brands',
  avatars: process.env.SUPABASE_AVATARS_BUCKET ?? 'avatars',
  invoices: process.env.SUPABASE_INVOICES_BUCKET ?? 'invoices',
  orderFiles: process.env.SUPABASE_ORDER_FILES_BUCKET ?? 'order-files',
  chat: process.env.SUPABASE_CHAT_BUCKET ?? 'chat',
  cms: process.env.SUPABASE_CMS_BUCKET ?? 'cms',
  downloads: process.env.SUPABASE_DOWNLOADS_BUCKET ?? 'downloads',
} as const

export type BucketKey = keyof typeof BUCKETS

export function getPublicUrl(bucket: BucketKey, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage
    .from(BUCKETS[bucket])
    .getPublicUrl(path)
  return data.publicUrl
}

export async function uploadFile(
  bucket: BucketKey,
  path: string,
  file: File,
  options?: { upsert?: boolean; contentType?: string },
): Promise<{ url: string; path: string }> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(BUCKETS[bucket])
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      contentType: options?.contentType ?? file.type,
    })

  if (error) throw error

  const publicUrl = getPublicUrl(bucket, data.path)
  return { url: publicUrl, path: data.path }
}

export async function deleteFile(
  bucket: BucketKey,
  paths: string[],
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKETS[bucket]).remove(paths)
  if (error) throw error
}

export function generateFilePath(
  folder: string,
  filename: string,
): string {
  const timestamp = Date.now()
  const ext = filename.split('.').pop()
  const name = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
  return `${folder}/${name}-${timestamp}.${ext}`
}


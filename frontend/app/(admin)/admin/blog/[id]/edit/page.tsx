import { BlogForm } from '@/app/(admin)/admin/blog/blog-form'
import { fetchBlogPostServer } from '@/lib/admin/blog.server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params
  let post = null
  let error: string | null = null
  try {
    const row = await fetchBlogPostServer(id)
    post = {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt ?? '',
      category: '',
      content: row.content,
      reading_time: row.reading_time ?? 5,
      status: row.status as 'draft' | 'published' | 'scheduled',
      cover_image: row.cover_image,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      publish_date: row.published_at,
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'خطا در بارگذاری مطلب'
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">ویرایش نوشته</h1>
          <p className="text-zinc-400 mt-1">{post?.title ?? 'ویرایش مقاله'}</p>
        </div>
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        ) : (
          <BlogForm post={post ?? undefined} />
        )}
      </div>
    </div>
  )
}

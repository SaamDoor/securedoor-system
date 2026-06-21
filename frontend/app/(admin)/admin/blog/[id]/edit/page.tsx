import { BlogForm } from '@/app/(admin)/admin/blog/blog-form'

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">ویرایش نوشته</h1>
          <p className="text-zinc-400 mt-1">ویرایش مقاله شماره {params.id}</p>
        </div>
        <BlogForm />
      </div>
    </div>
  )
}

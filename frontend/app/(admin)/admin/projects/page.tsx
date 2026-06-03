import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Building2, Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConstructionProject } from '@/types'
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_COLOR } from '@/types'
import { DeleteProjectButton } from './delete-project-button'

async function ProjectsTable() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('construction_projects')
    .select('id, title, slug, status, area, location, is_featured, is_active, view_count, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="text-center py-16 text-danger">
        خطا در بارگذاری پروژه‌ها: {error.message}
      </div>
    )
  }

  if (!projects?.length) {
    return (
      <div className="text-center py-20">
        <Building2 className="h-16 w-16 text-muted mx-auto mb-4 opacity-30" />
        <p className="text-muted text-lg mb-6">هنوز پروژه‌ای ثبت نشده است</p>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black rounded-xl font-bold hover:bg-gold-light transition-colors"
        >
          <Plus className="h-5 w-5" />
          اولین پروژه را اضافه کنید
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-white/3">
            <th className="text-right px-5 py-3.5 text-muted font-medium">عنوان پروژه</th>
            <th className="text-right px-5 py-3.5 text-muted font-medium">وضعیت</th>
            <th className="text-right px-5 py-3.5 text-muted font-medium hidden md:table-cell">موقعیت</th>
            <th className="text-right px-5 py-3.5 text-muted font-medium hidden lg:table-cell">متراژ</th>
            <th className="text-right px-5 py-3.5 text-muted font-medium hidden lg:table-cell">بازدید</th>
            <th className="text-right px-5 py-3.5 text-muted font-medium">انتشار</th>
            <th className="text-right px-5 py-3.5 text-muted font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {(projects as Pick<ConstructionProject, 'id'|'title'|'slug'|'status'|'area'|'location'|'is_featured'|'is_active'|'view_count'|'created_at'>[]).map((p) => (
            <tr key={p.id} className="hover:bg-white/2 transition-colors">
              <td className="px-5 py-4">
                <div className="font-semibold text-white">{p.title}</div>
                <div className="text-xs text-muted mt-0.5">{p.slug}</div>
              </td>
              <td className="px-5 py-4">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', PROJECT_STATUS_COLOR[p.status])}>
                  {PROJECT_STATUS_LABEL[p.status]}
                </span>
              </td>
              <td className="px-5 py-4 text-muted hidden md:table-cell">{p.location ?? '—'}</td>
              <td className="px-5 py-4 text-muted hidden lg:table-cell">
                {p.area ? `${p.area.toLocaleString('fa-IR')} م²` : '—'}
              </td>
              <td className="px-5 py-4 text-muted hidden lg:table-cell">
                {p.view_count.toLocaleString('fa-IR')}
              </td>
              <td className="px-5 py-4">
                <span className={cn('w-2 h-2 rounded-full inline-block', p.is_active ? 'bg-emerald-400' : 'bg-red-400')} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/projects/${p.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/8 transition-all"
                    title="مشاهده"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/projects/${p.id}/edit`}
                    className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/10 transition-all"
                    title="ویرایش"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteProjectButton id={p.id} title={p.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">پروژه‌های ساختمانی</h1>
          <p className="text-muted text-sm mt-1">مدیریت و نمایش پروژه‌های معماری و ساختمانی گروه</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-black rounded-xl font-bold hover:bg-gold-light transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          پروژه جدید
        </Link>
      </div>

      {/* Table */}
      <Suspense fallback={<div className="h-64 animate-pulse bg-white/3 rounded-2xl" />}>
        <ProjectsTable />
      </Suspense>
    </div>
  )
}

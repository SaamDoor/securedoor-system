import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '../../project-form'
import type { ConstructionProject } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('construction_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) notFound()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/admin/projects" className="hover:text-white transition-colors">
          پروژه‌های ساختمانی
        </Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-white">{project.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-black text-white">ویرایش پروژه</h1>
        <p className="text-muted text-sm mt-1">{project.title}</p>
      </div>

      <ProjectForm project={project as ConstructionProject} />
    </div>
  )
}

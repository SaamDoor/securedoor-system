import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProjectForm } from '../project-form'

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/admin/projects" className="hover:text-white transition-colors">
          پروژه‌های ساختمانی
        </Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-white">پروژه جدید</span>
      </div>

      <div>
        <h1 className="text-2xl font-black text-white">افزودن پروژه جدید</h1>
        <p className="text-muted text-sm mt-1">اطلاعات پروژه ساختمانی / معماری را وارد کنید</p>
      </div>

      <ProjectForm />
    </div>
  )
}

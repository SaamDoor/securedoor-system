'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Props {
  id: string
  title: string
}

export function DeleteProjectButton({ id, title }: Props) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('construction_projects').delete().eq('id', id)
    if (error) {
      toast.error('خطا در حذف پروژه: ' + error.message)
    } else {
      toast.success(`پروژه "${title}" حذف شد`)
      router.refresh()
    }
    setIsDeleting(false)
    setIsConfirming(false)
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
        >
          {isDeleting ? '...' : 'تأیید'}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          className="px-2 py-1 rounded-lg bg-white/8 text-muted text-xs hover:bg-white/12 transition-all"
        >
          لغو
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
      title="حذف"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

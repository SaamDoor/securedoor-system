'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProduct } from '@/lib/api/products'

interface Props {
  id: string
  name: string
}

export function DeleteProductButton({ id, name }: Props) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteProduct(id)
      toast.success(`محصول "${name}" حذف شد`)
      router.refresh()
    } catch (err) {
      toast.error('خطا در حذف محصول: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsDeleting(false)
      setIsConfirming(false)
    }
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
      aria-label="حذف"
      className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#E74C3C] hover:border-[#C0392B]/30 transition-all"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}

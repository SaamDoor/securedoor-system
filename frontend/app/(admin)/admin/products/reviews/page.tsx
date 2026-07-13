'use client'

import { useEffect, useState, useTransition } from 'react'
import { CheckCircle, Star, XCircle } from 'lucide-react'
import { formatJalaliDate } from '@/lib/utils'
import { getProductReviewsAction, setReviewApprovedAction } from '../../actions'

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={14} className={i <= count ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'} />
    ))}
  </div>
)

export default function ProductReviewsPage() {
  const [reviews, setReviews] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getProductReviewsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setReviews(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function setApproval(id: string, approved: boolean) {
    startTransition(async () => {
      const result = await setReviewApprovedAction(id, approved)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">نظرات محصولات</h1>
          <p className="mt-1 text-zinc-400">تأیید یا رد نظرات از `product_reviews`</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">محصول</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">کاربر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">امتیاز</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نظر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">نظری موجود نیست</td></tr>
              ) : reviews.map((review) => (
                <tr key={review.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-100">{review.product?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{`${review.user?.first_name ?? ''} ${review.user?.last_name ?? ''}`.trim() || '—'}</td>
                  <td className="px-6 py-4"><Stars count={Number(review.rating ?? 0)} /></td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{review.comment ?? review.content ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{review.created_at ? formatJalaliDate(review.created_at) : '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button disabled={isPending} onClick={() => setApproval(review.id, true)} className="text-green-400 disabled:opacity-60"><CheckCircle size={16} /></button>
                      <button disabled={isPending} onClick={() => setApproval(review.id, false)} className="text-red-400 disabled:opacity-60"><XCircle size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

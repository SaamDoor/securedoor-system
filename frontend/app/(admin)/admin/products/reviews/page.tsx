import { Star, CheckCircle, XCircle } from 'lucide-react'

const mockReviews = [
  { id: 1, product: 'درب ضد سرقت استاندارد', user: 'احمد رضایی', rating: 5, text: 'کیفیت بسیار عالی. کاملاً راضی هستم.', date: '۱۴۰۳/۰۴/۰۲', status: 'در انتظار' },
  { id: 2, product: 'چهارچوب فلزی Z-پروفیل', user: 'مریم احمدی', rating: 4, text: 'خوب بود ولی نصب کمی زمانبر بود.', date: '۱۴۰۳/۰۴/۰۱', status: 'تأییدشده' },
  { id: 3, product: 'درب چوبی MDF', user: 'علی کریمی', rating: 3, text: 'متوسط بود. انتظار بیشتری داشتم.', date: '۱۴۰۳/۰۳/۲۸', status: 'در انتظار' },
  { id: 4, product: 'درب اتوماتیک پارکینگ', user: 'فاطمه موسوی', rating: 5, text: 'عالی! بهترین سرمایه‌گذاری بود.', date: '۱۴۰۳/۰۳/۲۵', status: 'تأییدشده' },
]

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={14} className={i <= count ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'} />
    ))}
  </div>
)

export default function ProductReviewsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">نظرات محصولات</h1>
          <p className="text-zinc-400 mt-1">تأیید یا رد نظرات و امتیازات کاربران</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">محصول</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کاربر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">امتیاز</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">متن نظر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockReviews.map(r => (
                <tr key={r.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium text-sm">{r.product}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.user}</td>
                  <td className="px-6 py-4"><Stars count={r.rating} /></td>
                  <td className="px-6 py-4 text-zinc-400 text-sm max-w-xs">
                    <span className="line-clamp-1">{r.text}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'تأییدشده' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.status === 'در انتظار' && (
                      <div className="flex items-center gap-2">
                        <button className="text-green-400 hover:text-green-300 transition-colors"><CheckCircle size={16} /></button>
                        <button className="text-red-400 hover:text-red-300 transition-colors"><XCircle size={16} /></button>
                      </div>
                    )}
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

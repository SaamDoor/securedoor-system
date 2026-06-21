import { Users, Edit } from 'lucide-react'

const mockTiers = [
  { id: 1, name: 'عادی', minPurchase: '—', discount: '۰%', members: 1240, color: 'bg-zinc-600' },
  { id: 2, name: 'انبوه‌ساز', minPurchase: '۱۰۰,۰۰۰,۰۰۰ ت', discount: '۱۰%', members: 87, color: 'bg-blue-700' },
  { id: 3, name: 'فروشنده', minPurchase: '۵۰۰,۰۰۰,۰۰۰ ت', discount: '۱۵%', members: 23, color: 'bg-amber-600' },
]

export default function PricingTiersPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">سطوح قیمت‌گذاری</h1>
          <p className="text-zinc-400 mt-1">مدیریت تیرهای تخفیف بر اساس حجم خرید یا نقش کاربر</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {mockTiers.map(tier => (
            <div key={tier.id} className="bg-zinc-800 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${tier.color} flex items-center justify-center`}>
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-zinc-100 font-bold text-lg">{tier.name}</h3>
                  <p className="text-zinc-400 text-sm mt-0.5">{tier.members} عضو فعال</p>
                </div>
              </div>
              <div className="flex items-center gap-12">
                <div className="text-center">
                  <p className="text-zinc-500 text-xs mb-1">حداقل خرید</p>
                  <p className="text-zinc-200 font-medium">{tier.minPurchase}</p>
                </div>
                <div className="text-center">
                  <p className="text-zinc-500 text-xs mb-1">درصد تخفیف</p>
                  <p className="text-amber-400 font-bold text-xl">{tier.discount}</p>
                </div>
                <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors">
                  <Edit size={16} /> ویرایش
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

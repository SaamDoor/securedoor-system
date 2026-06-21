'use client'
import { useState } from 'react'
import { Truck, Edit } from 'lucide-react'

const initialMethods = [
  { id: 1, name: 'ارسال عادی پستی', price: '۸۰,۰۰۰ ت', delivery: '۳ تا ۵ روز کاری', active: true },
  { id: 2, name: 'ارسال سریع', price: '۱۵۰,۰۰۰ ت', delivery: '۱ تا ۲ روز کاری', active: true },
  { id: 3, name: 'نصب و تحویل توسط تیم ما', price: 'رایگان', delivery: '۷ تا ۱۴ روز کاری', active: false },
]

export default function ShippingPage() {
  const [methods, setMethods] = useState(initialMethods)

  const toggleMethod = (id: number) => {
    setMethods(methods.map(m => m.id === id ? { ...m, active: !m.active } : m))
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">روش‌های ارسال</h1>
          <p className="text-zinc-400 mt-1">مدیریت روش‌های حمل‌ونقل و ارسال سفارشات</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام روش</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">زمان تحویل</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {methods.map(method => (
                <tr key={method.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-amber-400" />
                      <span className="text-zinc-100 font-medium">{method.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{method.price}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{method.delivery}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleMethod(method.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${method.active ? 'bg-amber-500' : 'bg-zinc-600'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${method.active ? 'right-1' : 'right-7'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-amber-400 hover:text-amber-300 transition-colors"><Edit size={16} /></button>
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

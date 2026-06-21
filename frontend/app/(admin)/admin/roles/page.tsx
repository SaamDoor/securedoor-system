import { Shield, Edit, Users } from 'lucide-react'

const mockRoles = [
  {
    id: 1, name: 'super_admin', label: 'سوپر ادمین', users: 1,
    permissions: ['مدیریت کامل سیستم', 'تنظیمات پیشرفته', 'مدیریت نقش‌ها'],
  },
  {
    id: 2, name: 'admin', label: 'ادمین', users: 3,
    permissions: ['مدیریت محصولات', 'مدیریت کاربران', 'مشاهده گزارشات'],
  },
  {
    id: 3, name: 'manager', label: 'مدیر', users: 5,
    permissions: ['مدیریت سفارشات', 'مدیریت تیکت‌ها', 'مشاهده مالی'],
  },
  {
    id: 4, name: 'support', label: 'پشتیبانی', users: 8,
    permissions: ['مشاهده تیکت‌ها', 'پاسخ به تیکت‌ها', 'مشاهده کاربران'],
  },
  {
    id: 5, name: 'customer', label: 'مشتری', users: 1240,
    permissions: ['ثبت سفارش', 'مشاهده فاکتور', 'ارسال تیکت'],
  },
]

export default function RolesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">مدیریت نقش‌ها</h1>
          <p className="text-zinc-400 mt-1">تعریف نقش‌ها و سطوح دسترسی کاربران</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام نقش</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تعداد کاربر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دسترسی‌ها</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockRoles.map(role => (
                <tr key={role.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-amber-400" />
                      <div>
                        <p className="text-zinc-100 font-medium">{role.label}</p>
                        <p className="text-zinc-500 text-xs font-mono">{role.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-zinc-400 text-sm">
                      <Users size={14} /> {role.users}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded text-xs">{p}</span>
                      ))}
                    </div>
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

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Heart, User, MapPin,
  MessageCircle, Bell, Download, Settings, LogOut, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'داشبورد', href: '/user/dashboard', icon: LayoutDashboard },
  { label: 'سفارشات', href: '/user/orders', icon: ShoppingBag },
  { label: 'فاکتورها', href: '/user/invoices', icon: FileText },
  { label: 'علاقه‌مندی‌ها', href: '/user/wishlist', icon: Heart },
  { label: 'پروفایل', href: '/user/profile', icon: User },
  { label: 'آدرس‌ها', href: '/user/addresses', icon: MapPin },
  { label: 'پیام‌ها', href: '/user/messages', icon: MessageCircle, badge: 2 },
  { label: 'اعلانات', href: '/user/notifications', icon: Bell, badge: 5 },
  { label: 'دانلودها', href: '/user/downloads', icon: Download },
  { label: 'تنظیمات', href: '/user/settings', icon: Settings },
]

export function UserSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block w-64 flex-shrink-0">
      {/* User card */}
      <div className="p-5 rounded-2xl bg-surface border border-white/8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-xl font-black text-gold">
            م
          </div>
          <div>
            <div className="font-bold text-white text-sm">مهمان کاربری</div>
            <div className="text-xs text-gold">مشتری ویژه</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="rounded-2xl bg-surface border border-white/8 overflow-hidden">
        {navItems.map((item, i) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 text-sm transition-all duration-200',
                'border-b border-white/5 last:border-b-0',
                isActive
                  ? 'bg-gold/10 text-gold border-r-2 border-r-gold'
                  : 'text-muted hover:text-white hover:bg-white/5',
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </div>
              {item.badge && (
                <span className="w-5 h-5 rounded-full bg-danger text-white text-2xs font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        {/* Logout */}
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-colors border-t border-white/8">
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </nav>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart3,
  Settings, FileText, MessageCircle, Image, Layers,
  Plug, Webhook, ChevronDown, Store, Tag, Megaphone,
  HelpCircle, Globe, LogOut, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE_NAME } from '@/lib/constants'
import type { UserRole } from '@/types'

type NavChild = { label: string; href: string; icon: React.ElementType; roles?: UserRole[] }
type NavItem =
  | { label: string; href: string; icon: React.ElementType; badge?: string; roles?: UserRole[] }
  | { label: string; icon: React.ElementType; children: NavChild[]; roles?: UserRole[] }

const FULL_ACCESS: UserRole[] = ['super_admin', 'admin', 'manager']
const ALL_ADMIN: UserRole[] = ['super_admin', 'admin', 'manager', 'support']

const navItems: NavItem[] = [
  { label: 'داشبورد', href: '/admin/dashboard', icon: LayoutDashboard, roles: ALL_ADMIN },
  {
    label: 'فروشگاه',
    icon: Store,
    roles: ALL_ADMIN,
    children: [
      { label: 'سفارشات',       href: '/admin/orders',     icon: ShoppingBag, roles: ALL_ADMIN },
      { label: 'محصولات',       href: '/admin/products',   icon: Package,     roles: FULL_ACCESS },
      { label: 'دسته‌بندی‌ها', href: '/admin/categories', icon: Layers,      roles: FULL_ACCESS },
      { label: 'کوپن‌ها',       href: '/admin/coupons',    icon: Tag,         roles: FULL_ACCESS },
      { label: 'روش‌های ارسال', href: '/admin/shipping',   icon: Package,     roles: FULL_ACCESS },
    ],
  },
  {
    label: 'کاربران',
    icon: Users,
    roles: FULL_ACCESS,
    children: [
      { label: 'لیست کاربران',   href: '/admin/users',      icon: Users,    roles: FULL_ACCESS },
      { label: 'نقش‌ها و مجوزها', href: '/admin/roles',     icon: Shield,   roles: ['super_admin'] },
      { label: 'لاگ فعالیت',    href: '/admin/audit-logs', icon: FileText, roles: FULL_ACCESS },
    ],
  },
  {
    label: 'محتوا',
    icon: FileText,
    roles: FULL_ACCESS,
    children: [
      { label: 'وبلاگ',        href: '/admin/blog',    icon: FileText },
      { label: 'صفحات',        href: '/admin/pages',   icon: Globe },
      { label: 'بنرها',        href: '/admin/banners', icon: Image },
      { label: 'منوها',        href: '/admin/menus',   icon: Layers },
      { label: 'سوالات متداول', href: '/admin/faqs',   icon: HelpCircle },
    ],
  },
  { label: 'پیام‌ها', href: '/admin/messages', icon: MessageCircle, badge: '۷', roles: ALL_ADMIN },
  { label: 'گزارشات', href: '/admin/reports',  icon: BarChart3,                 roles: FULL_ACCESS },
  {
    label: 'یکپارچه‌سازی',
    icon: Plug,
    roles: ['super_admin', 'admin'],
    children: [
      { label: 'مرکز یکپارچه‌سازی', href: '/admin/integrations', icon: Plug },
      { label: 'پیکربندی API',       href: '/admin/api-config',   icon: Settings },
      { label: 'وب‌هوک‌ها',         href: '/admin/webhooks',      icon: Webhook },
    ],
  },
  { label: 'تنظیمات', href: '/admin/settings', icon: Settings, roles: ['super_admin'] },
]

function canSee(roles: UserRole[] | undefined, role: UserRole) {
  return !roles || roles.includes(role)
}

export function AdminSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState(['فروشگاه', 'محتوا'])

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    )
  }

  return (
    <aside className="admin-sidebar bg-charcoal border-l border-white/8 flex flex-col h-screen sticky top-0 overflow-y-auto hide-scrollbar">
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold-sm">
            <span className="text-black font-black text-base">س</span>
          </div>
          <div>
            <div className="font-black text-white text-sm">{SITE_NAME}</div>
            <div className="text-2xs text-gold">پنل مدیریت</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.filter((item) => canSee(item.roles, role)).map((item) => {
          if ('children' in item) {
            const visibleChildren = item.children.filter((c) => canSee(c.roles, role))
            const isGroupOpen = openGroups.includes(item.label)
            const isGroupActive = visibleChildren.some(
              (c) => pathname === c.href || pathname.startsWith(c.href + '/'),
            )
            const GroupIcon = item.icon

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all',
                    isGroupActive
                      ? 'text-white bg-white/5'
                      : 'text-muted hover:text-white hover:bg-white/3',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <GroupIcon className={cn('h-4 w-4', isGroupActive && 'text-gold')} />
                    {item.label}
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      isGroupOpen && 'rotate-180',
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isGroupOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mr-4 border-r border-white/8 pr-2 mt-0.5 space-y-0.5 mb-1">
                        {visibleChildren.map((child) => {
                          const ChildIcon = child.icon
                          const isActive = pathname === child.href

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all',
                                isActive
                                  ? 'bg-gold/10 text-gold'
                                  : 'text-muted hover:text-white hover:bg-white/5',
                              )}
                            >
                              <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-muted hover:text-white hover:bg-white/5',
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-danger text-white text-2xs font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/8">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted hover:text-white hover:bg-white/5 transition-all"
        >
          <Globe className="h-4 w-4" />
          مشاهده سایت
        </Link>
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-danger hover:bg-danger/10 transition-all">
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </div>
    </aside>
  )
}

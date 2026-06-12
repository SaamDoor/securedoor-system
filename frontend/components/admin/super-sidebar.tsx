'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LayoutGrid,
  Warehouse,
  Tag,
  DollarSign,
  List,
  History,
  Ticket,
  FileText,
  FolderOpen,
  Globe,
  Settings,
  Image,
  MapPin,
  Percent,
  Users,
  UserCog,
  Star,
  Wallet,
  TrendingUp,
  CreditCard,
  BarChart3,
  MessageSquare,
  ClipboardList,
  Library,
  Plug,
  Webhook,
  ScrollText,
  ChevronDown,
  ChevronRight,
  Search,
  Shield,
  AlertCircle,
} from 'lucide-react'
import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
//  NAV TREE
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label:    string
  href?:    string
  icon:     React.ElementType
  badge?:   string | number
  children?: NavItem[]
}

interface NavGroup {
  title:  string
  items:  NavItem[]
}

const NAV: NavGroup[] = [
  {
    title: 'داشبورد',
    items: [
      {
        label: 'نمای کلی',
        href:  '/admin/super-dashboard',
        icon:  LayoutDashboard,
      },
    ],
  },
  {
    title: 'فروشگاه',
    items: [
      {
        label: 'سفارشات',
        icon:  ShoppingCart,
        children: [
          { label: 'همه سفارشات',   href: '/admin/orders',             icon: List },
          { label: 'کانبان سفارش',  href: '/admin/orders/kanban',      icon: LayoutGrid },
        ],
      },
      {
        label: 'محصولات',
        icon:  Package,
        children: [
          { label: 'همه محصولات',   href: '/admin/products',           icon: List },
          { label: 'افزودن محصول',  href: '/admin/products/new',       icon: Package },
          { label: 'دسته‌بندی‌ها', href: '/admin/products/categories', icon: LayoutGrid },
        ],
      },
      { label: 'پروژه‌ها',    href: '/admin/projects',   icon: FolderOpen },
      { label: 'کوپن‌های تخفیف', href: '/admin/coupons', icon: Ticket },
    ],
  },
  {
    title: 'موتور قیمت‌گذاری',
    items: [
      {
        label: 'قیمت‌گذاری پویا',
        icon:  DollarSign,
        children: [
          { label: 'قیمت پایه محصولات',   href: '/admin/super-dashboard/pricing/products',  icon: Package },
          { label: 'لیست قیمت چهارچوب',   href: '/admin/super-dashboard/pricing/frames',    icon: List },
          { label: 'تاریخچه تغییر قیمت',  href: '/admin/super-dashboard/pricing/history',   icon: History },
          { label: 'تیرهای تخفیف سازنده', href: '/admin/super-dashboard/pricing/tiers',     icon: Star },
        ],
      },
    ],
  },
  {
    title: 'محتوا',
    items: [
      {
        label: 'وبلاگ',
        icon:  FileText,
        children: [
          { label: 'نوشته‌ها',         href: '/admin/super-dashboard/blog/posts',      icon: List },
          { label: 'دسته‌بندی وبلاگ',  href: '/admin/super-dashboard/blog/categories', icon: LayoutGrid },
          { label: 'برچسب‌ها',         href: '/admin/super-dashboard/blog/tags',        icon: Tag },
        ],
      },
      { label: 'پروژه‌های نمونه', href: '/admin/projects',                   icon: FolderOpen },
      { label: 'صفحات ایستا',     href: '/admin/super-dashboard/cms/pages',  icon: Globe },
    ],
  },
  {
    title: 'تنظیمات جهانی',
    items: [
      {
        label: 'اطلاعات سایت',
        icon:  Settings,
        children: [
          { label: 'هیرو و بنرها',    href: '/admin/super-dashboard/settings/hero',     icon: Image },
          { label: 'اطلاعات تماس',    href: '/admin/super-dashboard/settings/contact',  icon: MapPin },
          { label: 'شبکه‌های اجتماعی', href: '/admin/super-dashboard/settings/social',  icon: Globe },
          { label: 'مالیات و کمیسیون', href: '/admin/super-dashboard/settings/financial', icon: Percent },
          { label: 'عمومی',            href: '/admin/super-dashboard/settings/general',  icon: Settings },
        ],
      },
    ],
  },
  {
    title: 'سئو',
    items: [
      {
        label: 'مدیریت سئو',
        icon:  Search,
        children: [
          { label: 'تنظیمات صفحات',   href: '/admin/super-dashboard/seo/pages',        icon: List },
          { label: 'داده ساختاریافته', href: '/admin/super-dashboard/seo/structured',   icon: ScrollText },
        ],
      },
    ],
  },
  {
    title: 'کاربران و نقش‌ها',
    items: [
      {
        label: 'کاربران',
        icon:  Users,
        children: [
          { label: 'همه کاربران',    href: '/admin/users',                              icon: List },
          { label: 'مشتریان VIP',   href: '/admin/users?role=support',                 icon: Star },
          { label: 'همکاران فروش',  href: '/admin/users?role=manager',                 icon: TrendingUp },
          { label: 'ادمین‌ها',      href: '/admin/users?role=admin',                   icon: Shield },
        ],
      },
      { label: 'مدیریت نقش‌ها',    href: '/admin/super-dashboard/roles',              icon: UserCog },
      { label: 'سطح‌بندی سازندگان', href: '/admin/super-dashboard/pricing/tiers',     icon: Star },
    ],
  },
  {
    title: 'امور مالی',
    items: [
      { label: 'کیف پول‌ها',        href: '/admin/super-dashboard/finance/wallets',   icon: Wallet },
      {
        label: 'همکاران فروش',
        icon:  TrendingUp,
        children: [
          { label: 'کمیسیون‌ها',      href: '/admin/super-dashboard/finance/commissions', icon: Percent },
          { label: 'درخواست برداشت',  href: '/admin/super-dashboard/finance/payouts',     icon: CreditCard },
        ],
      },
      { label: 'گزارش درآمد',       href: '/admin/super-dashboard/finance/revenue',    icon: BarChart3 },
    ],
  },
  {
    title: 'پشتیبانی',
    items: [
      { label: 'تیکت‌ها',           href: '/admin/super-dashboard/support/tickets',   icon: MessageSquare },
      { label: 'پیشنهادات انبوه',   href: '/admin/super-dashboard/support/quotes',    icon: ClipboardList },
    ],
  },
  {
    title: 'رسانه',
    items: [
      { label: 'کتابخانه رسانه',   href: '/admin/super-dashboard/media',              icon: Library },
    ],
  },
  {
    title: 'یکپارچه‌سازی',
    items: [
      { label: 'ادغام‌ها',           href: '/admin/integrations',                      icon: Plug },
      { label: 'وب‌هوک‌ها',          href: '/admin/webhooks',                           icon: Webhook },
    ],
  },
  {
    title: 'لاگ‌ها',
    items: [
      { label: 'لاگ‌های ممیزی',    href: '/admin/super-dashboard/logs/audit',         icon: ScrollText },
      { label: 'خطاها',             href: '/admin/super-dashboard/logs/errors',        icon: AlertCircle },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function NavLeaf({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const isActive  = item.href ? pathname === item.href : false

  return (
    <Link
      href={item.href ?? '#'}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        depth > 0 && 'ml-4 text-xs',
        isActive
          ? 'bg-amber-500/15 text-amber-400 font-medium'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
      )}
    >
      <item.icon
        className={cn(
          'shrink-0',
          depth === 0 ? 'h-4 w-4' : 'h-3.5 w-3.5',
          isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300',
        )}
      />
      <span className="truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className="ml-auto rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function NavBranch({ item }: { item: NavItem }) {
  const pathname   = usePathname()
  const isChildActive = item.children?.some((c) => c.href && pathname.startsWith(c.href))
  const [open, setOpen] = useState<boolean>(isChildActive ?? false)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isChildActive
            ? 'bg-zinc-800 text-zinc-100'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
        )}
      >
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0',
            isChildActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300',
          )}
        />
        <span className="flex-1 truncate text-right">{item.label}</span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        )}
      </button>

      {open && item.children && (
        <div className="mt-0.5 space-y-0.5 border-r border-zinc-800 mr-[22px] pr-1">
          {item.children.map((child) => (
            <NavLeaf key={child.label} item={child} depth={1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTED SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

interface SuperSidebarProps {
  className?: string
}

export function SuperSidebar({ className }: SuperSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col overflow-y-auto bg-zinc-900 text-right',
        className,
      )}
      dir="rtl"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
          <Shield className="h-4 w-4 text-black" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">پنل سوپر ادمین</p>
          <p className="text-xs text-zinc-500">گروه صنعتی مشعوف</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) =>
                item.children ? (
                  <NavBranch key={item.label} item={item} />
                ) : (
                  <NavLeaf key={item.label} item={item} />
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          برگشت به پنل ادمین
        </Link>
      </div>
    </aside>
  )
}

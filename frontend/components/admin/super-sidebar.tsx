'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, ShoppingCart, Package, LayoutGrid, Warehouse,
  Tag, DollarSign, List, History, Ticket, FileText, FolderOpen,
  Globe, Settings, Image, MapPin, Percent, Users, UserCog, Star,
  Wallet, TrendingUp, CreditCard, BarChart3, MessageSquare,
  ClipboardList, Library, Plug, Webhook, ScrollText, ChevronDown,
  ChevronRight, Search, Shield, AlertCircle, RefreshCw, Layers,
  Mail, Bell, Lock, Database, GitMerge, Map, RotateCcw,
  HelpCircle, Megaphone, MessageCircle, ThumbsUp, Banknote,
  Receipt, BadgePercent, PieChart, Activity, Cpu, BookOpen,
  FileQuestion, Send, User, Columns, FileImage,
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
  // ── داشبورد ─────────────────────────────────────────────────────────────
  {
    title: 'داشبورد',
    items: [
      { label: 'نمای کلی',        href: '/admin/super-dashboard',          icon: LayoutDashboard },
      { label: 'آمار و تحلیل',    href: '/admin/super-dashboard/analytics', icon: PieChart },
      { label: 'وضعیت سیستم',     href: '/admin/super-dashboard/health',    icon: Activity },
    ],
  },

  // ── فروشگاه ─────────────────────────────────────────────────────────────
  {
    title: 'فروشگاه',
    items: [
      {
        label: 'سفارشات',
        icon:  ShoppingCart,
        children: [
          { label: 'همه سفارشات',    href: '/admin/orders',              icon: List     },
          { label: 'کانبان سفارش',   href: '/admin/orders/kanban',       icon: Columns  },
          { label: 'مرجوعی‌ها',      href: '/admin/orders/returns',      icon: RotateCcw },
          { label: 'مدیریت ارسال',   href: '/admin/orders/shipping',     icon: Package  },
        ],
      },
      {
        label: 'محصولات',
        icon:  Package,
        children: [
          { label: 'همه محصولات',     href: '/admin/products',            icon: List       },
          { label: 'افزودن محصول',    href: '/admin/products/new',        icon: Package    },
          { label: 'دسته‌بندی‌ها',   href: '/admin/products/categories', icon: LayoutGrid },
          { label: 'موجودی انبار',    href: '/admin/products/inventory',  icon: Warehouse  },
          { label: 'نظرات محصولات',   href: '/admin/products/reviews',   icon: ThumbsUp   },
        ],
      },
      {
        label: 'چهارچوب‌ها',
        icon:  Layers,
        children: [
          { label: 'لیست چهارچوب‌ها', href: '/admin/super-dashboard/frames',        icon: List       },
          { label: 'سفارشات چهارچوب', href: '/admin/super-dashboard/frames/orders', icon: ClipboardList },
          { label: 'قیمت‌گذاری',      href: '/admin/super-dashboard/pricing/frames', icon: DollarSign },
        ],
      },
      { label: 'پروژه‌ها',       href: '/admin/projects',    icon: FolderOpen    },
      { label: 'کوپن‌های تخفیف', href: '/admin/coupons',     icon: Ticket        },
    ],
  },

  // ── موتور قیمت‌گذاری ─────────────────────────────────────────────────────
  {
    title: 'موتور قیمت‌گذاری',
    items: [
      {
        label: 'قیمت‌گذاری پویا',
        icon:  DollarSign,
        children: [
          { label: 'قیمت پایه محصولات',    href: '/admin/super-dashboard/pricing/products', icon: Package     },
          { label: 'لیست قیمت چهارچوب',    href: '/admin/super-dashboard/pricing/frames',   icon: List        },
          { label: 'تاریخچه تغییر قیمت',   href: '/admin/super-dashboard/pricing/history',  icon: History     },
          { label: 'تیرهای تخفیف سازنده',  href: '/admin/super-dashboard/pricing/tiers',    icon: BadgePercent },
          { label: 'مقایسه قیمت رقبا',     href: '/admin/super-dashboard/pricing/compare',  icon: BarChart3   },
        ],
      },
    ],
  },

  // ── محتوا ────────────────────────────────────────────────────────────────
  {
    title: 'محتوا',
    items: [
      {
        label: 'وبلاگ',
        icon:  FileText,
        children: [
          { label: 'نوشته‌ها',         href: '/admin/super-dashboard/blog/posts',      icon: List        },
          { label: 'افزودن نوشته',     href: '/admin/super-dashboard/blog/new',        icon: FileText    },
          { label: 'دسته‌بندی وبلاگ',  href: '/admin/super-dashboard/blog/categories', icon: LayoutGrid  },
          { label: 'برچسب‌ها',         href: '/admin/super-dashboard/blog/tags',        icon: Tag         },
          { label: 'کامنت‌ها',         href: '/admin/super-dashboard/blog/comments',   icon: MessageCircle },
          { label: 'نویسندگان',        href: '/admin/super-dashboard/blog/authors',    icon: User        },
        ],
      },
      {
        label: 'صفحات و فرم‌ها',
        icon:  Globe,
        children: [
          { label: 'صفحات ایستا',     href: '/admin/super-dashboard/cms/pages',   icon: Globe     },
          { label: 'فرم‌های تماس',    href: '/admin/super-dashboard/cms/forms',   icon: FileQuestion },
          { label: 'سوالات متداول',   href: '/admin/super-dashboard/cms/faqs',   icon: HelpCircle  },
          { label: 'منوها',           href: '/admin/super-dashboard/cms/menus',   icon: List        },
        ],
      },
      { label: 'پروژه‌های نمونه',   href: '/admin/projects',                    icon: FolderOpen  },
      { label: 'اطلاعیه‌ها',        href: '/admin/super-dashboard/cms/notices', icon: Megaphone   },
      { label: 'کتابخانه رسانه',    href: '/admin/super-dashboard/media',       icon: Library     },
    ],
  },

  // ── سئو ──────────────────────────────────────────────────────────────────
  {
    title: 'سئو و دیجیتال مارکتینگ',
    items: [
      {
        label: 'مدیریت سئو',
        icon:  Search,
        children: [
          { label: 'تنظیمات صفحات',    href: '/admin/super-dashboard/seo/pages',      icon: List       },
          { label: 'داده ساختاریافته',  href: '/admin/super-dashboard/seo/structured', icon: ScrollText },
          { label: 'نقشه سایت',        href: '/admin/super-dashboard/seo/sitemap',    icon: Map        },
          { label: 'ریدایرکت‌ها',      href: '/admin/super-dashboard/seo/redirects',  icon: GitMerge   },
          { label: 'robots.txt',        href: '/admin/super-dashboard/seo/robots',     icon: Cpu        },
        ],
      },
    ],
  },

  // ── کاربران و نقش‌ها ──────────────────────────────────────────────────────
  {
    title: 'کاربران و نقش‌ها',
    items: [
      {
        label: 'کاربران',
        icon:  Users,
        children: [
          { label: 'همه کاربران',       href: '/admin/users',                         icon: List       },
          { label: 'مشتریان VIP',       href: '/admin/users?role=vip',                icon: Star       },
          { label: 'همکاران فروش',      href: '/admin/users?role=manager',            icon: TrendingUp },
          { label: 'ادمین‌ها',          href: '/admin/users?role=admin',              icon: Shield     },
          { label: 'درخواست‌های عضویت', href: '/admin/super-dashboard/users/requests', icon: UserCog   },
          { label: 'بلاک‌لیست',         href: '/admin/super-dashboard/users/blocked', icon: Lock       },
          { label: 'پیام دسته‌جمعی',   href: '/admin/super-dashboard/users/broadcast', icon: Send     },
        ],
      },
      { label: 'مدیریت نقش‌ها',      href: '/admin/super-dashboard/roles',          icon: UserCog    },
      { label: 'سطح‌بندی سازندگان',   href: '/admin/super-dashboard/pricing/tiers', icon: Star       },
    ],
  },

  // ── امور مالی ────────────────────────────────────────────────────────────
  {
    title: 'امور مالی',
    items: [
      { label: 'کیف پول‌ها',       href: '/admin/super-dashboard/finance/wallets',   icon: Wallet    },
      {
        label: 'همکاران فروش',
        icon:  TrendingUp,
        children: [
          { label: 'کمیسیون‌ها',      href: '/admin/super-dashboard/finance/commissions',  icon: Percent    },
          { label: 'درخواست برداشت',  href: '/admin/super-dashboard/finance/payouts',      icon: CreditCard },
          { label: 'گزارش پرفورمنس',  href: '/admin/super-dashboard/finance/performance',  icon: BarChart3  },
        ],
      },
      { label: 'فاکتورها',          href: '/admin/super-dashboard/finance/invoices',  icon: Receipt   },
      { label: 'گزارش درآمد',       href: '/admin/super-dashboard/finance/revenue',   icon: BarChart3 },
      { label: 'تنظیمات مالیاتی',   href: '/admin/super-dashboard/finance/tax',      icon: Banknote  },
    ],
  },

  // ── پشتیبانی ─────────────────────────────────────────────────────────────
  {
    title: 'پشتیبانی و ارتباطات',
    items: [
      { label: 'تیکت‌ها',           href: '/admin/super-dashboard/support/tickets',   icon: MessageSquare },
      { label: 'پیشنهادات انبوه',   href: '/admin/super-dashboard/support/quotes',    icon: ClipboardList },
      { label: 'پایگاه دانش',       href: '/admin/super-dashboard/support/kb',        icon: BookOpen      },
      { label: 'الگوهای پیام',      href: '/admin/super-dashboard/support/templates', icon: FileText      },
      { label: 'تنظیمات چت زنده',   href: '/admin/super-dashboard/support/livechat',  icon: MessageCircle },
    ],
  },

  // ── تنظیمات جهانی ────────────────────────────────────────────────────────
  {
    title: 'تنظیمات جهانی',
    items: [
      {
        label: 'اطلاعات سایت',
        icon:  Settings,
        children: [
          { label: 'عمومی',             href: '/admin/super-dashboard/settings/general',  icon: Settings  },
          { label: 'هیرو و بنرها',      href: '/admin/super-dashboard/settings/hero',     icon: Image     },
          { label: 'اطلاعات تماس',      href: '/admin/super-dashboard/settings/contact',  icon: MapPin    },
          { label: 'شبکه‌های اجتماعی',  href: '/admin/super-dashboard/settings/social',   icon: Globe     },
          { label: 'مالیات و کمیسیون',  href: '/admin/super-dashboard/settings/financial', icon: Percent  },
          { label: 'اطلاع‌رسانی',       href: '/admin/super-dashboard/settings/notify',   icon: Bell      },
          { label: 'ایمیل و پیامک',     href: '/admin/super-dashboard/settings/email',    icon: Mail      },
          { label: 'امنیت سیستم',       href: '/admin/super-dashboard/settings/security', icon: Lock      },
          { label: 'پشتیبان‌گیری',      href: '/admin/super-dashboard/settings/backup',   icon: Database  },
        ],
      },
    ],
  },

  // ── یکپارچه‌سازی ────────────────────────────────────────────────────────
  {
    title: 'یکپارچه‌سازی',
    items: [
      { label: 'ادغام‌ها',       href: '/admin/integrations',                   icon: Plug    },
      { label: 'پیکربندی API',   href: '/admin/super-dashboard/integrations/api', icon: Cpu    },
      { label: 'وب‌هوک‌ها',      href: '/admin/webhooks',                       icon: Webhook },
      { label: 'نرخ ارز',       href: '/admin/super-dashboard/integrations/currency', icon: RefreshCw },
    ],
  },

  // ── لاگ‌ها ──────────────────────────────────────────────────────────────
  {
    title: 'لاگ‌ها و امنیت',
    items: [
      { label: 'لاگ‌های ممیزی',   href: '/admin/super-dashboard/logs/audit',    icon: ScrollText  },
      { label: 'خطاها',            href: '/admin/super-dashboard/logs/errors',   icon: AlertCircle },
      { label: 'لاگ‌های ایمیل',   href: '/admin/super-dashboard/logs/email',    icon: Mail        },
      { label: 'گزارش امنیتی',    href: '/admin/super-dashboard/logs/security', icon: Shield      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function NavLeaf({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const isActive = item.href ? pathname === item.href : false

  return (
    <Link
      href={item.href ?? '#'}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
        depth > 0 && 'mr-3 text-xs',
        isActive
          ? 'bg-amber-500/15 text-amber-300 font-semibold'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
      )}
    >
      <item.icon
        className={cn(
          'shrink-0',
          depth === 0 ? 'h-4 w-4' : 'h-3.5 w-3.5',
          isActive ? 'text-amber-400' : 'text-zinc-600 group-hover:text-zinc-400',
        )}
      />
      <span className="truncate flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function NavBranch({ item }: { item: NavItem }) {
  const pathname     = usePathname()
  const isChildActive = item.children?.some((c) => c.href && pathname.startsWith(c.href)) ?? false
  const [open, setOpen] = useState<boolean>(isChildActive)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
          isChildActive
            ? 'bg-zinc-800 text-zinc-100'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
        )}
      >
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            isChildActive ? 'text-amber-400' : 'text-zinc-600 group-hover:text-zinc-400',
          )}
        />
        <span className="flex-1 truncate text-right">{item.label}</span>
        {open
          ? <ChevronDown  className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        }
      </button>

      {open && item.children && (
        <div className="mt-0.5 space-y-0.5 border-r-2 border-zinc-700/60 mr-[22px] pr-1">
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
        'flex h-full w-64 shrink-0 flex-col bg-zinc-900 border-l border-zinc-800 text-right',
        className,
      )}
      dir="rtl"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
          <Shield className="h-4 w-4 text-black" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100">سوپر ادمین</p>
          <p className="text-[11px] text-amber-500/80">گروه صنعتی مشعوف</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-zinc-700
        [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) =>
                item.children
                  ? <NavBranch key={item.label} item={item} />
                  : <NavLeaf   key={item.label} item={item} />,
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-zinc-800 px-3 py-3 space-y-0.5">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          پنل ادمین معمولی
        </Link>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <Globe className="h-3.5 w-3.5" />
          مشاهده سایت
        </Link>
      </div>
    </aside>
  )
}

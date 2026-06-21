'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { SITE_NAME } from '@/lib/constants'
import type { UserRole } from '@/types'
import {
  LayoutDashboard, ShoppingCart, Package, LayoutGrid, Layers,
  Tag, DollarSign, List, History, Ticket, FileText, FolderOpen,
  Globe, Settings, Image, MapPin, Percent, Users, UserCog, Star,
  Wallet, TrendingUp, CreditCard, BarChart3, MessageSquare,
  ClipboardList, Library, Plug, Webhook, ScrollText, ChevronDown,
  Search, Shield, AlertCircle, RefreshCw, Mail, Bell, Lock,
  Database, GitMerge, Map, RotateCcw, HelpCircle, Megaphone,
  MessageCircle, ThumbsUp, Banknote, Receipt, BadgePercent,
  PieChart, Activity, BookOpen, FileQuestion, Send, User,
  Columns, LogOut, Cpu, Warehouse,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

type NavRole = 'all' | UserRole[]

interface NavLeafItem {
  label: string
  href:  string
  icon:  React.ElementType
  badge?: string | number
  roles?: NavRole
}

interface NavBranchItem {
  label:    string
  icon:     React.ElementType
  roles?:   NavRole
  children: NavLeafItem[]
}

type NavItem = NavLeafItem | NavBranchItem

interface NavGroup {
  title: string
  roles?: NavRole
  items:  NavItem[]
}

// ─────────────────────────────────────────────────────────────────────────────
//  Nav tree  (roles: undefined = all admin roles can see)
// ─────────────────────────────────────────────────────────────────────────────

const SA: NavRole = ['super_admin']
const SA_ADM: NavRole = ['super_admin', 'admin']
const ALL: NavRole = 'all'

const NAV: NavGroup[] = [
  // ── داشبورد ──────────────────────────────────────────────────────────────
  {
    title: 'داشبورد',
    items: [
      { label: 'نمای کلی',      href: '/admin/dashboard',  icon: LayoutDashboard },
      { label: 'آمار و تحلیل',  href: '/admin/analytics',  icon: PieChart,        roles: SA_ADM },
      { label: 'وضعیت سیستم',   href: '/admin/health',     icon: Activity,        roles: SA },
    ],
  },

  // ── فروشگاه ──────────────────────────────────────────────────────────────
  {
    title: 'فروشگاه',
    items: [
      {
        label: 'سفارشات', icon: ShoppingCart,
        children: [
          { label: 'همه سفارشات',    href: '/admin/orders',           icon: List       },
          { label: 'کانبان',          href: '/admin/orders/kanban',    icon: Columns    },
          { label: 'مرجوعی‌ها',      href: '/admin/orders/returns',   icon: RotateCcw  },
          { label: 'مدیریت ارسال',   href: '/admin/orders/shipping',  icon: Package    },
        ],
      },
      {
        label: 'محصولات', icon: Package, roles: SA_ADM,
        children: [
          { label: 'همه محصولات',    href: '/admin/products',               icon: List       },
          { label: 'افزودن محصول',   href: '/admin/products/new',           icon: Package    },
          { label: 'دسته‌بندی‌ها',  href: '/admin/products/categories',    icon: LayoutGrid },
          { label: 'موجودی انبار',   href: '/admin/products/inventory',     icon: Warehouse  },
          { label: 'نظرات محصولات',  href: '/admin/products/reviews',       icon: ThumbsUp   },
        ],
      },
      {
        label: 'چهارچوب‌ها', icon: Layers, roles: SA_ADM,
        children: [
          { label: 'لیست چهارچوب‌ها',  href: '/admin/frames',        icon: List       },
          { label: 'سفارشات چهارچوب',  href: '/admin/frames/orders', icon: ClipboardList },
          { label: 'قیمت‌گذاری',       href: '/admin/pricing/frames', icon: DollarSign },
        ],
      },
      { label: 'پروژه‌ها',        href: '/admin/projects', icon: FolderOpen, roles: SA_ADM },
      { label: 'کوپن‌های تخفیف', href: '/admin/coupons',  icon: Ticket,     roles: SA_ADM },
    ],
  },

  // ── محتوا ────────────────────────────────────────────────────────────────
  {
    title: 'محتوا',
    roles: SA_ADM,
    items: [
      {
        label: 'وبلاگ', icon: FileText,
        children: [
          { label: 'نوشته‌ها',        href: '/admin/blog',            icon: List         },
          { label: 'افزودن نوشته',    href: '/admin/blog/new',        icon: FileText     },
          { label: 'دسته‌بندی وبلاگ', href: '/admin/blog/categories', icon: LayoutGrid   },
          { label: 'برچسب‌ها',        href: '/admin/blog/tags',       icon: Tag          },
          { label: 'کامنت‌ها',        href: '/admin/blog/comments',   icon: MessageCircle },
        ],
      },
      {
        label: 'صفحات و فرم‌ها', icon: Globe,
        children: [
          { label: 'صفحات ایستا',  href: '/admin/pages', icon: Globe         },
          { label: 'سوالات متداول', href: '/admin/faqs',  icon: HelpCircle   },
          { label: 'منوها',         href: '/admin/menus', icon: List          },
        ],
      },
      { label: 'پروژه‌های نمونه', href: '/admin/projects', icon: FolderOpen  },
      { label: 'اطلاعیه‌ها',      href: '/admin/notices',  icon: Megaphone   },
      { label: 'کتابخانه رسانه',  href: '/admin/media',    icon: Library     },
    ],
  },

  // ── موتور قیمت‌گذاری ─────────────────────────────────────────────────────
  {
    title: 'موتور قیمت‌گذاری',
    roles: SA,
    items: [
      {
        label: 'قیمت‌گذاری پویا', icon: DollarSign,
        children: [
          { label: 'قیمت پایه محصولات',   href: '/admin/pricing/products', icon: Package      },
          { label: 'لیست قیمت چهارچوب',   href: '/admin/pricing/frames',   icon: List         },
          { label: 'تاریخچه تغییر قیمت',  href: '/admin/pricing/history',  icon: History      },
          { label: 'تیرهای تخفیف',        href: '/admin/pricing/tiers',    icon: BadgePercent },
          { label: 'مقایسه رقبا',          href: '/admin/pricing/compare',  icon: BarChart3    },
        ],
      },
    ],
  },

  // ── سئو ──────────────────────────────────────────────────────────────────
  {
    title: 'سئو و محتوای دیجیتال',
    roles: SA_ADM,
    items: [
      {
        label: 'مدیریت سئو', icon: Search,
        children: [
          { label: 'تنظیمات صفحات',   href: '/admin/seo/pages',      icon: List       },
          { label: 'داده ساختاریافته', href: '/admin/seo/structured', icon: ScrollText },
          { label: 'نقشه سایت',       href: '/admin/seo/sitemap',    icon: Map        },
          { label: 'ریدایرکت‌ها',     href: '/admin/seo/redirects',  icon: GitMerge   },
          { label: 'robots.txt',       href: '/admin/seo/robots',     icon: Cpu        },
        ],
      },
    ],
  },

  // ── کاربران ──────────────────────────────────────────────────────────────
  {
    title: 'کاربران و نقش‌ها',
    roles: SA_ADM,
    items: [
      {
        label: 'کاربران', icon: Users,
        children: [
          { label: 'همه کاربران',       href: '/admin/users',               icon: List       },
          { label: 'مشتریان VIP',       href: '/admin/users?role=vip',      icon: Star       },
          { label: 'همکاران فروش',      href: '/admin/users?role=manager',  icon: TrendingUp },
          { label: 'ادمین‌ها',          href: '/admin/users?role=admin',    icon: Shield,    roles: SA },
          { label: 'درخواست‌های عضویت', href: '/admin/users/requests',      icon: UserCog   },
          { label: 'بلاک‌لیست',         href: '/admin/users/blocked',       icon: Lock       },
          { label: 'پیام دسته‌جمعی',   href: '/admin/users/broadcast',     icon: Send       },
        ],
      },
      { label: 'مدیریت نقش‌ها',     href: '/admin/roles',          icon: UserCog,     roles: SA },
      { label: 'سطح‌بندی سازندگان', href: '/admin/pricing/tiers',  icon: Star         },
    ],
  },

  // ── امور مالی ────────────────────────────────────────────────────────────
  {
    title: 'امور مالی',
    items: [
      { label: 'کیف پول‌ها', href: '/admin/finance/wallets', icon: Wallet },
      {
        label: 'همکاران فروش', icon: TrendingUp,
        children: [
          { label: 'کمیسیون‌ها',     href: '/admin/finance/commissions', icon: Percent    },
          { label: 'درخواست برداشت', href: '/admin/finance/payouts',     icon: CreditCard },
          { label: 'پرفورمنس',       href: '/admin/finance/performance', icon: BarChart3  },
        ],
      },
      { label: 'فاکتورها',        href: '/admin/finance/invoices', icon: Receipt,   roles: SA_ADM },
      { label: 'گزارش درآمد',     href: '/admin/finance/revenue',  icon: BarChart3, roles: SA_ADM },
      { label: 'تنظیمات مالیاتی', href: '/admin/finance/tax',      icon: Banknote,  roles: SA     },
    ],
  },

  // ── پشتیبانی ─────────────────────────────────────────────────────────────
  {
    title: 'پشتیبانی',
    items: [
      { label: 'تیکت‌ها',         href: '/admin/support/tickets',   icon: MessageSquare },
      { label: 'پیشنهادات انبوه', href: '/admin/support/quotes',    icon: ClipboardList },
      { label: 'پایگاه دانش',     href: '/admin/support/kb',        icon: BookOpen,     roles: SA_ADM },
      { label: 'الگوهای پیام',    href: '/admin/support/templates', icon: FileText,     roles: SA_ADM },
      { label: 'چت زنده',         href: '/admin/support/livechat',  icon: MessageCircle, roles: SA_ADM },
    ],
  },

  // ── پیام‌ها ──────────────────────────────────────────────────────────────
  {
    title: 'ارتباطات',
    items: [
      { label: 'پیام‌ها',   href: '/admin/messages', icon: MessageSquare, badge: '۷' },
      { label: 'گزارشات',   href: '/admin/reports',  icon: BarChart3,     roles: SA_ADM },
    ],
  },

  // ── تنظیمات ──────────────────────────────────────────────────────────────
  {
    title: 'تنظیمات',
    roles: SA_ADM,
    items: [
      {
        label: 'اطلاعات سایت', icon: Settings,
        children: [
          { label: 'عمومی',            href: '/admin/settings',           icon: Settings  },
          { label: 'هیرو و بنرها',     href: '/admin/settings/hero',      icon: Image     },
          { label: 'اطلاعات تماس',     href: '/admin/settings/contact',   icon: MapPin    },
          { label: 'شبکه‌های اجتماعی', href: '/admin/settings/social',    icon: Globe     },
          { label: 'مالیات و کمیسیون', href: '/admin/settings/financial', icon: Percent   },
          { label: 'اطلاع‌رسانی',      href: '/admin/settings/notify',    icon: Bell,     roles: SA },
          { label: 'ایمیل و پیامک',    href: '/admin/settings/email',     icon: Mail,     roles: SA },
          { label: 'امنیت سیستم',      href: '/admin/settings/security',  icon: Lock,     roles: SA },
          { label: 'پشتیبان‌گیری',     href: '/admin/settings/backup',    icon: Database, roles: SA },
        ],
      },
    ],
  },

  // ── یکپارچه‌سازی ─────────────────────────────────────────────────────────
  {
    title: 'یکپارچه‌سازی',
    roles: SA_ADM,
    items: [
      { label: 'ادغام‌ها',     href: '/admin/integrations',         icon: Plug      },
      { label: 'پیکربندی API', href: '/admin/integrations/api',     icon: Cpu       },
      { label: 'وب‌هوک‌ها',   href: '/admin/webhooks',             icon: Webhook   },
      { label: 'نرخ ارز',     href: '/admin/integrations/currency', icon: RefreshCw, roles: SA },
    ],
  },

  // ── لاگ‌ها ───────────────────────────────────────────────────────────────
  {
    title: 'لاگ‌ها',
    roles: SA_ADM,
    items: [
      { label: 'لاگ‌های ممیزی', href: '/admin/logs/audit',    icon: ScrollText   },
      { label: 'خطاها',          href: '/admin/logs/errors',   icon: AlertCircle  },
      { label: 'لاگ ایمیل',     href: '/admin/logs/email',    icon: Mail,  roles: SA },
      { label: 'امنیت',          href: '/admin/logs/security', icon: Shield, roles: SA },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function canSee(roles: NavRole | undefined, role: UserRole): boolean {
  if (!roles || roles === 'all') return true
  return (roles as UserRole[]).includes(role)
}

function isBranch(item: NavItem): item is NavBranchItem {
  return 'children' in item
}

// ─────────────────────────────────────────────────────────────────────────────
//  Leaf
// ─────────────────────────────────────────────────────────────────────────────

function Leaf({ item, depth = 0 }: { item: NavLeafItem; depth?: number }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'))

  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all',
        depth > 0 && 'mr-3 text-xs py-1.5',
        isActive
          ? 'bg-gold/10 text-gold border border-gold/15 font-medium'
          : 'text-muted hover:text-white hover:bg-white/5',
      )}
    >
      <item.icon className={cn(
        'shrink-0 transition-colors',
        depth === 0 ? 'h-4 w-4' : 'h-3.5 w-3.5',
        isActive ? 'text-gold' : 'text-zinc-600 group-hover:text-zinc-400',
      )} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className="rounded-full bg-danger text-white text-[10px] font-bold px-1.5 py-0.5">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Branch
// ─────────────────────────────────────────────────────────────────────────────

function Branch({ item, role }: { item: NavBranchItem; role: UserRole }) {
  const pathname       = usePathname()
  const visibleKids    = item.children.filter((c) => canSee(c.roles, role))
  const isChildActive  = visibleKids.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))
  const [open, setOpen] = useState(isChildActive)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'group w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all',
          isChildActive ? 'bg-white/5 text-white' : 'text-muted hover:text-white hover:bg-white/5',
        )}
      >
        <item.icon className={cn('h-4 w-4 shrink-0 transition-colors', isChildActive ? 'text-gold' : 'text-zinc-600 group-hover:text-zinc-400')} />
        <span className="flex-1 truncate text-right">{item.label}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mr-[22px] border-r border-white/8 pr-1 mt-0.5 space-y-0.5 mb-1">
              {visibleKids.map((c) => <Leaf key={c.href} item={c} depth={1} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  AdminSidebar
// ─────────────────────────────────────────────────────────────────────────────

export function AdminSidebar({ role }: { role: UserRole }) {
  const router = useRouter()

  async function logout() {
    const sb = createClient()
    await sb.auth.signOut()
    document.cookie = 'user_role=; path=/; Max-Age=0; SameSite=Lax'
    router.push('/auth/login')
    router.refresh()
  }

  const isSA = role === 'super_admin'

  return (
    <aside
      className="flex h-screen w-64 shrink-0 flex-col bg-charcoal border-l border-white/8"
      dir="rtl"
    >
      {/* Brand */}
      <div className="shrink-0 flex items-center gap-3 border-b border-white/8 px-5 py-4">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold-sm">
            {isSA
              ? <Shield className="h-4 w-4 text-black" />
              : <span className="text-black font-black text-base">م</span>
            }
          </div>
          <div>
            <div className="font-black text-white text-sm">{SITE_NAME}</div>
            <div className="text-2xs text-gold">{isSA ? 'سوپر ادمین' : 'پنل مدیریت'}</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto p-3 space-y-4
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {NAV.filter((g) => canSee(g.roles, role)).map((group) => (
          <div key={group.title}>
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items
                .filter((item) => canSee(item.roles, role))
                .map((item) =>
                  isBranch(item)
                    ? <Branch key={item.label} item={item} role={role} />
                    : <Leaf   key={item.href}  item={item} />
                )
              }
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-white/8 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-muted hover:text-white hover:bg-white/5 transition-all"
        >
          <Globe className="h-4 w-4" />
          مشاهده سایت
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-danger hover:bg-danger/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          خروج از سیستم
        </button>
      </div>
    </aside>
  )
}

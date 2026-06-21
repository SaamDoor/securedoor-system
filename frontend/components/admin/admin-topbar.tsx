'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Bell, ChevronDown, LogOut, Settings, User,
  Globe, Shield, Plus, Package, FileText, Zap,
  AlertCircle, CheckCircle2, Clock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

// ─── Quick create ─────────────────────────────────────────────────────────────

const QUICK: { label: string; href: string; icon: React.ElementType }[] = [
  { label: 'محصول جدید',  href: '/admin/products/new',  icon: Package  },
  { label: 'پست وبلاگ',   href: '/admin/blog/new',       icon: FileText },
  { label: 'کوپن تخفیف',  href: '/admin/coupons',        icon: Zap      },
  { label: 'اطلاعیه',     href: '/admin/notices',        icon: Bell     },
]

// ─── Mock notifications ───────────────────────────────────────────────────────

const NOTIFS = [
  { id: 1, type: 'alert',   text: '۳ تیکت جدید بی‌پاسخ',           sub: '۵ دقیقه پیش',  read: false },
  { id: 2, type: 'success', text: 'برداشت ۲.۵M تومانی تأیید شد',   sub: '۱۸ دقیقه پیش', read: false },
  { id: 3, type: 'info',    text: 'پیش‌فاکتور جدید از ساری ثبت شد', sub: '۳۵ دقیقه پیش', read: true  },
  { id: 4, type: 'alert',   text: 'موجودی MSH-1007 کم است',         sub: '۱ ساعت پیش',   read: true  },
] as const

// ─────────────────────────────────────────────────────────────────────────────

export function AdminTopbar({ role }: { role?: UserRole }) {
  const router = useRouter()
  const [notifOpen,  setNotifOpen]  = useState(false)
  const [userOpen,   setUserOpen]   = useState(false)
  const [quickOpen,  setQuickOpen]  = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const unread   = NOTIFS.filter((n) => !n.read).length
  const isSA     = role === 'super_admin'
  const roleLabel = isSA ? 'سوپر ادمین' : 'مدیر'

  // Ctrl+K → open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
        setTimeout(() => searchRef.current?.focus(), 80)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false); setNotifOpen(false); setUserOpen(false); setQuickOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function logout() {
    const sb = createClient()
    await sb.auth.signOut()
    document.cookie = 'user_role=; path=/; Max-Age=0; SameSite=Lax'
    router.push('/auth/login')
    router.refresh()
  }

  const closeAll = () => { setNotifOpen(false); setUserOpen(false); setQuickOpen(false) }

  return (
    <header className="h-14 shrink-0 border-b border-white/8 bg-charcoal flex items-center gap-3 px-4 sticky top-0 z-40">

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-sm">
        <button
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 80) }}
          className={cn(
            'w-full h-9 rounded-xl border text-sm flex items-center gap-2.5 px-3 transition-colors',
            searchOpen
              ? 'border-gold/50 bg-white/5 text-zinc-300'
              : 'border-white/8 bg-white/3 text-muted hover:border-white/15',
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          {searchOpen ? (
            <input
              ref={searchRef}
              className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-500 text-sm"
              placeholder="جستجو در سیستم..."
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          ) : (
            <>
              <span className="flex-1 text-right">جستجو...</span>
              <span className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono border border-white/10 rounded px-1 py-0.5 text-zinc-600">
                Ctrl K
              </span>
            </>
          )}
        </button>
      </div>

      {/* ── Right actions ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mr-auto">

        {/* System health dots (super_admin only) */}
        {isSA && (
          <div className="hidden lg:flex items-center gap-2 border-l border-white/8 pl-3 mr-1">
            {[
              { label: 'DB',  ok: true },
              { label: 'API', ok: true },
              { label: 'CDN', ok: true },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1 text-[10px] text-zinc-600">
                <span className={cn('h-1.5 w-1.5 rounded-full', s.ok ? 'bg-emerald-500' : 'bg-red-500')} />
                {s.label}
              </div>
            ))}
          </div>
        )}

        {/* Quick create */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setQuickOpen((v) => !v) }}
            className="h-9 px-3 rounded-xl border border-white/8 bg-white/3 flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-white hover:border-gold/30 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:block">ایجاد</span>
          </button>
          <AnimatePresence>
            {quickOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1     }}
                exit={{    opacity: 0, y: -4, scale: 0.97  }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 w-48 rounded-2xl border border-white/10 bg-charcoal shadow-2xl overflow-hidden z-50"
                dir="rtl"
              >
                {QUICK.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    onClick={() => setQuickOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <a.icon className="h-3.5 w-3.5 text-gold shrink-0" />
                    {a.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setNotifOpen((v) => !v) }}
            className="relative h-9 w-9 rounded-xl border border-white/8 bg-white/3 flex items-center justify-center text-muted hover:text-white hover:border-white/15 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 left-1.5 h-4 w-4 rounded-full bg-danger text-[9px] font-black text-white flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1     }}
                exit={{    opacity: 0, y: -4, scale: 0.97  }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 w-80 rounded-2xl border border-white/10 bg-charcoal shadow-2xl z-50 overflow-hidden"
                dir="rtl"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <span className="text-sm font-bold text-white">اعلان‌ها</span>
                  {unread > 0 && <span className="text-xs text-gold">{unread} جدید</span>}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {NOTIFS.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0',
                        !n.read && 'bg-gold/5',
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 shrink-0 rounded-full p-1',
                        n.type === 'alert'   ? 'bg-red-500/15 text-red-400' :
                        n.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' :
                                              'bg-blue-500/15 text-blue-400',
                      )}>
                        {n.type === 'alert'   ? <AlertCircle   className="h-3 w-3" /> :
                         n.type === 'success' ? <CheckCircle2  className="h-3 w-3" /> :
                                               <Clock          className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm leading-snug', n.read ? 'text-muted' : 'text-white')}>
                          {n.text}
                        </p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">{n.sub}</p>
                      </div>
                      {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-white/8">
                  <button className="text-xs text-gold hover:text-gold-light transition-colors">
                    علامت خواندن همه
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex h-9 w-9 rounded-xl border border-white/8 bg-white/3 items-center justify-center text-muted hover:text-white hover:border-white/15 transition-colors"
          title="مشاهده سایت"
        >
          <Globe className="h-4 w-4" />
        </Link>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setUserOpen((v) => !v) }}
            className="flex items-center gap-2 h-9 px-2 rounded-xl border border-white/8 bg-white/3 hover:border-white/15 transition-colors"
          >
            <div className="h-6 w-6 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              {isSA
                ? <Shield className="h-3 w-3 text-gold" />
                : <User   className="h-3 w-3 text-gold" />
              }
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-white leading-none">{roleLabel}</div>
              <div className="text-[10px] text-muted mt-0.5">مشعوف</div>
            </div>
            <ChevronDown className={cn('h-3 w-3 text-zinc-600 transition-transform', userOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1     }}
                exit={{    opacity: 0, y: -4, scale: 0.97  }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 w-52 rounded-2xl border border-white/10 bg-charcoal shadow-2xl z-50 overflow-hidden"
                dir="rtl"
              >
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-sm font-bold text-white">{roleLabel}</p>
                  <p className="text-xs text-muted mt-0.5">{role} · مشعوف</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/admin/settings"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    تنظیمات
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    مشاهده سایت
                  </Link>
                </div>
                <div className="p-1.5 border-t border-white/8">
                  <button
                    onClick={() => { setUserOpen(false); logout() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    خروج از سیستم
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

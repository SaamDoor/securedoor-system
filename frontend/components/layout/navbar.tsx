'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Phone,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { CONTACT } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  name: string
  initials: string
  role: string
}

const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'support']

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { label: 'خانه', href: '/' },
  {
    label: 'محصولات',
    href: '/products',
    children: [
      { label: 'درب ضد سرقت',  href: '/products?category=darb-zed-sereqat' },
      { label: 'درب ضد حریق',  href: '/products?category=darb-zed-hariq' },
      { label: 'درب آپارتمانی', href: '/products?category=darb-apartmani' },
      { label: 'درب ویلایی',   href: '/products?category=darb-villaei' },
      { label: 'درب اداری',    href: '/products?category=darb-edari' },
      { label: 'متعلقات',      href: '/products?category=moteallaqat' },
    ],
  },
  {
    label: 'پروژه‌های ساختمانی',
    href: '/projects',
    children: [
      { label: 'همه پروژه‌ها', href: '/projects' },
      { label: 'پیش‌فروش',    href: '/projects?status=pre_sale' },
      { label: 'برای فروش',   href: '/projects?status=for_sale' },
      { label: 'تحویل‌شده',   href: '/projects?status=delivered' },
    ],
  },
  { label: 'دسته‌بندی‌ها', href: '/categories' },
  { label: 'وبلاگ',       href: '/blog' },
  { label: 'درباره ما',   href: '/about' },
  { label: 'تماس با ما',  href: '/contact' },
]

// ─── User menu dropdown ───────────────────────────────────────────────────────

function UserMenu({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isAdmin = ADMIN_ROLES.includes(user.role)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl',
          'border border-gold/30 hover:border-gold/60',
          'bg-gold/5 hover:bg-gold/10 transition-all duration-200',
        )}
        aria-label="منوی کاربر"
      >
        {/* Avatar circle */}
        <div className="w-7 h-7 rounded-lg bg-gold-gradient flex items-center justify-center flex-shrink-0">
          <span className="text-black text-xs font-black">{user.initials}</span>
        </div>
        <span className="hidden sm:block text-white text-sm font-semibold max-w-[100px] truncate">
          {user.name || 'حساب من'}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-gold transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              'absolute top-full left-0 mt-2 w-56 py-2',
              'bg-surface/98 backdrop-blur-xl',
              'border border-white/10 rounded-2xl shadow-luxury',
              'z-50',
            )}
          >
            {/* User info header */}
            <div className="px-4 pb-3 pt-1 border-b border-white/8 mb-1">
              <div className="text-white font-bold text-sm truncate">{user.name || 'کاربر'}</div>
              <div className="text-muted text-xs mt-0.5">
                {isAdmin ? '🛡 مدیر سیستم' : '👤 کاربر'}
              </div>
            </div>

            {/* Admin panel — only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
              >
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                پنل مدیریت
              </Link>
            )}

            {/* Dashboard */}
            <Link
              href="/user/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              داشبورد من
            </Link>

            {/* Profile */}
            <Link
              href="/user/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              ویرایش پروفایل
            </Link>

            <div className="mx-4 my-1.5 border-t border-white/8" />

            {/* Logout */}
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              خروج از حساب
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const { scrollY } = useScroll()
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Auth state ──────────────────────────────────────────────────────────────

  const buildAuthUser = useCallback((meta: Record<string, unknown>, roleCookie: string): AuthUser => {
    const firstName = (meta.first_name as string) ?? ''
    const lastName  = (meta.last_name  as string) ?? ''
    const name = [firstName, lastName].filter(Boolean).join(' ')
    const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'U'
    return { name, initials, role: roleCookie || 'customer' }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Helper: read user_role cookie
    function getRoleCookie(): string {
      return document.cookie.match(/user_role=([^;]+)/)?.[1] ?? ''
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(buildAuthUser(session.user.user_metadata ?? {}, getRoleCookie()))
      }
    })

    // Real-time updates: login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser(buildAuthUser(session.user.user_metadata ?? {}, getRoleCookie()))
      } else {
        setAuthUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [buildAuthUser])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Clear role cookie
    document.cookie = 'user_role=; path=/; Max-Age=0; SameSite=Lax'
    setAuthUser(null)
    router.push('/')
    router.refresh()
  }

  // ── Scroll ──────────────────────────────────────────────────────────────────

  useMotionValueEvent(scrollY, 'change', (latest) => setIsScrolled(latest > 60))

  // ── Mobile menu scroll lock ─────────────────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  // ── Dropdown hover ──────────────────────────────────────────────────────────

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
    setActiveDropdown(label)
  }
  const handleDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Top bar ── */}
      <div className="hidden lg:block bg-charcoal border-b border-white/5">
        <div className="container flex items-center justify-between py-2 text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-gold" />
              {CONTACT.phone}
            </span>
            <span className="text-white/20">|</span>
            <span>{CONTACT.workingHours}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="hover:text-gold transition-colors">
              پیگیری سفارش
            </Link>
            <span className="text-white/20">|</span>
            {authUser ? (
              <span className="text-gold font-medium">
                {authUser.name || 'حساب من'}
              </span>
            ) : (
              <Link href="/auth/login" className="hover:text-gold transition-colors">
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <motion.header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-400 ease-luxury',
          isScrolled
            ? 'bg-black/95 backdrop-blur-xl border-b border-white/8 shadow-luxury-sm'
            : 'bg-transparent border-b border-transparent',
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-18">

            {/* ── Logo ── */}
            <Logo variant="default" size="md" />

            {/* ── Desktop nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium',
                      'text-muted hover:text-white transition-colors duration-200',
                      'hover:bg-white/5',
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          activeDropdown === item.label && 'rotate-180',
                        )}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={cn(
                          'absolute top-full right-0 mt-2 w-56 py-2',
                          'bg-surface/95 backdrop-blur-xl',
                          'border border-white/10 rounded-2xl shadow-luxury',
                        )}
                        onMouseEnter={() => handleDropdownEnter(item.label)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'flex items-center px-4 py-2.5 text-sm text-muted',
                              'hover:text-white hover:bg-white/5 transition-all duration-200',
                              'hover:pr-6',
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                        <div className="divider-gold mx-4 my-2" />
                        <Link
                          href="/products"
                          className="flex items-center px-4 py-2.5 text-sm text-gold hover:text-gold-light transition-colors"
                        >
                          مشاهده همه محصولات ←
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* ── Actions ── */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center',
                  'text-muted hover:text-white hover:bg-white/5',
                  'transition-all duration-200',
                )}
                aria-label="جستجو"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/user/wishlist"
                className={cn(
                  'relative h-10 w-10 rounded-xl flex items-center justify-center',
                  'text-muted hover:text-white hover:bg-white/5',
                  'transition-all duration-200',
                )}
                aria-label="علاقه‌مندی‌ها"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className={cn(
                  'relative h-10 w-10 rounded-xl flex items-center justify-center',
                  'text-muted hover:text-white hover:bg-white/5',
                  'transition-all duration-200',
                )}
                aria-label="سبد خرید"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -left-1 h-4 w-4 bg-gold text-black text-2xs font-bold rounded-full flex items-center justify-center">
                  ۳
                </span>
              </Link>

              {/* User area — logged in: dropdown, logged out: login button */}
              <div className="hidden lg:flex">
                {authUser ? (
                  <UserMenu user={authUser} onLogout={handleLogout} />
                ) : (
                  <Link href="/auth/login">
                    <Button variant="gold-outline" size="sm" leftIcon={<User className="h-4 w-4" />}>
                      ورود
                    </Button>
                  </Link>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={cn(
                  'lg:hidden h-10 w-10 rounded-xl flex items-center justify-center',
                  'text-muted hover:text-white hover:bg-white/5 transition-all',
                )}
                aria-label="منو"
              >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Search overlay ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-xl flex items-start justify-center pt-24"
            onClick={(e) => e.target === e.currentTarget && setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-2xl px-4"
            >
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                <input
                  autoFocus
                  type="text"
                  placeholder="جستجو در محصولات..."
                  className={cn(
                    'w-full h-16 rounded-2xl pr-12 pl-12 text-lg',
                    'bg-surface border border-white/15',
                    'text-white placeholder:text-muted',
                    'focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20',
                    'transition-all duration-250',
                  )}
                  onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-muted text-sm mt-4">
                برای بستن جستجو، کلید Escape را فشار دهید
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-surface border-l border-white/8 overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/8">
                <div onClick={() => setIsMobileOpen(false)}>
                  <Logo variant="default" size="sm" />
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="text-muted hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Logged-in user info strip */}
              {authUser && (
                <div className="px-5 py-4 border-b border-white/8 bg-gold/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-black">{authUser.initials}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{authUser.name || 'کاربر'}</div>
                      <div className="text-muted text-xs">
                        {ADMIN_ROLES.includes(authUser.role) ? '🛡 مدیر سیستم' : '👤 کاربر'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="p-4 flex-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between py-3 px-3 rounded-xl',
                        'text-white hover:bg-white/5 transition-colors font-medium',
                      )}
                    >
                      {item.label}
                      {item.children && <ChevronDown className="h-4 w-4 text-muted" />}
                    </Link>
                    {item.children && (
                      <div className="mr-3 border-r border-white/8 pr-3 mb-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="block py-2 px-3 text-sm text-muted hover:text-gold transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Bottom actions */}
              <div className="p-4 border-t border-white/8 space-y-3">
                {authUser ? (
                  <>
                    {ADMIN_ROLES.includes(authUser.role) && (
                      <Button asChild variant="gold-outline" size="md" className="w-full">
                        <Link href="/admin" onClick={() => setIsMobileOpen(false)}>
                          <ShieldCheck className="h-4 w-4 ml-2" />
                          پنل مدیریت
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="gold-outline" size="md" className="w-full">
                      <Link href="/user/dashboard" onClick={() => setIsMobileOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 ml-2" />
                        داشبورد من
                      </Link>
                    </Button>
                    <button
                      onClick={() => { setIsMobileOpen(false); handleLogout() }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      خروج از حساب
                    </button>
                  </>
                ) : (
                  <Button asChild variant="gold" size="md" className="w-full">
                    <Link href="/auth/login" onClick={() => setIsMobileOpen(false)}>
                      ورود / ثبت‌نام
                    </Link>
                  </Button>
                )}

                <div className="flex items-center gap-2 text-sm text-muted">
                  <Phone className="h-4 w-4 text-gold" />
                  <span>{CONTACT.phone}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

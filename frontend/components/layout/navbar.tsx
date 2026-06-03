'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONTACT, SOCIAL_LINKS } from '@/lib/constants'

const navItems = [
  { label: 'خانه', href: '/' },
  {
    label: 'محصولات',
    href: '/products',
    children: [
      { label: 'درب ضد سرقت', href: '/products?category=darb-zed-sereqat' },
      { label: 'درب ضد حریق', href: '/products?category=darb-zed-hariq' },
      { label: 'درب آپارتمانی', href: '/products?category=darb-apartmani' },
      { label: 'درب ویلایی', href: '/products?category=darb-villaei' },
      { label: 'درب اداری', href: '/products?category=darb-edari' },
      { label: 'متعلقات', href: '/products?category=moteallaqat' },
    ],
  },
  { label: 'دسته‌بندی‌ها', href: '/categories' },
  { label: 'وبلاگ', href: '/blog' },
  { label: 'درباره ما', href: '/about' },
  { label: 'تماس با ما', href: '/contact' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { scrollY } = useScroll()
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 60)
  })

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
    setActiveDropdown(label)
  }

  const handleDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

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
            <Link href="/auth/login" className="hover:text-gold transition-colors">
              ورود / ثبت‌نام
            </Link>
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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold-sm group-hover:shadow-gold transition-shadow duration-300">
                  <span className="text-black font-black text-lg leading-none">س</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-black rounded-full border-2 border-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight leading-none">
                  مشعوف
                </span>
                <span className="text-2xs text-gold tracking-widest font-medium leading-none mt-0.5">
                  MASHOUF GROUP
                </span>
              </div>
            </Link>

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
                            <span className="w-1.5 h-1.5 rounded-full bg-gold ml-3 opacity-0 group-hover:opacity-100" />
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

              {/* User */}
              <Link
                href="/auth/login"
                className="hidden lg:flex"
              >
                <Button variant="gold-outline" size="sm" leftIcon={<User className="h-4 w-4" />}>
                  ورود
                </Button>
              </Link>

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
            <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-surface border-l border-white/8 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/8">
                <Link
                  href="/"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                    <span className="text-black font-black text-base">س</span>
                  </div>
                  <span className="font-bold text-white">گروه صنعتی مشعوف</span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="text-muted hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="p-4">
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
                <Button asChild variant="gold" size="md" className="w-full">
                  <Link href="/auth/login" onClick={() => setIsMobileOpen(false)}>
                    ورود / ثبت‌نام
                  </Link>
                </Button>

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

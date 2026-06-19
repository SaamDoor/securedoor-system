"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { CONTACT } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import {
  ADMIN_ROLES,
  USER_PANEL_ROLES,
  type User as AppUser,
  type UserRole,
} from "@/types";

interface AuthUser {
  name: string;
  initials: string;
  role: UserRole;
}

const navItems = [
  { label: "خانه", href: "/" },
  {
    label: "محصولات",
    href: "/products",
    children: [
      { label: "درب ضد سرقت",   href: "/products?category=darb-zed-sereqat" },
      { label: "درب ضد حریق",   href: "/products?category=darb-zed-hariq" },
      { label: "درب آپارتمانی", href: "/products?category=darb-apartmani" },
      { label: "درب ویلایی",    href: "/products?category=darb-villaei" },
      { label: "درب اداری",     href: "/products?category=darb-edari" },
      { label: "متعلقات",       href: "/products?category=moteallaqat" },
    ],
  },
  {
    label: "پروژه‌ها",
    href: "/projects",
    children: [
      { label: "همه پروژه‌ها", href: "/projects" },
      { label: "پیش‌فروش",    href: "/projects?status=pre_sale" },
      { label: "برای فروش",   href: "/projects?status=for_sale" },
      { label: "تحویل‌شده",   href: "/projects?status=delivered" },
    ],
  },
  { label: "وبلاگ",      href: "/blog" },
  { label: "درباره ما",  href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

function buildAuthUser(user: AppUser, role: UserRole): AuthUser {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const initials =
    [user.firstName[0], user.lastName[0]].filter(Boolean).join("").toUpperCase() ||
    user.email[0]?.toUpperCase() || "U";
  return { name, initials, role };
}

function UserMenu({
  user, dashboardHref, dashboardLabel, showProfile, onLogout,
}: {
  user: AuthUser; dashboardHref: string; dashboardLabel: string;
  showProfile: boolean; onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1.5",
          "border border-primary/25 bg-primary/8",
          "transition-all duration-200 hover:border-primary/50 hover:bg-primary/15",
          "shadow-[0_0_0_0_rgba(196,30,58,0)] hover:shadow-[0_2px_12px_rgba(196,30,58,0.2)]",
        )}
        aria-label="منوی کاربر"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#D42B47] to-[#8B0020] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <span className="text-xs font-black text-white">{user.initials}</span>
        </div>
        <span className="hidden max-w-[90px] truncate text-sm font-semibold text-white sm:block">
          {user.name || "حساب من"}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-primary transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute left-0 top-full z-50 mt-2.5 w-60 rounded-2xl border border-white/10 py-2 overflow-hidden bg-zinc-950/95 shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            {/* Subtle top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="mb-1 border-b border-white/[0.07] px-4 pb-3 pt-2">
              <div className="truncate text-sm font-bold text-white">{user.name || "کاربر"}</div>
              <div className="mt-0.5 text-xs text-zinc-500">{isAdmin ? "مدیر سیستم" : "کاربر"}</div>
            </div>

            <Link
              href={dashboardHref}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 mx-1 rounded-xl",
                isAdmin
                  ? "text-primary-400 hover:bg-primary/10 hover:text-primary-300"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
              {dashboardLabel}
            </Link>

            {showProfile && (
              <Link
                href="/user/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 mx-1 rounded-xl px-4 py-2.5 text-sm text-zinc-400 transition-all duration-150 hover:bg-white/5 hover:text-white"
              >
                <Settings className="h-4 w-4" />
                ویرایش پروفایل
              </Link>
            )}

            <div className="mx-4 my-1.5 border-t border-white/[0.07]" />

            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-3 mx-1 w-[calc(100%-0.5rem)] rounded-xl px-4 py-2.5 text-sm text-red-400 transition-all duration-150 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              خروج از حساب
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { scrollY } = useScroll();
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storeUser      = useAuthStore((s) => s.user);
  const role           = useAuthStore((s) => s.role);
  const dashboardHref  = useAuthStore((s) => s.dashboardHref);
  const dashboardLabel = useAuthStore((s) => s.dashboardLabel);
  const clearAuth      = useAuthStore((s) => s.clearAuth);

  const authUser               = storeUser && role ? buildAuthUser(storeUser, role) : null;
  const showProfile            = !!role && USER_PANEL_ROLES.includes(role);
  const hasDashboardLink       = !!dashboardHref && !!dashboardLabel;
  const isAdmin                = !!role && ADMIN_ROLES.includes(role);
  const resolvedDashboardHref  = dashboardHref  ?? "/auth/login";
  const resolvedDashboardLabel = dashboardLabel ?? "حساب من";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    router.push("/");
    router.refresh();
  }

  useMotionValueEvent(scrollY, "change", (v) => setIsScrolled(v > 40));

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const onDropdownEnter = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(label);
  };
  const onDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <>
      {/* ── Fixed navbar wrapper — overlays hero, floats above all content ── */}
      <div className="fixed top-0 left-0 right-0 z-[100] px-3 pt-3 sm:px-4 sm:pt-4 pb-0 pointer-events-none">
        <motion.header
          className={cn(
            "pointer-events-auto w-full max-w-7xl mx-auto rounded-2xl",
            "border transition-all duration-500",
            isScrolled
              ? [
                  "bg-black/80 border-white/[0.10]",
                  "backdrop-blur-2xl",
                  "shadow-[0_8px_40px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)]",
                ].join(" ")
              : [
                  "bg-white/10 border-white/[0.10]",
                  "backdrop-blur-md",
                  "shadow-[0_4px_24px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]",
                ].join(" "),
          )}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Top-edge glass shine */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent rounded-full pointer-events-none" />

          <div className="flex h-[60px] items-center justify-between px-4 sm:px-5">
            <Logo variant="default" size="sm" />

            {/* Desktop nav */}
            <nav className="hidden items-center gap-0.5 lg:flex">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && onDropdownEnter(item.label)}
                  onMouseLeave={onDropdownLeave}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-medium",
                      "text-zinc-400 transition-all duration-200",
                      "hover:bg-white/[0.06] hover:text-white",
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", activeDropdown === item.label && "rotate-180")} />
                    )}
                  </Link>

                  <AnimatePresence>
                    {item.children && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="absolute right-0 top-full mt-2.5 w-52 rounded-2xl border border-white/10 py-1.5 overflow-hidden bg-zinc-950/95 shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-xl z-50"
                        onMouseEnter={() => onDropdownEnter(item.label)}
                        onMouseLeave={onDropdownLeave}
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center mx-1 rounded-xl px-3.5 py-2.5 text-sm text-zinc-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-white hover:pr-5"
                          >
                            {child.label}
                          </Link>
                        ))}
                        <div className="divider-primary mx-4 my-1.5" />
                        <Link
                          href="/products"
                          className="flex items-center mx-1 rounded-xl px-3.5 py-2.5 text-sm text-primary transition-colors hover:text-primary-400 hover:bg-primary/8"
                        >
                          مشاهده همه ←
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white"
                aria-label="جستجو"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/user/wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white"
                aria-label="علاقه‌مندی‌ها"
              >
                <Heart className="h-4.5 w-4.5" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white"
                aria-label="سبد خرید"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                <span className="absolute -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white shadow-[0_2px_8px_rgba(196,30,58,0.5)]">
                  ۳
                </span>
              </Link>

              {/* Auth — desktop only */}
              <div className="hidden lg:flex mr-1">
                {authUser && hasDashboardLink ? (
                  <UserMenu
                    user={authUser}
                    dashboardHref={resolvedDashboardHref}
                    dashboardLabel={resolvedDashboardLabel}
                    showProfile={showProfile}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Link href="/auth/login">
                    <Button variant="gold-outline" size="sm" leftIcon={<User className="h-3.5 w-3.5" />}>
                      ورود
                    </Button>
                  </Link>
                )}
              </div>

              {/* Hamburger */}
              <button
                onClick={() => setIsMobileOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white lg:hidden"
                aria-label="منو"
              >
                <motion.div animate={{ rotate: isMobileOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </button>
            </div>
          </div>
        </motion.header>
      </div>

      {/* ── Search overlay ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-start justify-center bg-black/85 pt-28 backdrop-blur-2xl"
            onClick={(e) => e.target === e.currentTarget && setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-2xl px-4 sm:px-6"
            >
              <div className="relative">
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input
                  autoFocus
                  type="text"
                  placeholder="جستجو در محصولات..."
                  className={cn(
                    "h-16 w-full rounded-2xl pr-12 pl-12 text-lg",
                    "border border-white/15 bg-zinc-900/90",
                    "text-white placeholder:text-zinc-600",
                    "shadow-[0_24px_64px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]",
                    "transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  )}
                  onKeyDown={(e) => e.key === "Escape" && setIsSearchOpen(false)}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-zinc-600">
                کلید Escape برای بستن
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="absolute bottom-0 right-0 top-0 flex w-80 max-w-[88vw] flex-col bg-zinc-950 shadow-[−24px_0_80px_rgba(0,0,0,0.8)]"
            >
              {/* Top edge highlight */}
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />

              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div onClick={() => setIsMobileOpen(false)}>
                  <Logo variant="default" size="sm" />
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User info */}
              {authUser && (
                <div className="border-b border-white/[0.07] bg-gradient-to-r from-primary/8 to-transparent px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D42B47] to-[#8B0020] shadow-[0_4px_16px_rgba(196,30,58,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]">
                      <span className="font-black text-white text-sm">{authUser.initials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{authUser.name || "کاربر"}</div>
                      <div className="text-xs text-zinc-500">{isAdmin ? "مدیر سیستم" : "کاربر"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-3">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex min-h-[44px] items-center justify-between rounded-xl px-4 py-3 font-medium text-white transition-all hover:bg-white/[0.05]"
                    >
                      {item.label}
                      {item.children && <ChevronDown className="h-4 w-4 text-zinc-600" />}
                    </Link>
                    {item.children && (
                      <div className="mb-1 mr-3 border-r border-white/[0.07] pr-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="block min-h-[40px] px-4 py-2 text-sm text-zinc-500 transition-colors hover:text-primary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Footer CTAs */}
              <div className="space-y-2.5 border-t border-white/[0.07] px-4 py-5">
                {authUser && hasDashboardLink ? (
                  <>
                    <Button asChild variant="gold-outline" size="md" className="w-full min-h-[44px]">
                      <Link href={resolvedDashboardHref} onClick={() => setIsMobileOpen(false)}>
                        {isAdmin ? <ShieldCheck className="ml-2 h-4 w-4" /> : <LayoutDashboard className="ml-2 h-4 w-4" />}
                        {resolvedDashboardLabel}
                      </Link>
                    </Button>
                    {showProfile && (
                      <Button asChild variant="dark" size="md" className="w-full min-h-[44px]">
                        <Link href="/user/profile" onClick={() => setIsMobileOpen(false)}>
                          <Settings className="ml-2 h-4 w-4" />
                          ویرایش پروفایل
                        </Link>
                      </Button>
                    )}
                    <button
                      onClick={() => { setIsMobileOpen(false); handleLogout(); }}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-red-500/25 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/40"
                    >
                      <LogOut className="h-4 w-4" />
                      خروج از حساب
                    </button>
                  </>
                ) : (
                  <Button asChild variant="gold" size="md" className="w-full min-h-[44px]">
                    <Link href="/auth/login" onClick={() => setIsMobileOpen(false)}>
                      ورود / ثبت‌نام
                    </Link>
                  </Button>
                )}
                <div className="flex items-center gap-2 pt-1 text-xs text-zinc-600">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{CONTACT.phone}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

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
      { label: "درب ضد سرقت", href: "/products?category=darb-zed-sereqat" },
      { label: "درب ضد حریق", href: "/products?category=darb-zed-hariq" },
      { label: "درب آپارتمانی", href: "/products?category=darb-apartmani" },
      { label: "درب ویلایی", href: "/products?category=darb-villaei" },
      { label: "درب اداری", href: "/products?category=darb-edari" },
      { label: "متعلقات", href: "/products?category=moteallaqat" },
    ],
  },
  {
    label: "پروژه‌های ساختمانی",
    href: "/projects",
    children: [
      { label: "همه پروژه‌ها", href: "/projects" },
      { label: "پیش‌فروش", href: "/projects?status=pre_sale" },
      { label: "برای فروش", href: "/projects?status=for_sale" },
      { label: "تحویل‌شده", href: "/projects?status=delivered" },
    ],
  },
  { label: "دسته‌بندی‌ها", href: "/products" },
  { label: "وبلاگ", href: "/blog" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

function buildAuthUser(user: AppUser, role: UserRole): AuthUser {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const initials =
    [user.firstName[0], user.lastName[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    user.email[0]?.toUpperCase() ||
    "U";

  return { name, initials, role };
}

function UserMenu({
  user,
  dashboardHref,
  dashboardLabel,
  showProfile,
  onLogout,
}: {
  user: AuthUser;
  dashboardHref: string;
  dashboardLabel: string;
  showProfile: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-1.5",
          "border border-primary/30 bg-primary/5 transition-all duration-200",
          "hover:border-primary/60 hover:bg-primary/10",
        )}
        aria-label="منوی کاربر"
      >
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-gradient">
          <span className="text-xs font-black text-white">{user.initials}</span>
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-semibold text-white sm:block">
          {user.name || "حساب من"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-primary transition-transform duration-200",
            open && "rotate-180",
          )}
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
              "absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/10 py-2",
              "bg-surface/98 shadow-luxury backdrop-blur-xl",
            )}
          >
            <div className="mb-1 border-b border-white/8 px-4 pb-3 pt-1">
              <div className="truncate text-sm font-bold text-white">
                {user.name || "کاربر"}
              </div>
              <div className="mt-0.5 text-xs text-muted">
                {isAdmin ? "مدیر سیستم" : "کاربر"}
              </div>
            </div>

            <Link
              href={dashboardHref}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                isAdmin
                  ? "text-primary-400 hover:bg-primary/10 hover:text-primary-300"
                  : "text-muted hover:bg-white/5 hover:text-white",
              )}
            >
              {isAdmin ? (
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              ) : (
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              )}
              {dashboardLabel}
            </Link>

            {showProfile && (
              <Link
                href="/user/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                ویرایش پروفایل
              </Link>
            )}

            <div className="mx-4 my-1.5 border-t border-white/8" />

            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
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

  const storeUser = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const dashboardHref = useAuthStore((state) => state.dashboardHref);
  const dashboardLabel = useAuthStore((state) => state.dashboardLabel);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const authUser = storeUser && role ? buildAuthUser(storeUser, role) : null;
  const showProfile = !!role && USER_PANEL_ROLES.includes(role);
  const hasDashboardLink = !!dashboardHref && !!dashboardLabel;
  const isAdmin = !!role && ADMIN_ROLES.includes(role);
  const resolvedDashboardHref = dashboardHref ?? "/auth/login";
  const resolvedDashboardLabel = dashboardLabel ?? "حساب من";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    router.push("/");
    router.refresh();
  }

  useMotionValueEvent(scrollY, "change", (latest) =>
    setIsScrolled(latest > 60),
  );

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <>
      {/* ── Top info bar ── */}
      <div className="hidden border-b border-white/5 bg-charcoal lg:block">
        <div className="container flex items-center justify-between py-2 text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-primary" />
              {CONTACT.phone}
            </span>
            <span className="text-white/20">|</span>
            <span>{CONTACT.workingHours}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/user/orders" className="transition-colors hover:text-primary">
              پیگیری سفارش
            </Link>
            <span className="text-white/20">|</span>
            {authUser && hasDashboardLink ? (
              <>
                <Link
                  href={resolvedDashboardHref}
                  className="font-medium text-primary transition-colors hover:text-primary-400"
                >
                  {resolvedDashboardLabel}
                </Link>
                <span className="text-white/20">|</span>
                <span className="text-white/75">{authUser.name || "حساب من"}</span>
              </>
            ) : (
              <Link href="/auth/login" className="transition-colors hover:text-primary">
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Main header — sticky glass ── */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
          isScrolled
            ? "border-b border-white/8 bg-black/95 shadow-luxury-sm backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="container px-4 sm:px-6">
          <div className="flex h-[72px] items-center justify-between">
            <Logo variant="default" size="md" />

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
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
                      "flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium",
                      "text-muted transition-all duration-200 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          activeDropdown === item.label && "rotate-180",
                        )}
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {item.children && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={cn(
                          "absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/10 py-2",
                          "bg-surface/95 shadow-luxury backdrop-blur-xl",
                        )}
                        onMouseEnter={() => handleDropdownEnter(item.label)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center px-4 py-2.5 text-sm text-muted transition-all duration-200",
                              "hover:bg-white/5 hover:pr-6 hover:text-white",
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                        <div className="divider-primary mx-4 my-2" />
                        <Link
                          href="/products"
                          className="flex items-center px-4 py-2.5 text-sm text-primary transition-colors hover:text-primary-400"
                        >
                          مشاهده همه محصولات ←
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Action icons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  "text-muted transition-all duration-200 hover:bg-white/5 hover:text-white",
                )}
                aria-label="جستجو"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link
                href="/user/wishlist"
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-xl",
                  "text-muted transition-all duration-200 hover:bg-white/5 hover:text-white",
                )}
                aria-label="علاقه‌مندی‌ها"
              >
                <Heart className="h-5 w-5" />
              </Link>

              <Link
                href="/cart"
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-xl",
                  "text-muted transition-all duration-200 hover:bg-white/5 hover:text-white",
                )}
                aria-label="سبد خرید"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-2xs font-bold text-white">
                  ۳
                </span>
              </Link>

              <div className="hidden lg:flex">
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
                    <Button
                      variant="gold-outline"
                      size="sm"
                      leftIcon={<User className="h-4 w-4" />}
                    >
                      ورود
                    </Button>
                  </Link>
                )}
              </div>

              {/* Hamburger */}
              <button
                onClick={() => setIsMobileOpen((v) => !v)}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl lg:hidden",
                  "text-muted transition-all hover:bg-white/5 hover:text-white",
                )}
                aria-label="منو"
              >
                {isMobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
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
            className="fixed inset-0 z-60 flex items-start justify-center bg-black/90 pt-24 backdrop-blur-xl"
            onClick={(e) => e.target === e.currentTarget && setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-2xl px-4 sm:px-6"
            >
              <div className="relative">
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  autoFocus
                  type="text"
                  placeholder="جستجو در محصولات..."
                  className={cn(
                    "h-16 w-full rounded-2xl pr-12 pl-12 text-lg",
                    "border border-white/15 bg-surface",
                    "text-white placeholder:text-muted",
                    "transition-all duration-250 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                  )}
                  onKeyDown={(e) => e.key === "Escape" && setIsSearchOpen(false)}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-4 text-center text-sm text-muted">
                برای بستن جستجو، کلید Escape را فشار دهید
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
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer panel — slides from right (RTL) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute bottom-0 right-0 top-0 flex w-80 max-w-[85vw] flex-col overflow-y-auto bg-zinc-950 shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div onClick={() => setIsMobileOpen(false)}>
                  <Logo variant="default" size="sm" />
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-all hover:bg-white/5 hover:text-white"
                  aria-label="بستن منو"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User info */}
              {authUser && (
                <div className="border-b border-white/8 bg-primary/5 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-gradient shadow-primary-sm">
                      <span className="font-black text-white">{authUser.initials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {authUser.name || "کاربر"}
                      </div>
                      <div className="text-xs text-muted">
                        {isAdmin ? "مدیر سیستم" : "کاربر"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-3">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.25 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex min-h-[44px] items-center justify-between rounded-xl px-3 py-3",
                        "font-medium text-white transition-colors hover:bg-white/5",
                      )}
                    >
                      {item.label}
                      {item.children && (
                        <ChevronDown className="h-4 w-4 text-muted" />
                      )}
                    </Link>
                    {item.children && (
                      <div className="mb-1 mr-3 border-r border-white/8 pr-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="block min-h-[40px] px-3 py-2 text-sm text-muted transition-colors hover:text-primary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Drawer footer CTAs */}
              <div className="space-y-3 border-t border-white/8 px-4 py-5">
                {authUser && hasDashboardLink ? (
                  <>
                    <Button asChild variant="gold-outline" size="md" className="w-full min-h-[44px]">
                      <Link href={resolvedDashboardHref} onClick={() => setIsMobileOpen(false)}>
                        {isAdmin ? (
                          <ShieldCheck className="ml-2 h-4 w-4" />
                        ) : (
                          <LayoutDashboard className="ml-2 h-4 w-4" />
                        )}
                        {resolvedDashboardLabel}
                      </Link>
                    </Button>

                    {showProfile && (
                      <Button asChild variant="gold-outline" size="md" className="w-full min-h-[44px]">
                        <Link href="/user/profile" onClick={() => setIsMobileOpen(false)}>
                          <Settings className="ml-2 h-4 w-4" />
                          ویرایش پروفایل
                        </Link>
                      </Button>
                    )}

                    <button
                      onClick={() => { setIsMobileOpen(false); handleLogout(); }}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/50"
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

                <div className="flex items-center gap-2 pt-1 text-sm text-muted">
                  <Phone className="h-4 w-4 text-primary" />
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

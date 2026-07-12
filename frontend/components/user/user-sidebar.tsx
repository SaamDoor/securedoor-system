"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  User,
  MapPin,
  MessageCircle,
  Bell,
  Download,
  Settings,
  LogOut,
  FileText,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { USER_PANEL_ROLES } from "@/types";

const baseNavItems = [
  { label: "کیف پول و واریز", href: "/user/wallet", icon: Wallet },
  { label: "سفارشات", href: "/user/orders", icon: ShoppingBag },
  { label: "فاکتورها", href: "/user/invoices", icon: FileText },
  { label: "علاقه‌مندی‌ها", href: "/user/wishlist", icon: Heart },
  { label: "پروفایل", href: "/user/profile", icon: User },
  { label: "آدرس‌ها", href: "/user/addresses", icon: MapPin },
  { label: "پیام‌ها", href: "/user/messages", icon: MessageCircle, badge: 2 },
  { label: "اعلانات", href: "/user/notifications", icon: Bell, badge: 5 },
  { label: "دانلودها", href: "/user/downloads", icon: Download },
  { label: "تنظیمات", href: "/user/settings", icon: Settings },
];

export function UserSidebar() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const dashboardHref = useAuthStore((state) => state.dashboardHref);
  const dashboardLabel = useAuthStore((state) => state.dashboardLabel);
  const storeUser = useAuthStore((state) => state.user);
  const resolvedDashboardHref = dashboardHref ?? "/user/dashboard";
  const resolvedDashboardLabel = dashboardLabel ?? "داشبورد";

  const canUseUserPanel = !!role && USER_PANEL_ROLES.includes(role);
  const navItems = [
    {
      label: canUseUserPanel ? resolvedDashboardLabel : "داشبورد",
      href: canUseUserPanel ? resolvedDashboardHref : "/user/dashboard",
      icon: LayoutDashboard,
    },
    ...baseNavItems,
  ];

  const displayName =
    [storeUser?.firstName, storeUser?.lastName].filter(Boolean).join(" ") ||
    "حساب کاربری";
  const displayRole = role === "support" ? "باشگاه سازندگان" : "پنل کاربری";

  return (
    <aside className="hidden w-64 flex-shrink-0 md:block">
      <div className="mb-4 rounded-2xl border border-white/8 bg-surface p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-xl font-black text-gold">
            {(storeUser?.firstName?.[0] ?? "م").toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{displayName}</div>
            <div className="text-xs text-gold">{displayRole}</div>
          </div>
        </div>
      </div>

      <nav className="overflow-hidden rounded-2xl border border-white/8 bg-surface">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between border-b border-white/5 px-4 py-3 text-sm transition-all duration-200 last:border-b-0",
                isActive
                  ? "border-r-2 border-r-gold bg-gold/10 text-gold"
                  : "text-muted hover:bg-white/5 hover:text-white",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </div>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-2xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <button className="flex w-full items-center gap-3 border-t border-white/8 px-4 py-3 text-sm text-danger transition-colors hover:bg-danger/10">
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </nav>
    </aside>
  );
}

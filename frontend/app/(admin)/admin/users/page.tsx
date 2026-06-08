'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Shield, UserCheck, UserX, X, Percent, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { toPersianNumber, formatJalaliDate, getInitials } from '@/lib/utils'
import type { UserRole, CustomerTier } from '@/types'
import { CUSTOMER_TIER_LABEL } from '@/types/auth'

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  isActive: boolean
  isVerified: boolean
  orderCount: number
  createdAt: string
  customerTier: CustomerTier
  specialDiscountPercent: number
}

const roleBadgeVariant: Record<UserRole, BadgeVariant> = {
  super_admin: 'danger',
  admin:       'gold',
  manager:     'warning',
  support:     'muted',
  customer:    'outline',
}

const roleLabel: Record<UserRole, string> = {
  super_admin: 'مدیر ارشد',
  admin:       'مدیر',
  manager:     'مسئول',
  support:     'پشتیبانی',
  customer:    'مشتری',
}

const tierBadgeClass: Record<CustomerTier, string> = {
  regular:      'bg-white/8 text-white/60 border-white/15',
  mass_builder: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  reseller:     'bg-amber-500/15 text-amber-300 border-amber-500/35',
}

export default function AdminUsersPage() {
  const supabase = createClient()

  const [search, setSearch]               = useState('')
  const [users, setUsers]                 = useState<AdminUser[]>([])
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [editing, setEditing]             = useState<AdminUser | null>(null)
  const [tierDraft, setTierDraft]         = useState<CustomerTier>('regular')
  const [discountDraft, setDiscountDraft] = useState<number>(0)

  // ── Fetch users from Supabase ─────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, role, is_active, is_verified, created_at, customer_tier, special_discount_percent')
      .order('created_at', { ascending: false })

    if (err) {
      setError('خطا در دریافت کاربران: ' + err.message)
    } else {
      setUsers(
        (data ?? []).map((r) => ({
          id:                     r.id,
          firstName:              r.first_name ?? '',
          lastName:               r.last_name  ?? '',
          email:                  r.email,
          phone:                  r.phone,
          role:                   r.role as UserRole,
          isActive:               r.is_active  ?? true,
          isVerified:             r.is_verified ?? false,
          orderCount:             0,
          createdAt:              r.created_at,
          customerTier:           (r.customer_tier ?? 'regular') as CustomerTier,
          specialDiscountPercent: Number(r.special_discount_percent ?? 0),
        })),
      )
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.includes(search) ||
      u.email.includes(search) ||
      (u.phone ?? '').includes(search),
  )

  function openEdit(user: AdminUser) {
    setEditing(user)
    setTierDraft(user.customerTier)
    setDiscountDraft(user.specialDiscountPercent)
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)

    const { error: err } = await supabase
      .from('users')
      .update({
        customer_tier:            tierDraft,
        special_discount_percent: discountDraft,
      })
      .eq('id', editing.id)

    if (err) {
      alert('خطا در ذخیره: ' + err.message)
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing.id
            ? { ...u, customerTier: tierDraft, specialDiscountPercent: discountDraft }
            : u,
        ),
      )
      setEditing(null)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت کاربران</h1>
          <p className="text-sm text-[#A0A0A0]">{toPersianNumber(users.length)} کاربر</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { label: 'کل کاربران', count: users.length,                                  icon: '👥' },
          { label: 'فعال',       count: users.filter((u) => u.isActive).length,         icon: '✅' },
          { label: 'انبوه‌ساز', count: users.filter((u) => u.customerTier === 'mass_builder').length, icon: '🏗️' },
          { label: 'همکار',      count: users.filter((u) => u.customerTier === 'reseller').length,    icon: '🤝' },
        ] as { label: string; count: number; icon: string }[]).map(({ label, count, icon }) => (
          <div key={label} className="p-4 rounded-xl bg-[#181818] border border-white/8">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-black text-white">{toPersianNumber(count)}</div>
            <div className="text-xs text-[#A0A0A0]">{label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      <div className="max-w-xs">
        <Input
          placeholder="جستجو در کاربران..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl bg-[#181818] border border-white/8 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-[#A0A0A0]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">در حال بارگذاری...</span>
          </div>
        )}
        {!loading && (<Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>تیر مشتری</TableHead>
              <TableHead>تخفیف</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>سفارشات</TableHead>
              <TableHead>تاریخ عضویت</TableHead>
              <TableHead className="text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-white/3 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white text-sm">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-[#A0A0A0]">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[user.role]} size="sm">{roleLabel[user.role]}</Badge>
                </TableCell>
                <TableCell>
                  {user.role === 'customer' ? (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${tierBadgeClass[user.customerTier]}`}>
                      {CUSTOMER_TIER_LABEL[user.customerTier]}
                    </span>
                  ) : (
                    <span className="text-[#505050] text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.specialDiscountPercent > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-bold">
                      <Percent className="h-3 w-3" />
                      {toPersianNumber(user.specialDiscountPercent)}٪
                    </span>
                  ) : (
                    <span className="text-[#505050] text-xs">بدون تخفیف</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {user.isActive
                      ? <Badge variant="success" size="sm" dot>فعال</Badge>
                      : <Badge variant="danger"  size="sm" dot>غیرفعال</Badge>}
                    {user.isVerified
                      ? <Badge variant="muted"   size="sm">تأیید شده</Badge>
                      : <Badge variant="warning" size="sm">تأییدنشده</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[#A0A0A0]">{toPersianNumber(user.orderCount)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#A0A0A0]">{formatJalaliDate(user.createdAt)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      aria-label={user.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                      className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-white hover:border-white/20 transition-all"
                    >
                      {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                    </button>
                    {user.role === 'customer' && (
                      <button
                        onClick={() => openEdit(user)}
                        aria-label="تنظیم تیر و تخفیف"
                        className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#C8A85D] hover:border-[#C8A85D]/30 transition-all"
                      >
                        <Shield className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>)}
      </div>

      {/* ── Tier / Discount edit modal ── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              transition={{ duration: 0.2 }}
              dir="rtl"
              className="w-full max-w-md rounded-2xl bg-[#141414] border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div>
                  <div className="text-white font-bold text-base">تنظیم تیر مشتری</div>
                  <div className="text-[#A0A0A0] text-xs mt-0.5">
                    {editing.firstName} {editing.lastName} — {editing.email}
                  </div>
                </div>
                <button onClick={() => setEditing(null)} className="text-[#A0A0A0] hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Tier selector */}
                <div>
                  <label className="text-sm text-[#A0A0A0] mb-2 block">نوع مشتری</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.entries(CUSTOMER_TIER_LABEL) as [CustomerTier, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setTierDraft(key)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-right ${
                          tierDraft === key
                            ? 'border-[#C8A85D] bg-[#C8A85D]/10 text-[#C8A85D]'
                            : 'border-white/8 bg-white/3 text-[#A0A0A0] hover:border-white/15 hover:text-white'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tierDraft === key ? 'bg-[#C8A85D]' : 'bg-white/20'}`} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount input */}
                <div>
                  <label className="text-sm text-[#A0A0A0] mb-2 block">درصد تخفیف ویژه</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountDraft}
                      onChange={(e) => setDiscountDraft(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-[#1E1E1E] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C8A85D]/50 transition-colors pl-10"
                      placeholder="0"
                    />
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
                  </div>
                  {discountDraft > 0 && (
                    <p className="text-xs text-green-400 mt-1.5">
                      این مشتری {toPersianNumber(discountDraft)}٪ تخفیف روی تمام خریدها دریافت می‌کند.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-2 px-5 pb-5">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A85D] to-[#E7D3A5] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-[#A0A0A0] text-sm hover:text-white hover:border-white/20 transition-all"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

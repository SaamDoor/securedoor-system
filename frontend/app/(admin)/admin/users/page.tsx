'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, UserCheck, UserX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { toPersianNumber, formatJalaliDate, getInitials } from '@/lib/utils'
import type { UserRole } from '@/types'

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
}

const roleBadgeVariant: Record<UserRole, BadgeVariant> = {
  super_admin: 'danger',
  admin: 'gold',
  manager: 'warning',
  support: 'muted',
  customer: 'outline',
}

const roleLabel: Record<UserRole, string> = {
  super_admin: 'مدیر ارشد',
  admin: 'مدیر',
  manager: 'مسئول',
  support: 'پشتیبانی',
  customer: 'مشتری',
}

const USERS: AdminUser[] = [
  { id: '1', firstName: 'مهندس', lastName: 'رضایی', email: 'rezaei@example.com', phone: '09121234567', role: 'customer', isActive: true, isVerified: true, orderCount: 5, createdAt: '2024-06-01' },
  { id: '2', firstName: 'خانم', lastName: 'موسوی', email: 'mousavi@example.com', phone: '09112345678', role: 'customer', isActive: true, isVerified: true, orderCount: 3, createdAt: '2024-08-15' },
  { id: '3', firstName: 'علی', lastName: 'احمدی', email: 'ahmadi@example.com', role: 'customer', isActive: false, isVerified: false, orderCount: 0, createdAt: '2025-01-10' },
  { id: '4', firstName: 'سارا', lastName: 'نجفی', email: 'najafi@example.com', role: 'admin', isActive: true, isVerified: true, orderCount: 0, createdAt: '2024-01-01' },
]

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')

  const filtered = USERS.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.includes(search) ||
      u.email.includes(search) ||
      (u.phone ?? '').includes(search),
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت کاربران</h1>
          <p className="text-sm text-[#A0A0A0]">{toPersianNumber(USERS.length)} کاربر</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            { label: 'کل کاربران', count: USERS.length, icon: '👥' },
            { label: 'فعال', count: USERS.filter((u) => u.isActive).length, icon: '✅' },
            { label: 'تأیید شده', count: USERS.filter((u) => u.isVerified).length, icon: '🔒' },
            { label: 'ادمین‌ها', count: USERS.filter((u) => u.role !== 'customer').length, icon: '⭐' },
          ] as { label: string; count: number; icon: string }[]
        ).map(({ label, count, icon }) => (
          <div key={label} className="p-4 rounded-xl bg-[#181818] border border-white/8">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-black text-white">{toPersianNumber(count)}</div>
            <div className="text-xs text-[#A0A0A0]">{label}</div>
          </div>
        ))}
      </div>

      <div className="max-w-xs">
        <Input
          placeholder="جستجو در کاربران..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl bg-[#181818] border border-white/8 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>نقش</TableHead>
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
                      <div className="font-medium text-white text-sm">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-[#A0A0A0]">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[user.role]} size="sm">
                    {roleLabel[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {user.isActive
                      ? <Badge variant="success" size="sm" dot>فعال</Badge>
                      : <Badge variant="danger" size="sm" dot>غیرفعال</Badge>
                    }
                    {user.isVerified
                      ? <Badge variant="muted" size="sm">تأیید شده</Badge>
                      : <Badge variant="warning" size="sm">تأییدنشده</Badge>
                    }
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
                    <button
                      aria-label="مدیریت نقش"
                      className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#C8A85D] hover:border-[#C8A85D]/30 transition-all"
                    >
                      <Shield className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

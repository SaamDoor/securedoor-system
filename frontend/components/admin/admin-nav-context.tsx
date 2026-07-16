'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'

interface AdminNavContextValue {
  mobileOpen: boolean
  openMobile: () => void
  closeMobile: () => void
  toggleMobile: () => void
}

const AdminNavContext = createContext<AdminNavContextValue | null>(null)

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const openMobile = useCallback(() => setMobileOpen(true), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), [])

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Escape + body scroll lock
  useEffect(() => {
    if (!mobileOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  const value = useMemo(
    () => ({ mobileOpen, openMobile, closeMobile, toggleMobile }),
    [mobileOpen, openMobile, closeMobile, toggleMobile],
  )

  return (
    <AdminNavContext.Provider value={value}>
      {children}
    </AdminNavContext.Provider>
  )
}

export function useAdminNav() {
  const ctx = useContext(AdminNavContext)
  if (!ctx) {
    throw new Error('useAdminNav must be used within AdminNavProvider')
  }
  return ctx
}

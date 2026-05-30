'use client'

import { Bell, Search, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminTopbar() {
  return (
    <header className="h-14 border-b border-white/8 bg-charcoal flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو..."
            className={cn(
              'w-full h-9 rounded-lg pr-9 pl-3 text-sm',
              'bg-white/5 border border-white/8',
              'text-white placeholder:text-muted',
              'focus:outline-none focus:border-gold',
              'transition-colors',
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mr-auto">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted hover:text-white transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* Settings */}
        <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted hover:text-white transition-colors">
          <Settings className="h-4 w-4" />
        </button>

        {/* Admin user */}
        <div className="flex items-center gap-2 mr-2 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-black text-sm">
            م
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-white">مدیر سیستم</div>
            <div className="text-2xs text-muted">super_admin</div>
          </div>
        </div>
      </div>
    </header>
  )
}

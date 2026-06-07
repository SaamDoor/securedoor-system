'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/constants'

const channels = [
  {
    id: 'telegram',
    label: 'تلگرام',
    href: SOCIAL_LINKS.telegram,
    color: '#2AABEE',
    bg: 'bg-[#2AABEE]/10 border-[#2AABEE]/30 hover:bg-[#2AABEE]/20',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#2AABEE]">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.99 5.07 13.1c-.643-.204-.657-.643.136-.953l11.57-4.461c.535-.194 1.002.131.118.535z" />
      </svg>
    ),
  },
  {
    id: 'eitaa',
    label: 'ایتا',
    href: SOCIAL_LINKS.eitaa,
    color: '#2ECC71',
    bg: 'bg-[#2ECC71]/10 border-[#2ECC71]/30 hover:bg-[#2ECC71]/20',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#2ECC71]">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.07-.78 4.19-1.82 6.98-3.02 8.38-3.61 3.99-1.66 4.82-1.95 5.36-1.96.12 0 .38.03.55.18.14.12.18.29.2.46-.02.06-.02.12-.03.18z" />
      </svg>
    ),
  },
  {
    id: 'rubika',
    label: 'روبیکا',
    href: SOCIAL_LINKS.rubika,
    color: '#8B5CF6',
    bg: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#8B5CF6]">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    ),
  },
  {
    id: 'soroush',
    label: 'سروش پلاس',
    href: SOCIAL_LINKS.soroush,
    color: '#F59E0B',
    bg: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-400">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: 'اینستاگرام',
    href: SOCIAL_LINKS.instagram,
    color: '#E1306C',
    bg: 'bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-pink-500">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
]

export function FloatingContactButton() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  // Show after 1s scroll or 2s
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3" dir="rtl">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-72 rounded-2xl overflow-hidden
              backdrop-blur-2xl bg-black/80 border border-white/10
              shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-gold" />
              </div>
              <div>
                <div className="text-white text-sm font-bold">ارتباط با مشعوف</div>
                <div className="text-white/40 text-xs">کانال ارتباطی خود را انتخاب کنید</div>
              </div>
            </div>

            {/* Channels */}
            <div className="p-3 space-y-1.5">
              {channels.map((ch, i) => (
                <motion.a
                  key={ch.id}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${ch.bg}`}
                >
                  <div className="flex-shrink-0">{ch.icon}</div>
                  <span className="text-white text-sm font-medium">{ch.label}</span>
                  <Send className="w-3 h-3 text-white/30 mr-auto" />
                </motion.a>
              ))}
            </div>

            {/* Direct chat CTA */}
            <div className="px-3 pb-3">
              <Link
                href="/user/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                  bg-gold-gradient text-black font-bold text-sm
                  hover:opacity-90 transition-opacity duration-200"
                onClick={() => setOpen(false)}
              >
                <MessageSquare className="w-4 h-4" />
                چت آنلاین با پشتیبانی
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setOpen((v) => !v)}
            aria-label="باز کردن راه‌های ارتباطی"
            className="relative w-14 h-14 rounded-full
              bg-gold-gradient text-black
              shadow-[0_4px_24px_rgba(200,168,93,0.5)]
              hover:shadow-[0_4px_32px_rgba(200,168,93,0.7)]
              transition-shadow duration-300
              flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="w-6 h-6" />
                </motion.span>
              )}
            </AnimatePresence>
            {/* Ping animation */}
            {!open && (
              <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping opacity-75" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { SITE_NAME } from '@/lib/constants'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 60% 40%, rgba(200,168,93,0.15) 0%, transparent 60%)',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(200,168,93,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(200,168,93,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 text-center px-12">
          <Link href="/" className="inline-flex items-center gap-4 mb-12 group">
            <Image src="/logo-gold.svg" alt="گروه صنعتی مشعوف" width={56} height={56} priority />
            <div className="text-right">
              <div className="text-2xl font-black text-white">{SITE_NAME}</div>
              <div className="text-xs text-gold tracking-widest">MASHOUF INDUSTRIAL GROUP</div>
            </div>
          </Link>

          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            امنیت سلطنتی<br />
            <span className="text-gold-gradient">برای خانه شما</span>
          </h2>
          <p className="text-muted text-lg leading-relaxed max-w-md">
            با بیش از یک دهه تجربه، گروه صنعتی مشعوف پیشرو در ساخت درب‌های ضد سرقت و محصولات ساختمانی لوکس در مازندران است.
          </p>

          {/* Features */}
          <div className="mt-10 flex flex-col gap-3 text-right max-w-sm mx-auto">
            {[
              '✅ ضمانت ۱۰ ساله برای تمام محصولات',
              '✅ نصب تخصصی در سراسر کشور',
              '✅ استاندارد EN 1627 Class 6',
              '✅ پشتیبانی ۲۴ ساعته',
            ].map((f) => (
              <div key={f} className="text-sm text-muted">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden p-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-gold.svg" alt="گروه صنعتی مشعوف" width={36} height={36} />
            <span className="font-bold text-white">{SITE_NAME}</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
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
            <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-gold">
              <span className="text-black font-black text-2xl">س</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white">{SITE_NAME}</div>
              <div className="text-sm text-gold tracking-widest">SAM DOOR CO.</div>
            </div>
          </Link>

          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            امنیت سلطنتی<br />
            <span className="text-gold-gradient">برای خانه شما</span>
          </h2>
          <p className="text-muted text-lg leading-relaxed max-w-md">
            با بیش از ۲۰ سال تجربه، سام درب پیشرو در ساخت درب‌های ضد سرقت لوکس است.
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
            <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-lg">س</span>
            </div>
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

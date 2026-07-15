import Link from 'next/link'
import { Calculator, ArrowLeft } from 'lucide-react'

export function ProductToolsBanner() {
  return (
    <Link
      href="/tools/materials-calculator"
      className="group mb-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/25 bg-gradient-to-l from-primary/15 via-primary/5 to-transparent p-5 transition-all hover:border-primary/45 sm:flex-row sm:items-center sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold tracking-widest text-primary">ابزار رایگان مشعوف</div>
          <p className="text-sm font-bold text-white sm:text-base">
            قبل از خرید، مقدار مصالح موردنیاز پروژه خود را رایگان محاسبه کنید.
          </p>
        </div>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        شروع محاسبه
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      </span>
    </Link>
  )
}

'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Phone,
  Package,
  Sparkles,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, toPersianNumber, cn } from '@/lib/utils'
import {
  BUILDING_TYPE_LABELS,
  FOUNDATION_TYPE_LABELS,
  QUALITY_LABELS,
  SLAB_TYPE_LABELS,
  STAGE_LABELS,
  STRUCTURE_TYPE_LABELS,
  type BuildingType,
  type ConstructionStage,
  type FoundationType,
  type QualityLevel,
  type SlabType,
  type StructureType,
} from '@/lib/tools/coefficients'
import {
  calculateProfessional,
  calculateQuick,
  type CalcResult,
  type ProfessionalCalcInput,
} from '@/lib/tools/calculation-engine'
import {
  buildRecommendationHints,
  scoreProductAgainstHints,
} from '@/lib/tools/recommendation-engine'
import { saveToolsLeadPhoneAction } from '../actions'

export interface RecommendableProduct {
  id: string
  name: string
  href: string
  price: number
  image: string | null
  categoryName: string
  tags: string[]
}

interface Props {
  products: RecommendableProduct[]
}

const CATEGORY_LABELS: Record<string, string> = {
  concrete: 'بتن و اسکلت',
  steel: 'فولاد و میلگرد',
  aggregates: 'سیمان و مصالح سنگی',
  masonry: 'دیوارچینی',
  finishing: 'نازک‌کاری',
  other: 'سایر',
}

const PROF_STEPS = [
  'مشخصات پروژه',
  'مشخصات سازه',
  'فونداسیون',
  'ستون‌ها',
  'تیرها',
  'سقف',
  'دیوارها',
  'نازک‌کاری',
  'تأسیسات',
  'بررسی نهایی',
]

const defaultProf: ProfessionalCalcInput = {
  buildingType: 'residential',
  structureType: 'concrete',
  areaSqm: 140,
  floors: 4,
  quality: 'standard',
  storyHeightM: 3.1,
  foundationType: 'strip',
  foundationDepthM: 1.1,
  columnCount: 16,
  columnSectionCm: 40,
  beamLengthPerFloorM: 90,
  beamWidthCm: 30,
  beamDepthCm: 50,
  slabType: 'joist',
  exteriorWallAreaM2: 480,
  interiorWallAreaM2: 620,
  wallThicknessCm: 20,
  plasterCoveragePct: 90,
  tilingCoveragePct: 60,
  includeFinishing: true,
  includeMepAllowance: true,
  stage: 'full',
}

export function MaterialsCalculatorClient({ products }: Props) {
  const [mode, setMode] = useState<'quick' | 'professional'>('quick')
  const [result, setResult] = useState<CalcResult | null>(null)
  const [phoneUnlocked, setPhoneUnlocked] = useState(false)
  const [phone, setPhone] = useState('')
  const [pending, startTransition] = useTransition()
  const [profStep, setProfStep] = useState(0)

  const [quick, setQuick] = useState({
    buildingType: 'residential' as BuildingType,
    structureType: 'concrete' as StructureType,
    areaSqm: 120,
    floors: 2,
    quality: 'standard' as QualityLevel,
  })

  const [prof, setProf] = useState<ProfessionalCalcInput>(defaultProf)

  const recommendations = useMemo(() => {
    if (!result) return []
    const hints = buildRecommendationHints(result)
    return products
      .map((p) => ({ ...p, ...scoreProductAgainstHints(p, hints) }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [result, products])

  const groupedMaterials = useMemo(() => {
    if (!result) return []
    const map = new Map<string, typeof result.materials>()
    for (const m of result.materials) {
      const list = map.get(m.category) ?? []
      list.push(m)
      map.set(m.category, list)
    }
    return [...map.entries()]
  }, [result])

  const showResults = (next: CalcResult) => {
    setResult(next)
    setPhoneUnlocked(false)
    requestAnimationFrame(() => {
      document.getElementById('calc-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const autoWallAreas = () => {
    const area = Math.max(20, prof.areaSqm)
    const floors = Math.max(1, prof.floors)
    const side = Math.sqrt(area)
    const perimeter = side * 4
    const ext = Math.round(perimeter * prof.storyHeightM * floors * 0.82)
    const int = Math.round(area * floors * 0.55)
    setProf((s) => ({ ...s, exteriorWallAreaM2: ext, interiorWallAreaM2: int }))
    toast.success('سطح دیوار بر اساس زیربنا تخمین زده شد')
  }

  const buildReportHtml = () => {
    if (!result) return ''
    const rows = result.materials
      .map(
        (m) =>
          `<tr><td>${m.name}</td><td>${m.quantityRounded.toLocaleString('fa-IR')}</td><td>${m.unit}</td><td>${m.note ?? ''}</td></tr>`,
      )
      .join('')
    const elements = (result.elements ?? [])
      .map(
        (e) =>
          `<tr><td>${e.label}</td><td>${e.concreteM3.toLocaleString('fa-IR')}</td><td>${e.rebarKg.toLocaleString('fa-IR')}</td></tr>`,
      )
      .join('')
    return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"/><title>گزارش مصالح مشعوف</title>
<style>body{font-family:Tahoma,sans-serif;padding:28px;color:#111;line-height:1.7}h1{font-size:20px;margin:0 0 8px}h2{font-size:15px;margin:24px 0 8px}table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}td,th{border:1px solid #ccc;padding:8px;text-align:right}th{background:#f5f5f5}.muted{color:#666;font-size:12px}@media print{body{padding:12px}}</style></head><body>
<h1>گزارش برآورد مصالح ساختمان</h1>
<p class="muted">گروه صنعتی مشعوف · حالت ${result.mode === 'quick' ? 'سریع' : 'حرفه‌ای'} · ${new Date(result.generatedAt).toLocaleString('fa-IR')}</p>
<p>زیربنای هر طبقه: ${result.summary.areaSqm} م² · طبقات: ${result.summary.floors} · زیربنای کل: ${result.summary.totalArea} م²</p>
<p>ساختمان: ${BUILDING_TYPE_LABELS[result.summary.buildingType]} · سازه: ${STRUCTURE_TYPE_LABELS[result.summary.structureType]} · کیفیت: ${QUALITY_LABELS[result.summary.quality]}</p>
${elements ? `<h2>تفکیک المان‌های سازه‌ای</h2><table><thead><tr><th>المان</th><th>بتن (م³)</th><th>میلگرد (kg)</th></tr></thead><tbody>${elements}</tbody></table>` : ''}
<h2>جدول مصالح</h2>
<table><thead><tr><th>مصالح</th><th>مقدار</th><th>واحد</th><th>توضیح</th></tr></thead><tbody>${rows}</tbody></table>
<h2>فرضیات</h2><ul>${result.assumptions.map((a) => `<li>${a}</li>`).join('')}</ul>
<p class="muted">این گزارش تقریبی است و جایگزین نقشه‌های اجرایی یا متره دفتر فنی نیست.</p>
</body></html>`
  }

  const printReport = () => {
    if (!result) return
    const html = buildReportHtml()
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    // Always offer a file download (popup blockers cannot prevent this)
    const a = document.createElement('a')
    a.href = url
    a.download = `mashuf-materials-report-${Date.now()}.html`
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()

    // Best-effort print preview in a new tab
    const w = window.open(url, '_blank', 'noopener,noreferrer')
    if (w) {
      const tryPrint = () => {
        try {
          w.focus()
          w.print()
        } catch {
          /* ignore */
        }
      }
      w.addEventListener('load', tryPrint)
      setTimeout(tryPrint, 600)
    } else {
      toast.message('فایل گزارش دانلود شد. برای چاپ، فایل را باز کنید.')
    }

    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const unlockReport = () => {
    startTransition(async () => {
      const res = await saveToolsLeadPhoneAction({
        phone,
        source: 'materials-calculator',
        tool: 'materials-calculator',
      })
      if (!res.ok && res.reason === 'invalid_phone') {
        toast.error(res.error)
        return
      }
      // Never block report delivery on soft lead-save failures
      setPhoneUnlocked(true)
      if (res.ok) {
        toast.success('شماره ثبت شد — در حال آماده‌سازی گزارش')
      } else {
        toast.message('ثبت شماره موقتاً ممکن نشد', {
          description: 'گزارش همچنان دانلود می‌شود.',
        })
      }
      printReport()
    })
  }

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <section
        className="relative overflow-hidden pb-14 pt-28"
        style={{
          background:
            'radial-gradient(ellipse at 80% 10%, rgba(196,30,58,0.16), transparent 45%), linear-gradient(180deg,#141414,#0a0a0a)',
        }}
      >
        <div className="container">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-primary">خانه</Link>
            <span>/</span>
            <span className="text-white">محاسبه‌گر مصالح ساختمان</span>
          </nav>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            رایگان · بدون ذخیره پروژه · متره تقریبی مهندسی
          </div>
          <h1 className="max-w-3xl text-3xl font-black text-white sm:text-5xl">
            محاسبه‌گر هوشمند مصالح ساختمان
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            بتن، میلگرد، سیمان، شن، ماسه، بلوک، آجر، گچ و چسب کاشی را با دو حالت سریع و حرفه‌ای
            (المانی) برآورد کنید؛ سپس محصولات مرتبط مشعوف را ببینید.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant={mode === 'quick' ? 'gold' : 'gold-outline'}
              size="lg"
              onClick={() => { setMode('quick'); setResult(null) }}
            >
              محاسبه سریع
            </Button>
            <Button
              variant={mode === 'professional' ? 'gold' : 'gold-outline'}
              size="lg"
              onClick={() => { setMode('professional'); setResult(null); setProfStep(0) }}
            >
              محاسبه حرفه‌ای
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="mb-6 flex gap-2 rounded-2xl border border-white/8 bg-zinc-950 p-1.5">
          {([
            { id: 'quick' as const, label: 'محاسبه سریع', desc: 'زیر ۳۰ ثانیه' },
            { id: 'professional' as const, label: 'محاسبه حرفه‌ای', desc: 'المانی / دفتر فنی' },
          ]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setMode(tab.id); setResult(null) }}
              className={cn(
                'flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all',
                mode === tab.id ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white',
              )}
            >
              <span className="block">{tab.label}</span>
              <span className={cn('mt-0.5 block text-[11px] font-normal', mode === tab.id ? 'text-white/80' : 'text-zinc-600')}>
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'quick' ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-white/8 bg-zinc-950 p-5 sm:p-8"
            >
              <h2 className="mb-1 text-xl font-black text-white">محاسبه سریع</h2>
              <p className="mb-6 text-sm text-zinc-500">مناسب مالک، سازنده و برآورد اولیه</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="نوع ساختمان" value={quick.buildingType} onChange={(v) => setQuick((s) => ({ ...s, buildingType: v as BuildingType }))} options={Object.entries(BUILDING_TYPE_LABELS)} />
                <SelectField label="نوع سازه" value={quick.structureType} onChange={(v) => setQuick((s) => ({ ...s, structureType: v as StructureType }))} options={Object.entries(STRUCTURE_TYPE_LABELS)} />
                <NumberField label="زیربنای هر طبقه (م²)" value={quick.areaSqm} onChange={(v) => setQuick((s) => ({ ...s, areaSqm: v }))} />
                <NumberField label="تعداد طبقات" value={quick.floors} onChange={(v) => setQuick((s) => ({ ...s, floors: v }))} />
                <SelectField label="سطح کیفیت ساخت" value={quick.quality} onChange={(v) => setQuick((s) => ({ ...s, quality: v as QualityLevel }))} options={Object.entries(QUALITY_LABELS)} />
              </div>
              <Button variant="gold" size="lg" className="mt-8" onClick={() => showResults(calculateQuick(quick))}>
                <Calculator className="ml-2 h-5 w-5" />
                محاسبه کن
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="prof"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-white/8 bg-zinc-950 p-5 sm:p-8"
            >
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                  <span>مرحله {toPersianNumber(profStep + 1)} از {toPersianNumber(PROF_STEPS.length)}</span>
                  <span className="font-semibold text-zinc-300">{PROF_STEPS[profStep]}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((profStep + 1) / PROF_STEPS.length) * 100}%` }} />
                </div>
                <div className="mt-3 hidden flex-wrap gap-1.5 md:flex">
                  {PROF_STEPS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setProfStep(i)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[10px] transition-colors',
                        i === profStep ? 'bg-primary/20 text-primary' : i < profStep ? 'bg-white/5 text-zinc-400' : 'text-zinc-600',
                      )}
                    >
                      {toPersianNumber(i + 1)}. {label}
                    </button>
                  ))}
                </div>
              </div>

              {profStep === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="نوع ساختمان" value={prof.buildingType} onChange={(v) => setProf((s) => ({ ...s, buildingType: v as BuildingType }))} options={Object.entries(BUILDING_TYPE_LABELS)} />
                  <NumberField label="زیربنای هر طبقه (م²)" value={prof.areaSqm} onChange={(v) => setProf((s) => ({ ...s, areaSqm: v }))} />
                  <NumberField label="تعداد طبقات" value={prof.floors} onChange={(v) => setProf((s) => ({ ...s, floors: v }))} />
                  <NumberField label="ارتفاع طبقه (متر)" value={prof.storyHeightM} onChange={(v) => setProf((s) => ({ ...s, storyHeightM: v }))} step={0.1} />
                </div>
              )}

              {profStep === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="نوع سازه" value={prof.structureType} onChange={(v) => setProf((s) => ({ ...s, structureType: v as StructureType }))} options={Object.entries(STRUCTURE_TYPE_LABELS)} />
                  <SelectField label="کیفیت اجرا" value={prof.quality} onChange={(v) => setProf((s) => ({ ...s, quality: v as QualityLevel }))} options={Object.entries(QUALITY_LABELS)} />
                  <SelectField label="محدوده محاسبه" value={prof.stage} onChange={(v) => setProf((s) => ({ ...s, stage: v as ConstructionStage }))} options={Object.entries(STAGE_LABELS)} />
                </div>
              )}

              {profStep === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="نوع فونداسیون" value={prof.foundationType} onChange={(v) => setProf((s) => ({ ...s, foundationType: v as FoundationType }))} options={Object.entries(FOUNDATION_TYPE_LABELS)} />
                  <NumberField label="ضخامت / عمق متوسط (متر)" value={prof.foundationDepthM} onChange={(v) => setProf((s) => ({ ...s, foundationDepthM: v }))} step={0.1} />
                </div>
              )}

              {profStep === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField label="تعداد ستون‌ها" value={prof.columnCount} onChange={(v) => setProf((s) => ({ ...s, columnCount: v }))} />
                  <NumberField label="بعد مقطع مربع ستون (سانتی‌متر)" value={prof.columnSectionCm} onChange={(v) => setProf((s) => ({ ...s, columnSectionCm: v }))} />
                </div>
              )}

              {profStep === 4 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField label="جمع طول تیر در هر طبقه (متر)" value={prof.beamLengthPerFloorM} onChange={(v) => setProf((s) => ({ ...s, beamLengthPerFloorM: v }))} />
                  <NumberField label="عرض تیر (سانتی‌متر)" value={prof.beamWidthCm} onChange={(v) => setProf((s) => ({ ...s, beamWidthCm: v }))} />
                  <NumberField label="ارتفاع تیر (سانتی‌متر)" value={prof.beamDepthCm} onChange={(v) => setProf((s) => ({ ...s, beamDepthCm: v }))} />
                </div>
              )}

              {profStep === 5 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="نوع سقف" value={prof.slabType} onChange={(v) => setProf((s) => ({ ...s, slabType: v as SlabType }))} options={Object.entries(SLAB_TYPE_LABELS)} />
                  <NumberField label="ضخامت معادل سقف (متر) — اختیاری" value={prof.slabThicknessM ?? 0} onChange={(v) => setProf((s) => ({ ...s, slabThicknessM: v > 0 ? v : undefined }))} step={0.01} />
                </div>
              )}

              {profStep === 6 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-zinc-400">سطح دیوار را وارد کنید یا از تخمین خودکار استفاده کنید.</p>
                    <Button type="button" variant="dark" size="sm" onClick={autoWallAreas}>تخمین خودکار دیوار</Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField label="سطح دیوار خارجی (م²)" value={prof.exteriorWallAreaM2} onChange={(v) => setProf((s) => ({ ...s, exteriorWallAreaM2: v }))} />
                    <NumberField label="سطح دیوار داخلی (م²)" value={prof.interiorWallAreaM2} onChange={(v) => setProf((s) => ({ ...s, interiorWallAreaM2: v }))} />
                    <NumberField label="ضخامت دیوار (سانتی‌متر)" value={prof.wallThicknessCm} onChange={(v) => setProf((s) => ({ ...s, wallThicknessCm: v }))} />
                  </div>
                </div>
              )}

              {profStep === 7 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <ToggleField label="شامل نازک‌کاری" checked={prof.includeFinishing} onChange={(v) => setProf((s) => ({ ...s, includeFinishing: v }))} />
                  <NumberField label="پوشش گچ‌کاری (%)" value={prof.plasterCoveragePct} onChange={(v) => setProf((s) => ({ ...s, plasterCoveragePct: v }))} />
                  <NumberField label="پوشش کاشی/سرامیک از زیربنا (%)" value={prof.tilingCoveragePct} onChange={(v) => setProf((s) => ({ ...s, tilingCoveragePct: v }))} />
                </div>
              )}

              {profStep === 8 && (
                <div className="space-y-4">
                  <ToggleField
                    label="سهم تقریبی تأسیسات (حفاری، ملات نصب، اصلاحات)"
                    checked={prof.includeMepAllowance}
                    onChange={(v) => setProf((s) => ({ ...s, includeMepAllowance: v }))}
                  />
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
                    متره دقیق لوله‌کشی، کابل و تجهیزات مکانیکال در این نسخه لحاظ نمی‌شود؛ فقط ضریب احتیاطی کوچک
                    روی بتن/سیمان اعمال می‌گردد.
                  </p>
                </div>
              )}

              {profStep === 9 && (
                <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
                  <p>ساختمان: {BUILDING_TYPE_LABELS[prof.buildingType]} · سازه: {STRUCTURE_TYPE_LABELS[prof.structureType]}</p>
                  <p>زیربنا: {toPersianNumber(prof.areaSqm)} م² × {toPersianNumber(prof.floors)} طبقه · ارتفاع {toPersianNumber(prof.storyHeightM)} م</p>
                  <p>فونداسیون: {FOUNDATION_TYPE_LABELS[prof.foundationType]} · سقف: {SLAB_TYPE_LABELS[prof.slabType]}</p>
                  <p>ستون: {toPersianNumber(prof.columnCount)} عدد · تیر: {toPersianNumber(prof.beamLengthPerFloorM)} م/طبقه</p>
                  <p>محدوده: {STAGE_LABELS[prof.stage]} · کیفیت: {QUALITY_LABELS[prof.quality]}</p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {profStep > 0 && (
                  <Button variant="dark" size="lg" onClick={() => setProfStep((s) => s - 1)}>
                    <ChevronRight className="ml-1 h-4 w-4" />
                    قبلی
                  </Button>
                )}
                {profStep < PROF_STEPS.length - 1 ? (
                  <Button variant="gold" size="lg" onClick={() => setProfStep((s) => s + 1)}>
                    بعدی
                    <ChevronLeft className="mr-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="gold" size="lg" onClick={() => showResults(calculateProfessional(prof))}>
                    <Calculator className="ml-2 h-5 w-5" />
                    محاسبه حرفه‌ای
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {result && (
        <section id="calc-results" className="container space-y-10 pb-20">
          <div className="rounded-2xl border border-white/8 bg-zinc-950 p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">نتایج برآورد</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  زیربنای کل {toPersianNumber(result.summary.totalArea)} م² · حالت{' '}
                  {result.mode === 'quick' ? 'سریع' : 'حرفه‌ای'}
                  {result.summary.stage ? ` · ${STAGE_LABELS[result.summary.stage]}` : ''}
                </p>
              </div>
              <Badge variant="gold" size="md">تقریبی · غیر اجرایی</Badge>
            </div>

            {!!result.elements?.length && (
              <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.elements.map((el) => (
                  <div key={el.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="mb-2 text-sm font-bold text-white">{el.label}</div>
                    <div className="text-xs text-zinc-500">بتن: <span className="text-primary">{toPersianNumber(el.concreteM3)}</span> م³</div>
                    <div className="text-xs text-zinc-500">میلگرد: <span className="text-primary">{toPersianNumber(el.rebarKg)}</span> kg</div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-6">
              {groupedMaterials.map(([category, items]) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-bold text-primary">{CATEGORY_LABELS[category] ?? category}</h3>
                  <div className="overflow-x-auto rounded-xl border border-white/8">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead className="bg-white/[0.03] text-zinc-400">
                        <tr>
                          <th className="px-4 py-3 text-right font-medium">مصالح</th>
                          <th className="px-4 py-3 text-right font-medium">مقدار</th>
                          <th className="px-4 py-3 text-right font-medium">واحد</th>
                          <th className="px-4 py-3 text-right font-medium">سهم نسبی</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((m, i) => {
                          const max = Math.max(...result.materials.map((x) => x.quantityRounded), 1)
                          const pct = Math.round((m.quantityRounded / max) * 100)
                          return (
                            <tr key={m.id} className={cn('border-t border-white/6', i % 2 === 0 && 'bg-white/[0.02]')}>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-white">{m.name}</div>
                                {m.note && <div className="mt-0.5 text-[11px] text-zinc-500">{m.note}</div>}
                              </td>
                              <td className="px-4 py-3 font-bold text-primary">{toPersianNumber(m.quantityRounded)}</td>
                              <td className="px-4 py-3 text-zinc-400">{m.unit}</td>
                              <td className="px-4 py-3">
                                <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-6 text-zinc-400">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500" />
              <ul className="space-y-1">
                {result.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/[0.06] p-5">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-white">
                <FileText className="h-4 w-4 text-primary" />
                دریافت گزارش کامل / PDF
              </h3>
              <p className="mb-4 text-xs leading-6 text-zinc-400">
                فقط شماره موبایل ذخیره می‌شود. جزئیات پروژه روی سرور نگه داشته نمی‌شود.
              </p>
              {!phoneUnlocked ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxxx" dir="ltr" leftIcon={<Phone className="h-4 w-4" />} />
                  <Button variant="gold" size="lg" disabled={pending} onClick={unlockReport}>
                    <Download className="ml-2 h-4 w-4" />
                    {pending ? 'در حال ثبت...' : 'ثبت و دانلود گزارش'}
                  </Button>
                </div>
              ) : (
                <Button variant="gold" size="lg" onClick={printReport}>
                  <Download className="ml-2 h-4 w-4" />
                  چاپ / ذخیره PDF دوباره
                </Button>
              )}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div>
              <div className="mb-6">
                <div className="mb-2 text-xs font-semibold tracking-widest text-primary">پیشنهاد هوشمند مشعوف</div>
                <h2 className="text-2xl font-black text-white">محصولات مرتبط با پروژه شما</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((p) => (
                  <Link key={p.id} href={p.href} className="group overflow-hidden rounded-2xl border border-white/8 bg-zinc-950 transition-all hover:border-primary/35">
                    <div className="relative aspect-[4/3] bg-zinc-900">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="33vw" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><Package className="h-10 w-10 text-zinc-700" /></div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-1 text-xs text-zinc-500">{p.categoryName}</div>
                      <h3 className="mb-2 line-clamp-2 text-sm font-bold text-white group-hover:text-primary">{p.name}</h3>
                      <p className="mb-3 flex items-start gap-1.5 text-xs leading-5 text-zinc-400">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        {p.reason}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-white">{formatPrice(p.price)}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-primary">مشاهده <ArrowLeft className="h-3.5 w-3.5" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: [string, string][]
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-primary"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  )
}

function NumberField({
  label, value, onChange, step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <input
        type="number"
        min={0}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-primary"
        dir="ltr"
      />
    </label>
  )
}

function ToggleField({
  label, checked, onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:col-span-2">
      <span className="text-sm text-white">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />
    </label>
  )
}

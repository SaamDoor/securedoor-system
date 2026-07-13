'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm, useFieldArray, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Upload, X, ImageIcon, Loader2, Save, Star,
  Plus, Trash2, Info, Check, ChevronDown, ChevronUp,
  Package, FileText, Search, Share2, Bot, Layers, BarChart3, ListChecks,
} from 'lucide-react'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, slugify } from '@/lib/utils'
import {
  createProductAction,
  updateProductAction,
} from './actions'
import {
  uploadProductImages,
  type AdminProductImageInput, type AdminProductSpecificationInput,
} from '@/lib/api/products'
import { productFormSchema, type ProductFormData } from '@/lib/validations/product'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryOption { id: string; name: string; parent_id?: string | null }
interface FramePriceOption { id: string; frame_type: string; color_name: string; price_3klaf: number }

interface ExistingProduct {
  id: string; name: string; slug: string; sku: string; category_id: string
  brand?: string | null; short_description?: string | null; description: string
  body_content?: string | null; tags?: string[] | string | null
  price: number; compare_price?: number | null; cost_price?: number | null; stock: number
  stock_left?: number; stock_right?: number
  low_stock_threshold?: number; weight?: number | null; width?: number | null
  height?: number | null; depth?: number | null; dimension_unit?: 'cm' | 'mm' | 'm'
  dimension_options?: string[] | null; allow_custom_dimensions?: boolean
  stock_status: ProductFormData['stock_status']
  is_active: boolean; is_featured: boolean; is_new: boolean
  focus_keyword?: string | null; meta_title?: string | null; meta_description?: string | null
  canonical_url?: string | null; robots?: string | null
  og_title?: string | null; og_description?: string | null; og_image_url?: string | null
  faq_pairs?: { question: string; answer: string }[] | null
  ai_summary?: string | null; entity_keywords?: string[] | string | null
  linked_frame_ids?: string[] | null
  images?: { url: string; alt?: string | null; is_primary: boolean; order: number }[]
  specifications?: { label: string; value: string; unit?: string | null; group?: string | null; order: number }[]
}

interface Props {
  product?: ExistingProduct
  categories: CategoryOption[]
  framePrices: FramePriceOption[]
}

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabId = 'basic' | 'content' | 'pricing' | 'specifications' | 'images' | 'seo' | 'aeo' | 'geo' | 'frames'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'basic',   label: 'اطلاعات پایه',   icon: Package },
  { id: 'content', label: 'محتوا',           icon: FileText },
  { id: 'pricing', label: 'قیمت و موجودی',  icon: BarChart3 },
  { id: 'specifications', label: 'مشخصات فنی', icon: ListChecks },
  { id: 'images',  label: 'تصاویر',          icon: ImageIcon },
  { id: 'seo',     label: 'سئو',             icon: Search },
  { id: 'aeo',     label: 'AEO',             icon: Share2 },
  { id: 'geo',     label: 'GEO / AI',        icon: Bot },
  { id: 'frames',  label: 'چهارچوب',         icon: Layers },
]

const STOCK_OPTIONS = [
  { value: 'in_stock',     label: 'موجود' },
  { value: 'out_of_stock', label: 'ناموجود' },
  { value: 'pre_order',    label: 'پیش‌سفارش' },
  { value: 'discontinued', label: 'متوقف‌شده' },
]

const ROBOTS_OPTIONS = [
  { value: '',                           label: 'پیش‌فرض (index, follow)' },
  { value: 'index, follow',              label: 'ایندکس + فالو' },
  { value: 'noindex, follow',            label: 'بدون ایندکس، فالو' },
  { value: 'index, nofollow',            label: 'ایندکس، بدون فالو' },
  { value: 'noindex, nofollow',          label: 'بدون ایندکس، بدون فالو' },
]

// ─── SEO Score Helper ─────────────────────────────────────────────────────────

function SeoScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted w-32 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-muted w-8 text-left">{score}٪</span>
    </div>
  )
}

// ─── Char counter ─────────────────────────────────────────────────────────────

function CharCounter({ value, max, warn }: { value?: string; max: number; warn: number }) {
  const len = (value ?? '').length
  const color = len > max ? 'text-red-400' : len > warn ? 'text-amber-400' : 'text-muted'
  return <span className={`text-xs ${color}`}>{len}/{max}</span>
}

// ─── Hint Box ─────────────────────────────────────────────────────────────────

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 mt-3">
      <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-xs text-blue-400/80 leading-relaxed">{children}</p>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-white">{title}</h2>
        {badge && (
          <span className="px-2 py-0.5 rounded-md bg-gold/10 border border-gold/20 text-gold text-xs font-bold">{badge}</span>
        )}
      </div>
      {children}
    </section>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function ProductForm({ product, categories, framePrices }: Props) {
  const router = useRouter()
  const isEdit = !!product

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7589/ingest/5a232d27-556f-403d-98b2-82415887fe5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8b5927'},body:JSON.stringify({sessionId:'8b5927',runId:'pre-fix',hypothesisId:'H4',location:'product-form.tsx:mount',message:'product form mounted',data:{isEdit,categoryCount:categories.length,framePriceCount:framePrices.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [categories.length, framePrices.length, isEdit])

  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [gallery, setGallery] = useState<AdminProductImageInput[]>(
    (product?.images ?? []).slice().sort((a, b) => a.order - b.order)
      .map((img, idx) => ({ url: img.url, alt: img.alt ?? undefined, isPrimary: img.is_primary, order: idx })),
  )
  const [uploading, setUploading] = useState(false)
  const [linkedFrameIds, setLinkedFrameIds] = useState<string[]>(product?.linked_frame_ids ?? [])
  const [specifications, setSpecifications] = useState<AdminProductSpecificationInput[]>(
    (product?.specifications ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        label: item.label,
        value: item.value,
        unit: item.unit ?? '',
        group: item.group ?? '',
        order: index,
      })),
  )

  const {
    register, handleSubmit, setValue, watch, control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      sku: product?.sku ?? '',
      category_id: product?.category_id ?? '',
      brand: product?.brand ?? '',
      short_description: product?.short_description ?? '',
      description: product?.description ?? '',
      body_content: product?.body_content ?? '',
      tags: Array.isArray(product?.tags) ? product.tags.join('، ') : product?.tags ?? '',
      price: product?.price ?? 0,
      compare_price: product?.compare_price ?? '',
      cost_price: product?.cost_price ?? '',
      stock: product?.stock ?? 0,
      stock_left: product?.stock_left ?? 0,
      stock_right: product?.stock_right ?? product?.stock ?? 0,
      low_stock_threshold: product?.low_stock_threshold ?? 5,
      stock_status: product?.stock_status ?? 'in_stock',
      weight: product?.weight ?? '',
      width: product?.width ?? '',
      height: product?.height ?? '',
      depth: product?.depth ?? '',
      dimension_unit: product?.dimension_unit ?? 'cm',
      dimension_option_1: product?.dimension_options?.[0] ?? '',
      dimension_option_2: product?.dimension_options?.[1] ?? '',
      dimension_option_3: product?.dimension_options?.[2] ?? '',
      allow_custom_dimensions: product?.allow_custom_dimensions ?? false,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      is_new: product?.is_new ?? true,
      focus_keyword: product?.focus_keyword ?? '',
      meta_title: product?.meta_title ?? '',
      meta_description: product?.meta_description ?? '',
      canonical_url: product?.canonical_url ?? '',
      robots: product?.robots ?? '',
      og_title: product?.og_title ?? '',
      og_description: product?.og_description ?? '',
      og_image_url: product?.og_image_url ?? '',
      faq_pairs: product?.faq_pairs ?? [],
      ai_summary: product?.ai_summary ?? '',
      entity_keywords: Array.isArray(product?.entity_keywords)
        ? product.entity_keywords.join('، ')
        : product?.entity_keywords ?? '',
      linked_frame_ids: product?.linked_frame_ids ?? [],
    },
  })

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: 'faq_pairs',
  })

  const watchedValues = watch()

  // Auto slug
  const nameValue = watch('name')
  function handleNameBlur() {
    if (!isEdit && nameValue && !watch('slug')) setValue('slug', slugify(nameValue))
  }

  // Auto-fill meta title from name
  const metaTitleValue = watch('meta_title')
  function handleMetaTitleSuggest() {
    if (!metaTitleValue && nameValue) {
      setValue('meta_title', `${nameValue} | گروه صنعتی مشعوف`)
    }
  }

  function toggleFrame(id: string) {
    setLinkedFrameIds((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      setValue('linked_frame_ids', next)
      return next
    })
  }

  async function handleGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const urls = await uploadProductImages(Array.from(files))
      setGallery((prev) => [
        ...prev,
        ...urls.map((url, i) => ({ url, isPrimary: prev.length === 0 && i === 0, order: prev.length + i })),
      ])
    } catch (err) {
      toast.error('خطا در آپلود تصویر: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeImage(idx: number) {
    setGallery((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      if (!next.some((img) => img.isPrimary) && next.length > 0) next[0] = { ...next[0], isPrimary: true }
      return next
    })
  }

  function setPrimary(idx: number) {
    setGallery((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  function updateImageAlt(idx: number, alt: string) {
    setGallery((prev) => prev.map((image, index) => index === idx ? { ...image, alt } : image))
  }

  function addSpecification() {
    setSpecifications((prev) => [
      ...prev,
      { label: '', value: '', unit: '', group: '', order: prev.length },
    ])
  }

  function updateSpecification(
    index: number,
    key: keyof AdminProductSpecificationInput,
    value: string,
  ) {
    setSpecifications((prev) =>
      prev.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    )
  }

  async function onSubmit(data: ProductFormData) {
    // #region agent log
    fetch('http://127.0.0.1:7589/ingest/5a232d27-556f-403d-98b2-82415887fe5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8b5927'},body:JSON.stringify({sessionId:'8b5927',runId:'pre-fix',hypothesisId:'H3',location:'product-form.tsx:onSubmit',message:'product submit started',data:{isEdit,categoryId:data.category_id,slug:data.slug,price:data.price,categoryCount:categories.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      if (isEdit) {
        const result = await updateProductAction(product!.id, data, gallery, specifications)
        if (!result.ok) throw new Error(result.error)
        toast.success('محصول با موفقیت به‌روزرسانی شد')
      } else {
        const result = await createProductAction(data, gallery, specifications)
        if (!result.ok) throw new Error(result.error)
        toast.success('محصول با موفقیت ثبت شد')
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // #region agent log
      fetch('http://127.0.0.1:7589/ingest/5a232d27-556f-403d-98b2-82415887fe5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8b5927'},body:JSON.stringify({sessionId:'8b5927',runId:'pre-fix',hypothesisId:'H1-H2',location:'product-form.tsx:onSubmit',message:'product submit failed',data:{error:message,errorCode:(err as {code?:string})?.code??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      toast.error(
        err instanceof DOMException && err.name === 'TimeoutError'
          ? 'ارتباط با پایگاه داده بیش از حد طول کشید؛ اتصال اینترنت را بررسی و دوباره تلاش کنید'
          : 'خطا در ذخیره محصول: ' + message,
      )
    }
  }

  function onInvalid(formErrors: FieldErrors<ProductFormData>) {
    // #region agent log
    fetch('http://127.0.0.1:7589/ingest/5a232d27-556f-403d-98b2-82415887fe5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8b5927'},body:JSON.stringify({sessionId:'8b5927',runId:'pre-fix',hypothesisId:'H3',location:'product-form.tsx:onInvalid',message:'product form validation failed',data:{errors:Object.fromEntries(Object.entries(formErrors).map(([k,v])=>[k,(v as {message?:string})?.message??'invalid']))},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (formErrors.name || formErrors.slug || formErrors.sku || formErrors.category_id) {
      setActiveTab('basic')
    } else if (formErrors.description) {
      setActiveTab('content')
    } else if (
      formErrors.price ||
      formErrors.stock_left ||
      formErrors.stock_right ||
      formErrors.low_stock_threshold
    ) {
      setActiveTab('pricing')
    } else if (
      formErrors.meta_title ||
      formErrors.meta_description ||
      formErrors.canonical_url ||
      formErrors.og_image_url
    ) {
      setActiveTab('seo')
    } else if (formErrors.faq_pairs) {
      setActiveTab('aeo')
    }
    toast.error('برخی اطلاعات معتبر یا کامل نیست؛ فیلد مشخص‌شده را اصلاح کنید')
  }

  // SEO score
  const seoScore = Math.round(
    (watchedValues.focus_keyword ? 20 : 0) +
    ((watchedValues.meta_title?.length ?? 0) >= 30 ? 20 : 0) +
    ((watchedValues.meta_description?.length ?? 0) >= 80 ? 20 : 0) +
    ((watchedValues.og_title?.length ?? 0) > 5 ? 20 : 0) +
    (watchedValues.canonical_url ? 20 : 0),
  )
  const aeoScore = Math.round(
    (faqFields.length >= 3 ? 60 : faqFields.length * 20) +
    ((watchedValues.description?.length ?? 0) >= 200 ? 40 : 0),
  )
  const geoScore = Math.round(
    ((watchedValues.ai_summary?.length ?? 0) >= 100 ? 50 : 0) +
    (watchedValues.entity_keywords ? 30 : 0) +
    (faqFields.length >= 2 ? 20 : 0),
  )

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-900 border border-white/8 mb-8 overflow-x-auto hide-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          const hasError =
            (id === 'basic' && (errors.name || errors.slug || errors.sku || errors.category_id)) ||
            (id === 'content' && errors.description) ||
            (id === 'pricing' && errors.price) ||
            (id === 'seo' && (errors.meta_title || errors.meta_description))

          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap',
                isActive ? 'bg-gold text-black' : 'text-muted hover:text-white hover:bg-white/5',
                hasError && !isActive && 'text-red-400',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
              {hasError && !isActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          )
        })}
      </div>

      <div className="space-y-6">
        {/* ══════════════ TAB: BASIC ══════════════ */}
        {activeTab === 'basic' && (
          <>
            <Section title="اطلاعات پایه">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="نام محصول *"
                  placeholder="درب ضد سرقت آرتوس پلاتینیوم"
                  error={errors.name?.message}
                  {...register('name', { onBlur: handleNameBlur })}
                />
                <Input
                  label="اسلاگ URL *"
                  placeholder="درب-ضد-سرقت-سپیدار یا darb-sepidar"
                  error={errors.slug?.message}
                  dir="ltr"
                  hint="اسلاگ فارسی و انگلیسی مجاز است؛ فاصله‌ها را با خط تیره جدا کنید"
                  {...register('slug')}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Input
                  label="کد محصول (SKU) *"
                  placeholder="MSH-1001"
                  dir="ltr"
                  error={errors.sku?.message}
                  {...register('sku')}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted">دسته‌بندی *</label>
                  <select
                    {...register('category_id')}
                    className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="" className="bg-[#181818]">انتخاب دسته‌بندی</option>
                    {categories.map((category) => {
                      const parent = categories.find((item) => item.id === category.parent_id)
                      return (
                        <option key={category.id} value={category.id} className="bg-[#181818]">
                          {parent ? `↳ ${parent.name} / ${category.name}` : `● ${category.name}`}
                        </option>
                      )
                    })}
                  </select>
                  {errors.category_id && <p className="text-xs text-red-400">{errors.category_id.message}</p>}
                </div>
                <Input
                  label="برند / سازنده"
                  placeholder="گروه مشعوف"
                  error={errors.brand?.message}
                  {...register('brand')}
                />
              </div>

              <Textarea
                label="توضیح کوتاه"
                placeholder="خلاصه ویژگی‌های اصلی محصول در ۱-۲ جمله..."
                error={errors.short_description?.message}
                {...register('short_description')}
              />

              <Input
                label="تگ‌ها"
                placeholder="درب ضد سرقت، امنیت، فولاد (با کاما جدا کنید)"
                hint="تگ‌ها با کاما جدا شوند"
                {...register('tags')}
              />

              <div className="flex flex-wrap gap-5 pt-2">
                {[
                  { name: 'is_active', label: 'فعال (نمایش عمومی)', color: 'emerald' },
                  { name: 'is_featured', label: 'محصول ویژه', color: 'gold' },
                  { name: 'is_new', label: 'جدید', color: 'blue' },
                ] .map(({ name, label }) => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-gold w-4 h-4" {...register(name as keyof ProductFormData)} />
                    <span className="text-sm text-muted">{label}</span>
                  </label>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* ══════════════ TAB: CONTENT ══════════════ */}
        {activeTab === 'content' && (
          <Section title="محتوا و توضیحات">
            <Textarea
              label="مشخصات فنی کامل *"
              placeholder="شرح کامل مشخصات فنی: متریال، ابعاد، قفل‌بندی، استانداردها..."
              className="min-h-[160px]"
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted">محتوای کامل صفحه</label>
                <span className="text-xs text-muted">مناسب برای سئو محتوایی</span>
              </div>
              <Textarea
                placeholder={`در این قسمت محتوای جامع صفحه محصول را بنویسید:\n\n## چرا درب ضد سرقت مشعوف؟\n\nمحتوای کامل که شامل راهنمای خرید، مقایسه، نکات نصب و پرسش‌های متداول باشد.\n\nهرچه محتوا جامع‌تر و تخصصی‌تر باشد، رتبه گوگل بهتر خواهد بود.`}
                className="min-h-[280px] font-mono text-sm"
                {...register('body_content')}
              />
              <Hint>
                محتوای کامل صفحه بر رتبه در موتورهای جستجو تأثیر مستقیم دارد. حداقل ۸۰۰ کلمه محتوای تخصصی و منحصربه‌فرد بنویسید.
                از ساختار هدینگ (H2، H3) استفاده کنید و کلمه کلیدی اصلی را در پاراگراف اول ذکر کنید.
              </Hint>
            </div>
          </Section>
        )}

        {/* ══════════════ TAB: PRICING ══════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <Section title="قیمت و موجودی">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                label="قیمت پایه (تومان) *"
                type="number"
                placeholder="28500000"
                error={errors.price?.message}
                {...register('price')}
              />
              <Input
                label="قیمت قبل از تخفیف"
                type="number"
                placeholder="32000000"
                error={errors.compare_price?.message}
                {...register('compare_price')}
              />
              <Input
                label="قیمت تمام‌شده"
                type="number"
                placeholder="اختیاری"
                error={errors.cost_price?.message}
                {...register('cost_price')}
              />
              <Input
                label="موجودی کل (خودکار)"
                type="number"
                readOnly
                value={Number(watch('stock_left') || 0) + Number(watch('stock_right') || 0)}
              />
              <Input
                label="موجودی چپ‌بازشو"
                type="number"
                error={errors.stock_left?.message}
                {...register('stock_left')}
              />
              <Input
                label="موجودی راست‌بازشو"
                type="number"
                error={errors.stock_right?.message}
                {...register('stock_right')}
              />
              <Input
                label="هشدار کمبود موجودی"
                type="number"
                error={errors.low_stock_threshold?.message}
                {...register('low_stock_threshold')}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted">وضعیت موجودی</label>
                <select
                  {...register('stock_status')}
                  className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  {STOCK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#181818]">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            </Section>
            <Section title="وزن و ابعاد محصول">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <Input label="وزن (کیلوگرم)" type="number" step="0.001" {...register('weight')} />
                <Input label="عرض" type="number" step="0.01" {...register('width')} />
                <Input label="ارتفاع" type="number" step="0.01" {...register('height')} />
                <Input label="عمق" type="number" step="0.01" {...register('depth')} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted">واحد ابعاد</label>
                  <select
                    {...register('dimension_unit')}
                    className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-gold focus:outline-none"
                  >
                    <option value="cm" className="bg-[#181818]">سانتی‌متر</option>
                    <option value="mm" className="bg-[#181818]">میلی‌متر</option>
                    <option value="m" className="bg-[#181818]">متر</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="اندازه استاندارد اول"
                  placeholder="مثال: ۱۰۵ × ۲۱۰ سانتی‌متر"
                  {...register('dimension_option_1')}
                />
                <Input
                  label="اندازه استاندارد دوم"
                  placeholder="مثال: ۱۱۰ × ۲۱۰ سانتی‌متر"
                  {...register('dimension_option_2')}
                />
                <Input
                  label="اندازه استاندارد سوم"
                  placeholder="مثال: ۱۱۵ × ۲۱۰ سانتی‌متر"
                  {...register('dimension_option_3')}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-gold" {...register('allow_custom_dimensions')} />
                <span className="text-sm text-muted">امکان سفارش با ابعاد سفارشی</span>
              </label>
            </Section>
          </div>
        )}

        {/* ══════════════ TAB: SPECIFICATIONS ══════════════ */}
        {activeTab === 'specifications' && (
          <Section title="جدول مشخصات فنی">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">ویژگی‌های ساختاریافته‌ای که در صفحه محصول نمایش داده می‌شوند.</p>
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center gap-1.5 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-bold text-gold"
              >
                <Plus className="h-3.5 w-3.5" />
                افزودن مشخصه
              </button>
            </div>
            {specifications.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-white/10 py-10 text-center text-sm text-muted">
                هنوز مشخصه‌ای ثبت نشده است
              </div>
            ) : (
              <div className="space-y-3">
                {specifications.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 sm:grid-cols-[1.2fr_1.5fr_.6fr_1fr_auto]">
                    <Input
                      placeholder="عنوان؛ مثال: جنس ورق"
                      value={item.label}
                      onChange={(event) => updateSpecification(index, 'label', event.target.value)}
                    />
                    <Input
                      placeholder="مقدار؛ مثال: فولاد"
                      value={item.value}
                      onChange={(event) => updateSpecification(index, 'value', event.target.value)}
                    />
                    <Input
                      placeholder="واحد"
                      value={item.unit}
                      onChange={(event) => updateSpecification(index, 'unit', event.target.value)}
                    />
                    <Input
                      placeholder="گروه؛ مثال: ساختار"
                      value={item.group}
                      onChange={(event) => updateSpecification(index, 'group', event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setSpecifications((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                      className="flex h-11 items-center justify-center rounded-xl px-3 text-muted hover:bg-red-500/10 hover:text-red-400"
                      aria-label="حذف مشخصه"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ══════════════ TAB: IMAGES ══════════════ */}
        {activeTab === 'images' && (
          <Section title="تصاویر محصول">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">تصویر اول به‌عنوان تصویر اصلی در لیست محصولات نمایش داده می‌شود.</p>
              <label className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm transition-all',
                uploading ? 'border-gold/40 text-gold opacity-60 cursor-not-allowed' : 'border-white/20 text-muted hover:border-gold hover:text-gold',
              )}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'در حال آپلود...' : 'افزودن تصویر'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryAdd} disabled={uploading} />
              </label>
            </div>

            {gallery.length === 0 ? (
              <div className="text-center py-16 text-muted border-2 border-dashed border-white/15 rounded-xl">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">فایل‌ها را اینجا بکشید یا با دکمه بالا اضافه کنید</p>
                <p className="text-xs mt-1 opacity-60">JPG، PNG، WebP — حداقل ۸۰۰×۸۰۰ پیکسل</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((img, idx) => (
                  <div key={img.url} className="relative group">
                    <div className={cn('relative w-full aspect-square rounded-xl overflow-hidden border', img.isPrimary ? 'border-gold' : 'border-white/10')}>
                      <Image src={img.url} alt={img.alt ?? `image-${idx}`} fill className="object-cover" />
                      {img.isPrimary && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-gold text-black text-[10px] font-bold flex items-center gap-1">
                          <Star className="h-2.5 w-2.5" /> اصلی
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {!img.isPrimary && (
                      <button type="button" onClick={() => setPrimary(idx)} className="w-full mt-1 text-xs text-muted hover:text-gold transition-colors">
                        تنظیم به‌عنوان تصویر اصلی
                      </button>
                    )}
                    <Input
                      value={img.alt ?? ''}
                      onChange={(event) => updateImageAlt(idx, event.target.value)}
                      placeholder="متن جایگزین تصویر"
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ══════════════ TAB: SEO ══════════════ */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            {/* Score panel */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'سئو', score: seoScore, color: 'text-emerald-400' },
                { label: 'AEO', score: aeoScore, color: 'text-blue-400' },
                { label: 'GEO', score: geoScore, color: 'text-purple-400' },
              ].map(({ label, score, color }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900 border border-white/8">
                  <div className={`text-2xl font-black ${color}`}>{score}٪</div>
                  <div className="text-xs text-muted">{label}</div>
                  <div className="w-full h-1.5 rounded-full bg-white/10">
                    <div className={`h-full rounded-full bg-current transition-all ${color}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <Section title="کلمه کلیدی اصلی" badge="Focus Keyword">
              <Input
                label="کلمه کلیدی اصلی"
                placeholder="مثال: درب ضد سرقت"
                hint="این کلمه باید در عنوان، توضیح متا و متن اصلی وجود داشته باشد"
                {...register('focus_keyword')}
              />
              <Hint>
                کلمه کلیدی اصلی مهم‌ترین جمله‌ای است که می‌خواهید در نتایج گوگل برای آن رتبه بگیرید.
                این کلمه باید در عنوان صفحه، اول پاراگراف، آلت تگ تصویر و URL وجود داشته باشد.
              </Hint>
            </Section>

            <Section title="متا تگ‌ها" badge="Search Snippet">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-muted">عنوان متا</label>
                    <div className="flex items-center gap-2">
                      <CharCounter value={watchedValues.meta_title} max={70} warn={60} />
                      <button
                        type="button"
                        onClick={handleMetaTitleSuggest}
                        className="text-xs text-gold hover:text-gold-light transition-colors"
                      >
                        پیشنهاد خودکار
                      </button>
                    </div>
                  </div>
                  <Input
                    placeholder="درب ضد سرقت آرتوس پلاتینیوم | گروه صنعتی مشعوف"
                    error={errors.meta_title?.message}
                    hint="۳۰-۷۰ کاراکتر — این عنوان در نتایج گوگل نمایش داده می‌شود"
                    {...register('meta_title')}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-muted">توضیح متا</label>
                    <CharCounter value={watchedValues.meta_description} max={160} warn={140} />
                  </div>
                  <Textarea
                    placeholder="درب ضد سرقت آرتوس پلاتینیوم با بالاترین کیفیت از گروه صنعتی مشعوف. رنگ کوره‌ای، قفل امنیتی چندنقطه‌ای..."
                    className="min-h-[90px]"
                    error={errors.meta_description?.message}
                    hint="۱۲۰-۱۶۰ کاراکتر — این متن در زیر عنوان در نتایج گوگل نمایش داده می‌شود"
                    {...register('meta_description')}
                  />
                </div>
              </div>

              {/* SERP Preview */}
              {(watchedValues.meta_title || watchedValues.meta_description) && (
                <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/8">
                  <p className="text-xs text-muted mb-3">پیش‌نمایش نتیجه گوگل</p>
                  <div className="space-y-1">
                    <div className="text-xs text-zinc-500" dir="ltr">mashuf.com › products › {watchedValues.slug || 'product-slug'}</div>
                    <div className="text-blue-400 text-base font-medium leading-tight">
                      {watchedValues.meta_title || watchedValues.name || 'عنوان محصول'}
                    </div>
                    <div className="text-zinc-400 text-sm leading-relaxed">
                      {watchedValues.meta_description || watchedValues.short_description || 'توضیحات محصول در اینجا نمایش داده می‌شود...'}
                    </div>
                  </div>
                </div>
              )}
            </Section>

            <Section title="OpenGraph / شبکه‌های اجتماعی" badge="Social">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-muted">عنوان OG</label>
                    <CharCounter value={watchedValues.og_title} max={95} warn={80} />
                  </div>
                  <Input
                    placeholder="عنوان هنگام اشتراک‌گذاری در شبکه‌های اجتماعی"
                    {...register('og_title')}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-muted">توضیح OG</label>
                    <CharCounter value={watchedValues.og_description} max={300} warn={250} />
                  </div>
                  <Textarea
                    placeholder="توضیحی که هنگام اشتراک‌گذاری در اینستاگرام، تلگرام و... نمایش داده می‌شود"
                    className="min-h-[80px]"
                    {...register('og_description')}
                  />
                </div>
                <Input
                  label="URL تصویر OG"
                  placeholder="https://mashuf.com/images/og/product-name.jpg"
                  dir="ltr"
                  hint="ابعاد توصیه‌شده: ۱۲۰۰×۶۳۰ پیکسل"
                  {...register('og_image_url')}
                />
              </div>
            </Section>

            <Section title="تنظیمات پیشرفته" badge="Advanced">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="URL کانونیکال"
                  placeholder="https://mashuf.com/products/product-slug"
                  dir="ltr"
                  hint="اگر این صفحه نسخه اصلی است، خالی بگذارید"
                  {...register('canonical_url')}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted">Robots Meta</label>
                  <select
                    {...register('robots')}
                    className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    {ROBOTS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#181818]">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Hint>
                URL کانونیکال زمانی لازم است که محتوای مشابه در چند URL وجود داشته باشد. برای صفحات منحصربه‌فرد خالی بگذارید.
              </Hint>
            </Section>

            {/* SEO checklist */}
            <Section title="چک‌لیست سئو">
              <div className="space-y-2.5">
                {[
                  { label: 'کلمه کلیدی اصلی تنظیم شده', ok: !!watchedValues.focus_keyword },
                  { label: 'عنوان متا بین ۳۰-۷۰ کاراکتر', ok: (watchedValues.meta_title?.length ?? 0) >= 30 && (watchedValues.meta_title?.length ?? 0) <= 70 },
                  { label: 'توضیح متا بین ۱۲۰-۱۶۰ کاراکتر', ok: (watchedValues.meta_description?.length ?? 0) >= 120 && (watchedValues.meta_description?.length ?? 0) <= 160 },
                  { label: 'اسلاگ URL ساده و انگلیسی', ok: /^[a-z0-9-]+$/.test(watchedValues.slug ?? '') },
                  { label: 'عنوان OG برای اشتراک‌گذاری', ok: (watchedValues.og_title?.length ?? 0) > 5 },
                  { label: 'تصویر OG تنظیم شده', ok: !!watchedValues.og_image_url },
                  { label: 'توضیحات کامل (حداقل ۱۰۰ کاراکتر)', ok: (watchedValues.description?.length ?? 0) >= 100 },
                  { label: 'محتوای صفحه (body content) دارد', ok: (watchedValues.body_content?.length ?? 0) > 50 },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-zinc-600'}`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={`text-sm ${ok ? 'text-white' : 'text-muted line-through'}`}>{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/8 space-y-2">
                <SeoScoreBar score={seoScore} label="امتیاز سئو" />
                <SeoScoreBar score={aeoScore} label="امتیاز AEO" />
                <SeoScoreBar score={geoScore} label="امتیاز GEO/AI" />
              </div>
            </Section>
          </div>
        )}

        {/* ══════════════ TAB: AEO ══════════════ */}
        {activeTab === 'aeo' && (
          <div className="space-y-6">
            <Section title="AEO — بهینه‌سازی موتور پاسخ" badge="Answer Engine">
              <Hint>
                AEO (Answer Engine Optimization) برای رتبه‌گرفتن در Featured Snippets، Google Answers و دستیارهای هوش مصنوعی مثل ChatGPT است.
                پرسش‌وپاسخ‌های زیر به صورت JSON-LD ساختار داده FAQ Schema به صفحه اضافه می‌شوند.
              </Hint>

              {/* FAQ Schema builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">پرسش‌های متداول (FAQ Schema)</label>
                  <button
                    type="button"
                    onClick={() => appendFaq({ question: '', answer: '' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs font-bold hover:bg-gold/20 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    افزودن سوال
                  </button>
                </div>

                {faqFields.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl text-muted text-sm">
                    هنوز سوالی اضافه نشده — حداقل ۳ سوال برای Featured Snippet توصیه می‌شود
                  </div>
                )}

                <div className="space-y-4">
                  {faqFields.map((field, index) => (
                    <div key={field.id} className="rounded-xl border border-white/10 p-4 bg-white/[0.02] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gold">سوال {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="p-1 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Input
                        placeholder="آیا درب ضد سرقت مشعوف گارانتی دارد؟"
                        error={errors.faq_pairs?.[index]?.question?.message}
                        {...register(`faq_pairs.${index}.question`)}
                      />
                      <Textarea
                        placeholder="بله، تمامی درب‌های ضد سرقت گروه مشعوف دارای ۵ سال گارانتی رسمی هستند..."
                        className="min-h-[80px]"
                        error={errors.faq_pairs?.[index]?.answer?.message}
                        {...register(`faq_pairs.${index}.answer`)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {faqFields.length > 0 && (
                <Hint>
                  {faqFields.length} سوال تعریف شده. سوالات به صورت خودکار به صفحه محصول به شکل JSON-LD اضافه می‌شوند
                  و باعث نمایش rich result در نتایج گوگل می‌شوند.
                </Hint>
              )}
            </Section>

            <Section title="نکات AEO">
              <div className="space-y-3 text-sm text-muted leading-relaxed">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">۱</div>
                  <p>سوال‌هایی بنویسید که کاربران واقعاً در گوگل جستجو می‌کنند — از Google Search Console کمک بگیرید</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">۲</div>
                  <p>پاسخ‌ها باید مستقیم، کوتاه (۴۰-۶۰ کلمه) و کامل باشند. از ابهام پرهیز کنید</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">۳</div>
                  <p>حداقل ۳-۵ سوال متداول برای هر صفحه محصول ضروری است</p>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* ══════════════ TAB: GEO ══════════════ */}
        {activeTab === 'geo' && (
          <div className="space-y-6">
            <Section title="GEO — بهینه‌سازی موتور تولید هوش مصنوعی" badge="Generative AI">
              <Hint>
                GEO (Generative Engine Optimization) برای ظاهر شدن در پاسخ‌های ChatGPT، Gemini، Bing Copilot، و سیستم‌های AI دیگر است.
                متن‌های اینجا باید واضح، اطلاعاتی و قابل درک برای هوش مصنوعی باشند.
              </Hint>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-white">خلاصه برای هوش مصنوعی</label>
                    <CharCounter value={watchedValues.ai_summary} max={2000} warn={1500} />
                  </div>
                  <Textarea
                    placeholder={`یک پاراگراف جامع و واضح که به هوش مصنوعی توضیح می‌دهد این محصول چیست:\n\nدرب ضد سرقت آرتوس پلاتینیوم ساخته گروه صنعتی مشعوف، یک درب فولادی ضدسرقت با رده امنیتی کلاس ۴ است که از ورق گالوانیزه ۲ میلیمتری ساخته شده. این درب مجهز به سیستم قفل چندنقطه‌ای ۷ نقطه اروپایی، رنگ کوره‌ای الکترواستاتیک و عایق صوتی ۳۵ دسیبل است. مناسب برای آپارتمان‌ها، ویلاها و ساختمان‌های تجاری در مازندران و سراسر ایران.`}
                    className="min-h-[200px]"
                    {...register('ai_summary')}
                  />
                  <Hint>
                    این متن باید: ۱) به زبان روان و ساده باشد ۲) ویژگی‌های کلیدی را ذکر کند ۳) کاربردها را مشخص کند
                    ۴) اطلاعات قیمت، موجودی و مزیت رقابتی را در بر گیرد ۵) بین ۱۵۰-۵۰۰ کلمه باشد
                  </Hint>
                </div>

                <div>
                  <label className="text-sm font-bold text-white mb-2 block">موجودیت‌های کلیدی (Entity Keywords)</label>
                  <Input
                    placeholder="درب ضد سرقت، فولاد گالوانیزه، گروه مشعوف، مازندران، قائم‌شهر، امنیت درب (با کاما جدا کنید)"
                    hint="موجودیت‌ها مفاهیم، اشخاص، مکان‌ها و برندهایی هستند که به این محصول مرتبط هستند"
                    {...register('entity_keywords')}
                  />
                </div>
              </div>
            </Section>

            <Section title="نکات GEO برای دیده شدن در AI">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'محتوای اتوریتی',
                    desc: 'اطلاعات تخصصی و معتبر بنویسید. AI به محتواهایی اعتماد می‌کند که دقیق، جامع و قابل استناد باشند.',
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/10 border-purple-500/20',
                  },
                  {
                    title: 'زبان طبیعی',
                    desc: 'از جملات کوتاه و واضح استفاده کنید. AI متن‌هایی را ترجیح می‌دهد که گفتگومحور و قابل درک باشند.',
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10 border-blue-500/20',
                  },
                  {
                    title: 'ساختار داده',
                    desc: 'استفاده از Schema.org (FAQ، Product، BreadcrumbList) به AI کمک می‌کند ساختار محتوا را درک کند.',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10 border-emerald-500/20',
                  },
                  {
                    title: 'ذکر برند',
                    desc: 'نام برند، موقعیت جغرافیایی و تخصص را به صراحت ذکر کنید تا AI شما را به‌عنوان منبع معتبر بشناسد.',
                    color: 'text-gold',
                    bg: 'bg-gold/10 border-gold/20',
                  },
                ].map(({ title, desc, color, bg }) => (
                  <div key={title} className={`p-4 rounded-xl border ${bg}`}>
                    <div className={`font-bold text-sm mb-1.5 ${color}`}>{title}</div>
                    <p className="text-xs text-muted leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ══════════════ TAB: FRAMES ══════════════ */}
        {activeTab === 'frames' && (
          <Section title="اتصال به موتور قیمت‌گذاری چهارچوب">
            <p className="text-sm text-muted">
              رنگ/نوع چهارچوب‌هایی که این محصول می‌تواند با آن‌ها سفارش داده شود را انتخاب کنید.
            </p>
            {framePrices.length === 0 ? (
              <p className="text-sm text-muted py-4">هیچ ردیفی در لیست قیمت چهارچوب ثبت نشده است.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {framePrices.map((f) => {
                  const checked = linkedFrameIds.includes(f.id)
                  return (
                    <label
                      key={f.id}
                      className={cn(
                        'flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-sm transition-all',
                        checked ? 'border-gold/50 bg-gold/10 text-white' : 'border-white/10 text-muted hover:border-white/20',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <input type="checkbox" className="accent-gold w-4 h-4" checked={checked} onChange={() => toggleFrame(f.id)} />
                        {f.frame_type === 'french' ? 'فرانسوی' : 'مکزیکی'} — {f.color_name}
                      </span>
                      <span className="text-xs text-muted" dir="ltr">{f.price_3klaf.toLocaleString('fa-IR')}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </Section>
        )}
      </div>

      {/* ── Floating action bar ───────────────────────────────────────────── */}
      <div className="sticky bottom-6 mt-8">
        <div className="flex items-center gap-3 justify-between px-5 py-3 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 text-xs text-muted">
            <div className="flex gap-1">
              {[seoScore, aeoScore, geoScore].map((s, i) => (
                <div
                  key={i}
                  className="h-1.5 w-8 rounded-full"
                  style={{ background: s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444' }}
                />
              ))}
            </div>
            <span>SEO {seoScore}٪ · AEO {aeoScore}٪ · GEO {geoScore}٪</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-4 py-2 rounded-xl border border-white/15 text-muted hover:text-white hover:border-white/30 transition-all text-sm"
            >
              انصراف
            </button>
            <Button type="submit" variant="gold" size="md" loading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
              {isEdit ? 'ذخیره تغییرات' : 'ثبت محصول'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Save, Upload, X, ImageIcon, Loader2, Plus, Trash2,
  Info, Check, FileText, Search, Share2, Bot, Eye, Calendar,
} from 'lucide-react'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AdminScrollTabs } from '@/components/admin/admin-scroll-tabs'
import { saveBlogPostAction } from '../actions'
import { cn, slugify } from '@/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const faqItemSchema = z.object({
  question: z.string().min(5, 'سوال حداقل ۵ کاراکتر'),
  answer:   z.string().min(10, 'پاسخ حداقل ۱۰ کاراکتر'),
})

const blogFormSchema = z.object({
  // پایه
  title:       z.string().min(5, 'عنوان حداقل ۵ کاراکتر باشد').max(300),
  slug:        z.string().min(3, 'اسلاگ حداقل ۳ کاراکتر').regex(/^[a-z0-9-]+$/, 'فقط حروف انگلیسی کوچک، اعداد و خط تیره'),
  excerpt:     z.string().min(20, 'خلاصه حداقل ۲۰ کاراکتر').max(500),
  category:    z.string().min(2, 'دسته‌بندی الزامی است'),
  tags:        z.string().max(500).optional().or(z.literal('')),
  author_name: z.string().max(200).optional().or(z.literal('')),
  author_role: z.string().max(200).optional().or(z.literal('')),
  cover_image: z.string().url('آدرس تصویر کاور باید URL معتبر باشد').optional().or(z.literal('')),
  cover_alt:   z.string().max(300).optional().or(z.literal('')),

  // محتوا
  content:      z.string().min(50, 'محتوا حداقل ۵۰ کاراکتر باشد'),
  reading_time: z.coerce.number().int().min(1).max(120).default(5),

  // انتشار
  status:       z.enum(['draft', 'published', 'scheduled']).default('draft'),
  publish_date: z.string().optional().or(z.literal('')),

  // SEO
  focus_keyword:    z.string().max(200).optional().or(z.literal('')),
  meta_title:       z.string().max(70, 'عنوان متا حداکثر ۷۰ کاراکتر').optional().or(z.literal('')),
  meta_description: z.string().max(160, 'توضیح متا حداکثر ۱۶۰ کاراکتر').optional().or(z.literal('')),
  canonical_url:    z.string().url().optional().or(z.literal('')),
  robots:           z.string().optional().or(z.literal('')),
  og_title:         z.string().max(95).optional().or(z.literal('')),
  og_description:   z.string().max(300).optional().or(z.literal('')),
  og_image_url:     z.string().url().optional().or(z.literal('')),

  // AEO
  faq_pairs: z.array(faqItemSchema).default([]),

  // GEO
  ai_summary:      z.string().max(2000).optional().or(z.literal('')),
  entity_keywords: z.string().max(500).optional().or(z.literal('')),
})

type BlogFormData = z.infer<typeof blogFormSchema>

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ExistingPost {
  id: string
  title: string; slug: string; excerpt: string; category: string; tags?: string | null
  author_name?: string | null; author_role?: string | null
  cover_image?: string | null; cover_alt?: string | null
  content: string; reading_time: number
  status: BlogFormData['status']; publish_date?: string | null
  focus_keyword?: string | null; meta_title?: string | null; meta_description?: string | null
  canonical_url?: string | null; robots?: string | null
  og_title?: string | null; og_description?: string | null; og_image_url?: string | null
  faq_pairs?: { question: string; answer: string }[] | null
  ai_summary?: string | null; entity_keywords?: string | null
}

interface Props { post?: ExistingPost }

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabId = 'basic' | 'content' | 'publish' | 'seo' | 'aeo' | 'geo'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'basic',   label: 'اطلاعات پایه', icon: FileText },
  { id: 'content', label: 'محتوا',         icon: Eye },
  { id: 'publish', label: 'انتشار',        icon: Calendar },
  { id: 'seo',     label: 'سئو',           icon: Search },
  { id: 'aeo',     label: 'AEO',           icon: Share2 },
  { id: 'geo',     label: 'GEO / AI',      icon: Bot },
]

const BLOG_CATEGORIES = [
  'راهنمای خرید', 'معرفی محصول', 'نکات نصب', 'امنیت خانه',
  'اخبار شرکت', 'مقالات تخصصی', 'پروژه‌های ما',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CharCounter({ value, max, warn }: { value?: string; max: number; warn: number }) {
  const len = (value ?? '').length
  const color = len > max ? 'text-red-400' : len > warn ? 'text-amber-400' : 'text-muted'
  return <span className={`text-xs ${color}`}>{len}/{max}</span>
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 mt-3">
      <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-xs text-blue-400/80 leading-relaxed">{children}</p>
    </div>
  )
}

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

// ─── Mock save functions (replace with real API calls) ────────────────────────

async function saveBlogPost(data: BlogFormData, isEdit: boolean, postId?: string): Promise<void> {
  const payload = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    cover_image: data.cover_image || null,
    status: data.status,
    reading_time: data.reading_time,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    meta_keywords: data.tags ? data.tags.split(/[,،]/).map((t) => t.trim()).filter(Boolean) : [],
    published_at: data.status === 'published' ? (data.publish_date || new Date().toISOString()) : null,
    is_featured: false,
  }
  const result = await saveBlogPostAction(payload, isEdit ? postId : undefined)
  if (!result.ok) throw new Error(result.error)
}

async function uploadCoverImage(file: File): Promise<string> {
  // TODO: replace with real Supabase storage upload
  await new Promise((r) => setTimeout(r, 600))
  return URL.createObjectURL(file)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BlogForm({ post }: Props) {
  const router = useRouter()
  const isEdit = !!post
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [coverPreview, setCoverPreview] = useState<string>(post?.cover_image ?? '')
  const [uploadingCover, setUploadingCover] = useState(false)

  const {
    register, handleSubmit, setValue, watch, control,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title:        post?.title ?? '',
      slug:         post?.slug ?? '',
      excerpt:      post?.excerpt ?? '',
      category:     post?.category ?? '',
      tags:         post?.tags ?? '',
      author_name:  post?.author_name ?? 'تیم گروه مشعوف',
      author_role:  post?.author_role ?? 'کارشناس فنی',
      cover_image:  post?.cover_image ?? '',
      cover_alt:    post?.cover_alt ?? '',
      content:      post?.content ?? '',
      reading_time: post?.reading_time ?? 5,
      status:       post?.status ?? 'draft',
      publish_date: post?.publish_date ?? '',
      focus_keyword:    post?.focus_keyword ?? '',
      meta_title:       post?.meta_title ?? '',
      meta_description: post?.meta_description ?? '',
      canonical_url:    post?.canonical_url ?? '',
      robots:           post?.robots ?? '',
      og_title:         post?.og_title ?? '',
      og_description:   post?.og_description ?? '',
      og_image_url:     post?.og_image_url ?? '',
      faq_pairs:        post?.faq_pairs ?? [],
      ai_summary:       post?.ai_summary ?? '',
      entity_keywords:  post?.entity_keywords ?? '',
    },
  })

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control, name: 'faq_pairs' })
  const watchedValues = watch()

  const titleValue = watch('title')
  function handleTitleBlur() {
    if (!isEdit && titleValue && !watch('slug')) setValue('slug', slugify(titleValue))
    if (!watch('meta_title') && titleValue) setValue('meta_title', `${titleValue} | گروه صنعتی مشعوف`)
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const url = await uploadCoverImage(file)
      setCoverPreview(url)
      setValue('cover_image', url)
    } catch {
      toast.error('خطا در آپلود تصویر کاور')
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  async function onSubmit(data: BlogFormData) {
    try {
      await saveBlogPost(data, isEdit, post?.id)
      toast.success(isEdit ? 'مطلب با موفقیت به‌روزرسانی شد' : 'مطلب با موفقیت ثبت شد')
      router.push('/admin/blog')
      router.refresh()
    } catch (err) {
      toast.error('خطا در ذخیره مطلب: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const seoScore = Math.round(
    (watchedValues.focus_keyword ? 15 : 0) +
    ((watchedValues.meta_title?.length ?? 0) >= 30 ? 20 : 0) +
    ((watchedValues.meta_description?.length ?? 0) >= 80 ? 20 : 0) +
    (watchedValues.cover_image ? 15 : 0) +
    ((watchedValues.og_title?.length ?? 0) > 5 ? 15 : 0) +
    (watchedValues.canonical_url ? 15 : 0),
  )

  const aeoScore = Math.round(
    (faqFields.length >= 3 ? 60 : faqFields.length * 20) +
    ((watchedValues.content?.length ?? 0) >= 500 ? 40 : 0),
  )

  const geoScore = Math.round(
    ((watchedValues.ai_summary?.length ?? 0) >= 100 ? 50 : 0) +
    (watchedValues.entity_keywords ? 30 : 0) +
    (faqFields.length >= 2 ? 20 : 0),
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Tab bar */}
      <AdminScrollTabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
        tabs={TABS.map(({ id, label, icon }) => ({
          id,
          label,
          icon,
          hasError: Boolean(
            (id === 'basic' && (errors.title || errors.slug || errors.category)) ||
            (id === 'content' && errors.content) ||
            (id === 'seo' && (errors.meta_title || errors.meta_description)),
          ),
        }))}
      />

      <div className="space-y-6">

        {/* ══ TAB: BASIC ══ */}
        {activeTab === 'basic' && (
          <>
            <Section title="اطلاعات پایه مطلب">
              <Input
                label="عنوان مطلب *"
                placeholder="راهنمای جامع انتخاب درب ضد سرقت مناسب"
                error={errors.title?.message}
                {...register('title', { onBlur: handleTitleBlur })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="اسلاگ URL *"
                  placeholder="guide-choose-security-door"
                  dir="ltr"
                  error={errors.slug?.message}
                  hint="فقط حروف انگلیسی کوچک، اعداد و خط تیره"
                  {...register('slug')}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted">دسته‌بندی *</label>
                  <select
                    {...register('category')}
                    className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="" className="bg-[#181818]">انتخاب دسته‌بندی</option>
                    {BLOG_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#181818]">{c}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-muted">خلاصه مطلب *</label>
                  <CharCounter value={watchedValues.excerpt} max={500} warn={400} />
                </div>
                <Textarea
                  placeholder="در این مقاله با معیارهای مهم انتخاب درب ضد سرقت مناسب آشنا می‌شوید..."
                  error={errors.excerpt?.message}
                  {...register('excerpt')}
                />
              </div>

              <Input
                label="تگ‌ها"
                placeholder="درب ضد سرقت، امنیت، راهنمای خرید (با کاما جدا کنید)"
                {...register('tags')}
              />
            </Section>

            <Section title="نویسنده">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="نام نویسنده"
                  placeholder="تیم گروه مشعوف"
                  {...register('author_name')}
                />
                <Input
                  label="سمت نویسنده"
                  placeholder="کارشناس فنی"
                  {...register('author_role')}
                />
              </div>
            </Section>

            <Section title="تصویر کاور">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <label className={cn(
                    'flex flex-col items-center justify-center gap-3 h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                    uploadingCover ? 'border-gold/40 opacity-60' : 'border-white/15 hover:border-gold/40 hover:bg-gold/5',
                  )}>
                    {uploadingCover ? (
                      <Loader2 className="h-8 w-8 text-gold animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted" />
                        <div className="text-center">
                          <p className="text-sm text-muted">آپلود تصویر کاور</p>
                          <p className="text-xs text-muted/60 mt-1">JPG، PNG، WebP — ۱۲۰۰×۶۳۰ توصیه‌شده</p>
                        </div>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                  </label>
                  <Input
                    label="یا آدرس URL تصویر"
                    placeholder="https://..."
                    dir="ltr"
                    {...register('cover_image')}
                  />
                </div>

                <div className="space-y-3">
                  {coverPreview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                      <Image src={coverPreview} alt="پیش‌نمایش کاور" fill className="object-cover" onError={() => setCoverPreview('')} />
                      <button
                        type="button"
                        onClick={() => { setCoverPreview(''); setValue('cover_image', '') }}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-zinc-900 border border-white/8 flex items-center justify-center text-muted">
                      <ImageIcon className="h-10 w-10 opacity-30" />
                    </div>
                  )}
                  <Input
                    label="متن Alt تصویر"
                    placeholder="درب ضد سرقت آرتوس پلاتینیوم"
                    hint="برای سئو و دسترسی‌پذیری مهم است"
                    {...register('cover_alt')}
                  />
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ══ TAB: CONTENT ══ */}
        {activeTab === 'content' && (
          <Section title="محتوای مطلب">
            <Hint>
              محتوا را به فرمت Markdown بنویسید. از هدینگ‌ها (## و ###) استفاده کنید.
              حداقل ۸۰۰ کلمه برای رتبه مناسب در گوگل توصیه می‌شود.
              کلمه کلیدی اصلی را در اول مطلب، هدینگ‌ها و به طور طبیعی در متن ذکر کنید.
            </Hint>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">متن کامل مطلب *</label>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>{watchedValues.content?.trim().split(/\s+/).filter(Boolean).length ?? 0} کلمه</span>
                  <span>{(watchedValues.content?.length ?? 0)} کاراکتر</span>
                </div>
              </div>
              <Textarea
                placeholder={`## چرا انتخاب درب ضد سرقت مناسب مهم است؟\n\nدرب ورودی اولین خط دفاعی خانه شماست...\n\n## معیارهای اصلی انتخاب\n\n### ۱. درجه امنیتی\n\n...`}
                className="min-h-[500px] font-mono text-sm"
                error={errors.content?.message}
                {...register('content')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="زمان مطالعه (دقیقه)"
                type="number"
                placeholder="8"
                hint="به طور معمول هر ۲۰۰ کلمه = ۱ دقیقه"
                error={errors.reading_time?.message}
                {...register('reading_time')}
              />
            </div>
          </Section>
        )}

        {/* ══ TAB: PUBLISH ══ */}
        {activeTab === 'publish' && (
          <Section title="تنظیمات انتشار">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted">وضعیت انتشار</label>
                <select
                  {...register('status')}
                  className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  <option value="draft" className="bg-[#181818]">پیش‌نویس</option>
                  <option value="published" className="bg-[#181818]">منتشرشده</option>
                  <option value="scheduled" className="bg-[#181818]">زمان‌بندی‌شده</option>
                </select>
              </div>
              {watchedValues.status === 'scheduled' && (
                <Input
                  label="تاریخ انتشار"
                  type="datetime-local"
                  dir="ltr"
                  {...register('publish_date')}
                />
              )}
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-white/8">
              <h3 className="text-sm font-bold text-white mb-3">چک‌لیست قبل از انتشار</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'عنوان تنظیم شده', ok: (watchedValues.title?.length ?? 0) >= 10 },
                  { label: 'اسلاگ URL معتبر', ok: /^[a-z0-9-]+$/.test(watchedValues.slug ?? '') && (watchedValues.slug?.length ?? 0) > 3 },
                  { label: 'دسته‌بندی انتخاب شده', ok: !!watchedValues.category },
                  { label: 'خلاصه کامل (۱۰۰+ کاراکتر)', ok: (watchedValues.excerpt?.length ?? 0) >= 100 },
                  { label: 'محتوا کامل (۳۰۰+ کلمه)', ok: (watchedValues.content?.trim().split(/\s+/).filter(Boolean).length ?? 0) >= 300 },
                  { label: 'تصویر کاور آپلود شده', ok: !!watchedValues.cover_image },
                  { label: 'عنوان متا سئو تنظیم شده', ok: (watchedValues.meta_title?.length ?? 0) >= 20 },
                  { label: 'توضیح متا تنظیم شده', ok: (watchedValues.meta_description?.length ?? 0) >= 60 },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-zinc-600'}`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={`text-sm ${ok ? 'text-white' : 'text-muted'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ══ TAB: SEO ══ */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            {/* Score */}
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

            <Section title="کلمه کلیدی اصلی">
              <Input
                label="کلمه کلیدی اصلی (Focus Keyword)"
                placeholder="درب ضد سرقت"
                hint="این کلمه باید در عنوان، خلاصه، اول متن و آلت تصویر وجود داشته باشد"
                {...register('focus_keyword')}
              />
            </Section>

            <Section title="متا تگ‌ها">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-muted">عنوان متا</label>
                  <CharCounter value={watchedValues.meta_title} max={70} warn={60} />
                </div>
                <Input
                  placeholder="راهنمای خرید درب ضد سرقت | گروه صنعتی مشعوف"
                  error={errors.meta_title?.message}
                  hint="۳۰-۷۰ کاراکتر"
                  {...register('meta_title')}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-muted">توضیح متا</label>
                  <CharCounter value={watchedValues.meta_description} max={160} warn={140} />
                </div>
                <Textarea
                  placeholder="در این راهنما با معیارهای مهم در انتخاب درب ضد سرقت مناسب آشنا می‌شوید..."
                  className="min-h-[80px]"
                  error={errors.meta_description?.message}
                  hint="۱۲۰-۱۶۰ کاراکتر"
                  {...register('meta_description')}
                />
              </div>

              {(watchedValues.meta_title || watchedValues.meta_description) && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                  <p className="text-xs text-muted mb-3">پیش‌نمایش نتیجه گوگل</p>
                  <div className="space-y-1">
                    <div className="text-xs text-zinc-500" dir="ltr">mashuf.com › blog › {watchedValues.slug || 'blog-slug'}</div>
                    <div className="text-blue-400 text-base font-medium leading-tight">{watchedValues.meta_title || watchedValues.title}</div>
                    <div className="text-zinc-400 text-sm leading-relaxed">{watchedValues.meta_description || watchedValues.excerpt}</div>
                  </div>
                </div>
              )}
            </Section>

            <Section title="OpenGraph / شبکه‌های اجتماعی">
              <Input
                label="عنوان OG"
                placeholder="عنوان هنگام اشتراک‌گذاری"
                {...register('og_title')}
              />
              <Textarea
                label="توضیح OG"
                placeholder="توضیحی که در پیش‌نمایش لینک نمایش داده می‌شود"
                className="min-h-[80px]"
                {...register('og_description')}
              />
              <Input
                label="URL تصویر OG"
                placeholder="https://mashuf.com/images/og/..."
                dir="ltr"
                hint="اگر خالی باشد از تصویر کاور استفاده می‌شود"
                {...register('og_image_url')}
              />
            </Section>

            <Section title="پیشرفته">
              <Input
                label="URL کانونیکال"
                placeholder="https://mashuf.com/blog/post-slug"
                dir="ltr"
                {...register('canonical_url')}
              />
            </Section>
          </div>
        )}

        {/* ══ TAB: AEO ══ */}
        {activeTab === 'aeo' && (
          <Section title="AEO — پرسش‌های متداول" badge="FAQ Schema">
            <Hint>
              پرسش‌وپاسخ‌های زیر به صورت JSON-LD FAQ Schema در صفحه مطلب اضافه می‌شوند
              و باعث نمایش rich result در نتایج گوگل می‌شوند.
            </Hint>

            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white">سوالات متداول</label>
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
                هنوز سوالی اضافه نشده
              </div>
            )}

            {faqFields.map((field, index) => (
              <div key={field.id} className="rounded-xl border border-white/10 p-4 bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold">سوال {index + 1}</span>
                  <button type="button" onClick={() => removeFaq(index)} className="p-1 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Input placeholder="سوال را اینجا بنویسید..." error={errors.faq_pairs?.[index]?.question?.message} {...register(`faq_pairs.${index}.question`)} />
                <Textarea placeholder="پاسخ را اینجا بنویسید..." className="min-h-[80px]" error={errors.faq_pairs?.[index]?.answer?.message} {...register(`faq_pairs.${index}.answer`)} />
              </div>
            ))}
          </Section>
        )}

        {/* ══ TAB: GEO ══ */}
        {activeTab === 'geo' && (
          <div className="space-y-6">
            <Section title="GEO — بهینه‌سازی برای AI" badge="Generative AI">
              <Hint>
                این محتوا برای ظاهر شدن در پاسخ‌های ChatGPT، Gemini، Copilot و سایر AI ها طراحی می‌شود.
              </Hint>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-white">خلاصه برای هوش مصنوعی</label>
                  <CharCounter value={watchedValues.ai_summary} max={2000} warn={1500} />
                </div>
                <Textarea
                  placeholder="یک پاراگراف جامع که به AI توضیح می‌دهد این مطلب درباره چیست و چه اطلاعاتی ارائه می‌دهد..."
                  className="min-h-[200px]"
                  {...register('ai_summary')}
                />
              </div>
              <Input
                label="موجودیت‌های کلیدی"
                placeholder="درب ضد سرقت، گروه مشعوف، مازندران، امنیت، فولاد گالوانیزه (با کاما)"
                hint="مفاهیم، برندها و مکان‌های مرتبط با مطلب"
                {...register('entity_keywords')}
              />
            </Section>
          </div>
        )}
      </div>

      {/* Floating action bar */}
      <div className="sticky bottom-6 mt-8">
        <div className="flex items-center gap-3 justify-between px-5 py-3 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 text-xs text-muted">
            <div className="flex gap-1">
              {[seoScore, aeoScore, geoScore].map((s, i) => (
                <div key={i} className="h-1.5 w-8 rounded-full" style={{ background: s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444' }} />
              ))}
            </div>
            <span>SEO {seoScore}٪ · AEO {aeoScore}٪ · GEO {geoScore}٪</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push('/admin/blog')} className="px-4 py-2 rounded-xl border border-white/15 text-muted hover:text-white hover:border-white/30 transition-all text-sm">
              انصراف
            </button>
            <Button type="submit" variant="gold" size="md" loading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
              {isEdit ? 'ذخیره تغییرات' : watchedValues.status === 'published' ? 'انتشار مطلب' : 'ذخیره پیش‌نویس'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

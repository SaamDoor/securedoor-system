'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, X, Upload, ImageIcon, Loader2, Save } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ConstructionProject } from '@/types'

// ── Zod schema ──────────────────────────────────────────────
const projectSchema = z.object({
  title: z.string().min(3, 'عنوان حداقل ۳ کاراکتر باشد'),
  slug: z.string()
    .min(3, 'اسلاگ حداقل ۳ کاراکتر باشد')
    .regex(/^[a-z0-9-]+$/, 'اسلاگ فقط حروف انگلیسی کوچک، اعداد و خط تیره'),
  short_description: z.string().optional(),
  description: z.string().optional(),
  architecture_description: z.string().optional(),
  location: z.string().optional(),
  area: z.coerce.number().positive().optional().or(z.literal('')),
  floors: z.coerce.number().int().positive().optional().or(z.literal('')),
  units: z.coerce.number().int().positive().optional().or(z.literal('')),
  bedrooms: z.coerce.number().int().min(0).optional().or(z.literal('')),
  price_from: z.coerce.number().int().positive().optional().or(z.literal('')),
  price_to: z.coerce.number().int().positive().optional().or(z.literal('')),
  completion_year: z.coerce.number().int().min(1400).max(1420).optional().or(z.literal('')),
  status: z.enum(['for_sale', 'pre_sale', 'delivered']),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  amenities: z.array(z.object({ icon: z.string(), label: z.string() })),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface Props {
  project?: ConstructionProject
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProjectForm({ project }: Props) {
  const router = useRouter()
  const isEdit = !!project

  const [thumbnail, setThumbnail] = useState<string>(project?.thumbnail_url ?? '')
  const [gallery, setGallery] = useState<{ url: string; caption: string; order: number }[]>(
    (project?.gallery ?? []).map((item) => ({ ...item, caption: item.caption ?? '' }))
  )
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? '',
      slug: project?.slug ?? '',
      short_description: project?.short_description ?? '',
      description: project?.description ?? '',
      architecture_description: project?.architecture_description ?? '',
      location: project?.location ?? '',
      area: project?.area ?? '',
      floors: project?.floors ?? '',
      units: project?.units ?? '',
      bedrooms: project?.bedrooms ?? '',
      price_from: project?.price_from ?? '',
      price_to: project?.price_to ?? '',
      completion_year: project?.completion_year ?? '',
      status: project?.status ?? 'for_sale',
      is_featured: project?.is_featured ?? false,
      is_active: project?.is_active ?? true,
      seo_title: project?.seo_title ?? '',
      seo_description: project?.seo_description ?? '',
      amenities: project?.amenities ?? [],
      specifications: project?.specifications ?? [],
    },
  })

  const { fields: amenityFields, append: appendAmenity, remove: removeAmenity } = useFieldArray({ control, name: 'amenities' })
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: 'specifications' })

  // Auto-generate slug from title
  const titleValue = watch('title')
  function handleTitleBlur() {
    if (!isEdit && titleValue && !watch('slug')) {
      setValue('slug', slugify(titleValue))
    }
  }

  // ── Image uploads ──────────────────────────────────────────
  async function uploadImage(file: File, folder: string): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage.from('projects').upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    })
    if (error) { toast.error('خطا در آپلود: ' + error.message); return null }

    const { data } = supabase.storage.from('projects').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingThumb(true)
    const url = await uploadImage(file, 'thumbnails')
    if (url) setThumbnail(url)
    setUploadingThumb(false)
  }

  async function handleGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploadingGallery(true)
    const uploads = await Promise.all(
      Array.from(files).map((f) => uploadImage(f, 'gallery'))
    )
    const newItems = uploads
      .filter((u): u is string => u !== null)
      .map((url, i) => ({ url, caption: '', order: gallery.length + i }))
    setGallery((prev) => [...prev, ...newItems])
    setUploadingGallery(false)
  }

  // ── Submit ──────────────────────────────────────────────────
  async function onSubmit(data: ProjectFormData) {
    const supabase = createClient()
    const payload = {
      ...data,
      area: data.area === '' ? null : Number(data.area),
      floors: data.floors === '' ? null : Number(data.floors),
      units: data.units === '' ? null : Number(data.units),
      bedrooms: data.bedrooms === '' ? null : Number(data.bedrooms),
      price_from: data.price_from === '' ? null : Number(data.price_from),
      price_to: data.price_to === '' ? null : Number(data.price_to),
      completion_year: data.completion_year === '' ? null : Number(data.completion_year),
      thumbnail_url: thumbnail || null,
      gallery,
    }

    if (isEdit) {
      const { error } = await supabase
        .from('construction_projects')
        .update(payload)
        .eq('id', project!.id)
      if (error) { toast.error('خطا در ذخیره: ' + error.message); return }
      toast.success('پروژه با موفقیت به‌روزرسانی شد')
    } else {
      const { error } = await supabase.from('construction_projects').insert(payload)
      if (error) { toast.error('خطا در ثبت: ' + error.message); return }
      toast.success('پروژه با موفقیت ثبت شد')
    }
    router.push('/admin/projects')
    router.refresh()
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── Basic Info ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-white">اطلاعات پایه</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="عنوان پروژه *"
            placeholder="مثال: برج مسکونی نور"
            error={errors.title?.message}
            {...register('title', { onBlur: handleTitleBlur })}
          />
          <Input
            label="اسلاگ (URL) *"
            placeholder="borj-noor"
            error={errors.slug?.message}
            dir="ltr"
            hint="فقط حروف انگلیسی، اعداد و خط تیره"
            {...register('slug')}
          />
        </div>

        <Textarea
          label="خلاصه (نمایش در کارت)"
          placeholder="توضیح کوتاه برای کارت پروژه..."
          error={errors.short_description?.message}
          {...register('short_description')}
        />
        <Textarea
          label="توضیحات کامل"
          placeholder="شرح کامل پروژه..."
          className="min-h-[150px]"
          error={errors.description?.message}
          {...register('description')}
        />
        <Textarea
          label="توضیحات معماری"
          placeholder="سبک معماری، الهامات طراحی، مواد به‌کاررفته..."
          className="min-h-[120px]"
          error={errors.architecture_description?.message}
          {...register('architecture_description')}
        />
      </section>

      {/* ── Details ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-white">مشخصات فنی</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Input label="موقعیت / شهر" placeholder="تهران، الهیه" {...register('location')} />
          <Input label="متراژ (م²)" type="number" placeholder="185" error={errors.area?.message} {...register('area')} />
          <Input label="تعداد طبقات" type="number" placeholder="18" error={errors.floors?.message} {...register('floors')} />
          <Input label="تعداد واحدها" type="number" placeholder="72" error={errors.units?.message} {...register('units')} />
          <Input label="اتاق خواب" type="number" placeholder="3" error={errors.bedrooms?.message} {...register('bedrooms')} />
          <Input label="سال تحویل (شمسی)" type="number" placeholder="1404" error={errors.completion_year?.message} {...register('completion_year')} />
          <Input label="قیمت از (تومان)" type="number" placeholder="25000000000" error={errors.price_from?.message} {...register('price_from')} />
          <Input label="قیمت تا (تومان)" type="number" placeholder="38000000000" error={errors.price_to?.message} {...register('price_to')} />
        </div>

        {/* Status & flags */}
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">وضعیت فروش</label>
            <select
              {...register('status')}
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              <option value="for_sale">برای فروش</option>
              <option value="pre_sale">پیش‌فروش</option>
              <option value="delivered">تحویل‌شده</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-6">
            <input type="checkbox" className="accent-gold w-4 h-4" {...register('is_featured')} />
            <span className="text-sm text-muted">پروژه ویژه</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-6">
            <input type="checkbox" className="accent-gold w-4 h-4" {...register('is_active')} />
            <span className="text-sm text-muted">فعال (نمایش عمومی)</span>
          </label>
        </div>
      </section>

      {/* ── Thumbnail ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">تصویر شاخص</h2>
        <div className="flex items-start gap-6">
          {thumbnail ? (
            <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
              <Image src={thumbnail} alt="thumbnail" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setThumbnail('')}
                className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-48 h-32 rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center text-muted flex-shrink-0">
              <ImageIcon className="h-8 w-8 mb-2 opacity-40" />
              <span className="text-xs">بدون تصویر</span>
            </div>
          )}
          <div className="space-y-2">
            <label className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm transition-all',
              uploadingThumb
                ? 'border-gold/40 text-gold opacity-60 cursor-not-allowed'
                : 'border-white/20 text-muted hover:border-gold hover:text-gold',
            )}>
              {uploadingThumb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploadingThumb ? 'در حال آپلود...' : 'انتخاب تصویر'}
              <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} disabled={uploadingThumb} />
            </label>
            <p className="text-xs text-muted">فرمت WebP / JPG / PNG — حداکثر ۵ مگابایت — ابعاد ۱۲۰۰×۸۰۰</p>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">گالری تصاویر</h2>
          <label className={cn(
            'inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm transition-all',
            uploadingGallery
              ? 'border-gold/40 text-gold opacity-60 cursor-not-allowed'
              : 'border-white/20 text-muted hover:border-gold hover:text-gold',
          )}>
            {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {uploadingGallery ? 'آپلود...' : 'افزودن تصویر'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryAdd} disabled={uploadingGallery} />
          </label>
        </div>

        {gallery.length === 0 ? (
          <div className="text-center py-10 text-muted border-2 border-dashed border-white/8 rounded-xl">
            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">هنوز تصویری اضافه نشده</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gallery.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                  <Image src={item.url} alt={item.caption || `gallery-${idx}`} fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setGallery((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <input
                  type="text"
                  placeholder="کپشن..."
                  value={item.caption}
                  onChange={(e) => setGallery((prev) => prev.map((g, i) => i === idx ? { ...g, caption: e.target.value } : g))}
                  className="w-full mt-1 px-2 py-1 text-xs rounded-lg bg-white/5 border border-white/8 text-white placeholder:text-muted focus:outline-none focus:border-gold"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Amenities ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">امکانات</h2>
          <button
            type="button"
            onClick={() => appendAmenity({ icon: '', label: '' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gold border border-gold/30 rounded-xl hover:bg-gold/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            افزودن
          </button>
        </div>
        <div className="space-y-2">
          {amenityFields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-3">
              <Input placeholder="آیکون (pool, gym ...)" dir="ltr" className="w-32 flex-shrink-0" {...register(`amenities.${idx}.icon`)} />
              <Input placeholder="برچسب امکانات (فارسی)" {...register(`amenities.${idx}.label`)} />
              <button type="button" onClick={() => removeAmenity(idx)} className="p-2 text-muted hover:text-red-400 flex-shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {amenityFields.length === 0 && <p className="text-sm text-muted">امکانات وجود ندارد. افزودن کنید.</p>}
        </div>
      </section>

      {/* ── Specifications ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">مشخصات (جدول)</h2>
          <button
            type="button"
            onClick={() => appendSpec({ label: '', value: '' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gold border border-gold/30 rounded-xl hover:bg-gold/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            افزودن
          </button>
        </div>
        <div className="space-y-2">
          {specFields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-3">
              <Input placeholder="برچسب (مثال: متراژ)" {...register(`specifications.${idx}.label`)} />
              <Input placeholder="مقدار (مثال: ۱۸۵ متر)" {...register(`specifications.${idx}.value`)} />
              <button type="button" onClick={() => removeSpec(idx)} className="p-2 text-muted hover:text-red-400 flex-shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {specFields.length === 0 && <p className="text-sm text-muted">مشخصاتی ثبت نشده.</p>}
        </div>
      </section>

      {/* ── SEO ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">سئو</h2>
        <Input label="عنوان سئو" placeholder="عنوان برای موتورهای جستجو" {...register('seo_title')} />
        <Textarea label="توضیحات متا" placeholder="توضیحات برای موتورهای جستجو (۱۵۵ کاراکتر)" {...register('seo_description')} />
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4 justify-end pb-8">
        <button
          type="button"
          onClick={() => router.push('/admin/projects')}
          className="px-6 py-2.5 rounded-xl border border-white/15 text-muted hover:text-white hover:border-white/30 transition-all text-sm"
        >
          انصراف
        </button>
        <Button type="submit" variant="gold" size="md" loading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
          {isEdit ? 'ذخیره تغییرات' : 'ثبت پروژه'}
        </Button>
      </div>
    </form>
  )
}

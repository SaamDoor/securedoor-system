'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Upload, X, ImageIcon, Loader2, Save, Star } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, slugify } from '@/lib/utils'
import {
  createProduct,
  updateProduct,
  uploadProductImages,
  type AdminProductImageInput,
} from '@/lib/api/products'
import { productFormSchema, type ProductFormData } from '@/lib/validations/product'

interface CategoryOption {
  id: string
  name: string
}

interface FramePriceOption {
  id: string
  frame_type: string
  color_name: string
  price_3klaf: number
}

interface ExistingProduct {
  id: string
  name: string
  slug: string
  sku: string
  category_id: string
  short_description?: string | null
  description: string
  price: number
  compare_price?: number | null
  stock: number
  stock_status: ProductFormData['stock_status']
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  meta_title?: string | null
  meta_description?: string | null
  linked_frame_ids?: string[] | null
  images?: { url: string; alt?: string | null; is_primary: boolean; order: number }[]
}

interface Props {
  product?: ExistingProduct
  categories: CategoryOption[]
  framePrices: FramePriceOption[]
}

const STOCK_STATUS_OPTIONS: { value: ProductFormData['stock_status']; label: string }[] = [
  { value: 'in_stock', label: 'موجود' },
  { value: 'out_of_stock', label: 'ناموجود' },
  { value: 'pre_order', label: 'پیش‌سفارش' },
  { value: 'discontinued', label: 'متوقف‌شده' },
]

export function ProductForm({ product, categories, framePrices }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [gallery, setGallery] = useState<AdminProductImageInput[]>(
    (product?.images ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img, idx) => ({
        url: img.url,
        alt: img.alt ?? undefined,
        isPrimary: img.is_primary,
        order: idx,
      })),
  )
  const [uploading, setUploading] = useState(false)
  const [linkedFrameIds, setLinkedFrameIds] = useState<string[]>(product?.linked_frame_ids ?? [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      sku: product?.sku ?? '',
      category_id: product?.category_id ?? '',
      short_description: product?.short_description ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      compare_price: product?.compare_price ?? '',
      stock: product?.stock ?? 0,
      stock_status: product?.stock_status ?? 'in_stock',
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      is_new: product?.is_new ?? true,
      meta_title: product?.meta_title ?? '',
      meta_description: product?.meta_description ?? '',
      linked_frame_ids: product?.linked_frame_ids ?? [],
    },
  })

  const nameValue = watch('name')
  function handleNameBlur() {
    if (!isEdit && nameValue && !watch('slug')) {
      setValue('slug', slugify(nameValue))
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
        ...urls.map((url, i) => ({
          url,
          isPrimary: prev.length === 0 && i === 0,
          order: prev.length + i,
        })),
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
      if (!next.some((img) => img.isPrimary) && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true }
      }
      return next
    })
  }

  function setPrimary(idx: number) {
    setGallery((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  async function onSubmit(data: ProductFormData) {
    try {
      if (isEdit) {
        await updateProduct(product!.id, data, gallery)
        toast.success('محصول با موفقیت به‌روزرسانی شد')
      } else {
        await createProduct(data, gallery)
        toast.success('محصول با موفقیت ثبت شد')
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      toast.error('خطا در ذخیره محصول: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* ── Basic Info ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-white">اطلاعات پایه</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="نام محصول *"
            placeholder="درب ضد سرقت آرتوس پلاتینیوم"
            error={errors.name?.message}
            {...register('name', { onBlur: handleNameBlur })}
          />
          <Input
            label="اسلاگ (URL) *"
            placeholder="artos-platinum"
            error={errors.slug?.message}
            dir="ltr"
            hint="فقط حروف انگلیسی کوچک، اعداد و خط تیره"
            {...register('slug')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="کد محصول (SKU) *"
            placeholder="SD-1001"
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
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#181818]">{c.name}</option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-xs text-[#E74C3C]">{errors.category_id.message}</p>
            )}
          </div>
        </div>

        <Textarea
          label="توضیح کوتاه"
          placeholder="خلاصه ویژگی‌های اصلی محصول..."
          error={errors.short_description?.message}
          {...register('short_description')}
        />
        <Textarea
          label="مشخصات فنی کامل *"
          placeholder="شرح کامل مشخصات فنی محصول..."
          className="min-h-[180px]"
          error={errors.description?.message}
          {...register('description')}
        />
      </section>

      {/* ── Pricing & Stock ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-white">قیمت و موجودی</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            label="موجودی انبار"
            type="number"
            error={errors.stock?.message}
            {...register('stock')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">وضعیت موجودی</label>
            <select
              {...register('stock_status')}
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              {STOCK_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#181818]">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-gold w-4 h-4" {...register('is_active')} />
            <span className="text-sm text-muted">فعال (نمایش عمومی)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-gold w-4 h-4" {...register('is_featured')} />
            <span className="text-sm text-muted">محصول ویژه</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-gold w-4 h-4" {...register('is_new')} />
            <span className="text-sm text-muted">جدید</span>
          </label>
        </div>
      </section>

      {/* ── Frame Pricing Engine Link ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">اتصال به موتور قیمت‌گذاری چهارچوب</h2>
          <p className="text-sm text-muted mt-1">
            رنگ/نوع چهارچوب‌هایی که این محصول می‌تواند با آن‌ها سفارش داده شود را انتخاب کنید — برای محاسبه خودکار ضریب قیمت.
          </p>
        </div>
        {framePrices.length === 0 ? (
          <p className="text-sm text-muted">هیچ ردیفی در لیست قیمت چهارچوب ثبت نشده است.</p>
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
                    <input
                      type="checkbox"
                      className="accent-gold w-4 h-4"
                      checked={checked}
                      onChange={() => toggleFrame(f.id)}
                    />
                    {f.frame_type === 'french' ? 'فرانسوی' : 'مکزیکی'} — {f.color_name}
                  </span>
                  <span className="text-xs text-muted" dir="ltr">{f.price_3klaf.toLocaleString('fa-IR')}</span>
                </label>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Images ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">تصاویر محصول</h2>
          <label className={cn(
            'inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm transition-all',
            uploading
              ? 'border-gold/40 text-gold opacity-60 cursor-not-allowed'
              : 'border-white/20 text-muted hover:border-gold hover:text-gold',
          )}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'در حال آپلود...' : 'افزودن تصویر'}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryAdd}
              disabled={uploading}
            />
          </label>
        </div>

        {gallery.length === 0 ? (
          <div className="text-center py-10 text-muted border-2 border-dashed border-white/15 rounded-xl">
            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">فایل‌ها را اینجا بکشید یا با دکمه بالا اضافه کنید</p>
            <p className="text-xs mt-1 opacity-60">JPG، PNG، WebP</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gallery.map((img, idx) => (
              <div key={img.url} className="relative group">
                <div className={cn(
                  'relative w-full aspect-square rounded-xl overflow-hidden border',
                  img.isPrimary ? 'border-gold' : 'border-white/10',
                )}>
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
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="w-full mt-1 text-xs text-muted hover:text-gold transition-colors"
                  >
                    تنظیم به‌عنوان تصویر اصلی
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SEO ── */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">سئو</h2>
        <Input
          label="عنوان سئو (اختیاری)"
          placeholder="عنوانی که در نتایج گوگل نمایش داده می‌شود"
          error={errors.meta_title?.message}
          {...register('meta_title')}
        />
        <Textarea
          label="توضیحات متا (اختیاری)"
          placeholder="حداکثر ۱۶۰ کاراکتر"
          error={errors.meta_description?.message}
          {...register('meta_description')}
        />
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4 justify-end pb-8">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-2.5 rounded-xl border border-white/15 text-muted hover:text-white hover:border-white/30 transition-all text-sm"
        >
          انصراف
        </button>
        <Button type="submit" variant="gold" size="md" loading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
          {isEdit ? 'ذخیره تغییرات' : 'ثبت محصول'}
        </Button>
      </div>
    </form>
  )
}

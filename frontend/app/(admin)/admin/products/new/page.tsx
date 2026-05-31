'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, Upload, Plus, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const productSchema = z.object({
  name: z.string().min(3, 'نام محصول حداقل ۳ کاراکتر باشد').max(300),
  sku: z.string().min(2, 'کد محصول الزامی است').max(100),
  shortDescription: z.string().max(500).optional(),
  description: z.string().min(10, 'توضیحات حداقل ۱۰ کاراکتر باشد'),
  price: z.coerce.number({ required_error: 'قیمت الزامی است' }).min(1, 'قیمت باید مثبت باشد'),
  comparePrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, 'موجودی باید ≥ ۰ باشد').default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(true),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

const CATEGORIES = [
  { id: '1', name: 'درب ضد سرقت' },
  { id: '2', name: 'درب ضد حریق' },
  { id: '3', name: 'درب آپارتمانی' },
  { id: '4', name: 'درب ویلایی' },
  { id: '5', name: 'درب اداری' },
  { id: '6', name: 'متعلقات' },
]

export default function NewProductPage() {
  const [saved, setSaved] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isNew, setIsNew] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, isFeatured: false, isNew: true, stock: 0 },
  })

  async function onSubmit(_data: ProductFormData) {
    await new Promise((r) => setTimeout(r, 1200))
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-[#1F8A4D]/20 border border-[#1F8A4D]/30 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-[#27AE60]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">محصول با موفقیت ذخیره شد</h2>
        <p className="text-[#A0A0A0] mb-6">محصول جدید در سیستم ثبت شد.</p>
        <div className="flex gap-3">
          <Button variant="gold" size="md" onClick={() => setSaved(false)}>
            افزودن محصول دیگر
          </Button>
          <Button asChild variant="dark" size="md">
            <Link href="/admin/products">بازگشت به لیست</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#A0A0A0]">
        <Link href="/admin/products" className="hover:text-[#C8A85D] transition-colors">محصولات</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white">محصول جدید</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">افزودن محصول</h1>
        <Button
          variant="gold"
          size="sm"
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          ذخیره محصول
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">اطلاعات پایه</TabsTrigger>
            <TabsTrigger value="media">تصاویر</TabsTrigger>
            <TabsTrigger value="specs">مشخصات</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
              <div className="lg:col-span-2 space-y-5">
                <div className="rounded-2xl bg-[#181818] border border-white/8 p-5 space-y-4">
                  <h3 className="font-bold text-white">اطلاعات اصلی</h3>
                  <Input
                    label="نام محصول"
                    placeholder="درب ضد سرقت ..."
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="کد محصول (SKU)"
                      placeholder="SD-1001"
                      error={errors.sku?.message}
                      {...register('sku')}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[#A0A0A0]">دسته‌بندی</label>
                      <select
                        className="h-11 rounded-xl px-4 bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C8A85D]"
                      >
                        <option value="" className="bg-[#181818]">انتخاب دسته‌بندی</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#181818]">{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Textarea
                    label="توضیح کوتاه"
                    placeholder="خلاصه ویژگی‌های اصلی محصول..."
                    error={errors.shortDescription?.message}
                    {...register('shortDescription')}
                  />
                  <Textarea
                    label="توضیحات کامل"
                    className="min-h-[200px]"
                    placeholder="توضیحات کامل محصول..."
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </div>

                <div className="rounded-2xl bg-[#181818] border border-white/8 p-5 space-y-4">
                  <h3 className="font-bold text-white">قیمت و موجودی</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="قیمت (تومان)"
                      type="number"
                      placeholder="28500000"
                      error={errors.price?.message}
                      {...register('price')}
                    />
                    <Input
                      label="قیمت قبل از تخفیف (اختیاری)"
                      type="number"
                      placeholder="32000000"
                      error={errors.comparePrice?.message}
                      {...register('comparePrice')}
                    />
                  </div>
                  <Input
                    label="موجودی انبار"
                    type="number"
                    error={errors.stock?.message}
                    {...register('stock')}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#181818] border border-white/8 p-5 space-y-4">
                  <h3 className="font-bold text-white text-sm">وضعیت انتشار</h3>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0]">فعال</span>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0]">ویژه</span>
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0]">جدید</span>
                    <Switch checked={isNew} onCheckedChange={setIsNew} />
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="md"
                  className="w-full"
                  loading={isSubmitting}
                  type="submit"
                >
                  ذخیره محصول
                </Button>
                <Button asChild variant="dark" size="md" className="w-full">
                  <Link href="/admin/products">انصراف</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media">
            <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 mt-4">
              <h3 className="font-bold text-white mb-5">تصاویر محصول</h3>
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center hover:border-[#C8A85D]/40 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-[#A0A0A0] mx-auto mb-3" />
                <p className="text-[#A0A0A0] text-sm">فایل‌ها را اینجا بکشید یا کلیک کنید</p>
                <p className="text-xs text-[#A0A0A0]/60 mt-1">JPG، PNG، WebP — حداکثر ۱۰MB</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 mt-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white">مشخصات فنی</h3>
                <Button variant="dark" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  افزودن ردیف
                </Button>
              </div>
              <div className="space-y-3">
                {['جنس', 'ضخامت', 'وزن', 'درجه امنیتی', 'ضمانت'].map((label) => (
                  <div key={label} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center">
                    <Input placeholder="ویژگی" defaultValue={label} />
                    <Input placeholder="مقدار" />
                    <button className="w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#E74C3C] hover:border-[#C0392B]/30 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 mt-4 space-y-4">
              <h3 className="font-bold text-white">بهینه‌سازی موتور جستجو</h3>
              <Input
                label="عنوان SEO (اختیاری)"
                placeholder="عنوانی که در نتایج گوگل نمایش داده می‌شود"
                error={errors.metaTitle?.message}
                {...register('metaTitle')}
              />
              <Textarea
                label="توضیحات SEO (اختیاری)"
                placeholder="توضیحاتی که در نتایج گوگل نمایش داده می‌شود (حداکثر ۱۶۰ کاراکتر)"
                error={errors.metaDescription?.message}
                {...register('metaDescription')}
              />
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}

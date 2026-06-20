import { z } from 'zod'

export const productReviewSchema = z.object({
  rating: z
    .number({ required_error: 'امتیاز الزامی است' })
    .int()
    .min(1, 'حداقل امتیاز ۱ است')
    .max(5, 'حداکثر امتیاز ۵ است'),
  title: z.string().max(255).optional(),
  content: z.string().min(10, 'متن نظر حداقل ۱۰ کاراکتر باشد').max(2000),
})

export const productFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  search: z.string().max(200).optional(),
  sortBy: z
    .enum(['newest', 'oldest', 'price_asc', 'price_desc', 'most_viewed', 'best_rated', 'most_reviewed'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
})

export const couponSchema = z.object({
  code: z.string().min(1, 'کد تخفیف الزامی است').max(50),
})

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN PRODUCT FORM  (create / edit — fields mirror the `products` table)
// ─────────────────────────────────────────────────────────────────────────────

const faqItemSchema = z.object({
  question: z.string().min(5, 'سوال حداقل ۵ کاراکتر'),
  answer:   z.string().min(10, 'پاسخ حداقل ۱۰ کاراکتر'),
})

export const productFormSchema = z.object({
  // ── پایه ──────────────────────────────────────────────────────────────────
  name:              z.string().min(3, 'نام محصول حداقل ۳ کاراکتر باشد').max(300),
  slug:              z.string().min(3, 'اسلاگ حداقل ۳ کاراکتر باشد')
                       .regex(/^[a-z0-9-]+$/, 'فقط حروف انگلیسی کوچک، اعداد و خط تیره'),
  sku:               z.string().min(2, 'کد محصول الزامی است').max(100),
  category_id:       z.string().uuid('دسته‌بندی را انتخاب کنید'),
  brand:             z.string().max(200).optional().or(z.literal('')),
  short_description: z.string().max(500).optional().or(z.literal('')),
  description:       z.string().min(10, 'توضیحات حداقل ۱۰ کاراکتر باشد'),
  body_content:      z.string().max(50000).optional().or(z.literal('')),
  tags:              z.string().max(500).optional().or(z.literal('')),

  // ── قیمت و موجودی ─────────────────────────────────────────────────────────
  price:        z.coerce.number({ required_error: 'قیمت الزامی است' }).min(1, 'قیمت باید مثبت باشد'),
  compare_price: z.coerce.number().min(0).optional().or(z.literal('')),
  stock:        z.coerce.number().int().min(0, 'موجودی باید ≥ ۰ باشد').default(0),
  stock_status: z.enum(['in_stock', 'out_of_stock', 'pre_order', 'discontinued']).default('in_stock'),
  is_active:    z.boolean().default(true),
  is_featured:  z.boolean().default(false),
  is_new:       z.boolean().default(true),

  // ── SEO پایه ──────────────────────────────────────────────────────────────
  focus_keyword:    z.string().max(200).optional().or(z.literal('')),
  meta_title:       z.string().max(70, 'عنوان متا حداکثر ۷۰ کاراکتر').optional().or(z.literal('')),
  meta_description: z.string().max(160, 'توضیح متا حداکثر ۱۶۰ کاراکتر').optional().or(z.literal('')),
  canonical_url:    z.string().url('آدرس کانونیکال باید URL معتبر باشد').optional().or(z.literal('')),
  robots:           z.string().optional().or(z.literal('')),

  // ── OpenGraph / Social ─────────────────────────────────────────────────────
  og_title:       z.string().max(95, 'عنوان OG حداکثر ۹۵ کاراکتر').optional().or(z.literal('')),
  og_description: z.string().max(300, 'توضیح OG حداکثر ۳۰۰ کاراکتر').optional().or(z.literal('')),
  og_image_url:   z.string().url('آدرس تصویر OG باید URL معتبر باشد').optional().or(z.literal('')),

  // ── AEO — Answer Engine Optimization ──────────────────────────────────────
  faq_pairs: z.array(faqItemSchema).default([]),

  // ── GEO — Generative Engine Optimization ──────────────────────────────────
  ai_summary:      z.string().max(2000, 'خلاصه AI حداکثر ۲۰۰۰ کاراکتر').optional().or(z.literal('')),
  entity_keywords: z.string().max(500).optional().or(z.literal('')),

  // ── اتصال چهارچوب ─────────────────────────────────────────────────────────
  linked_frame_ids: z.array(z.string().uuid()).default([]),
})

export type FaqItem          = z.infer<typeof faqItemSchema>
export type ProductReviewFormData = z.infer<typeof productReviewSchema>
export type ProductFilterData     = z.infer<typeof productFilterSchema>
export type CouponFormData        = z.infer<typeof couponSchema>
export type ProductFormData       = z.infer<typeof productFormSchema>

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

export const productFormSchema = z.object({
  name: z.string().min(3, 'نام محصول حداقل ۳ کاراکتر باشد').max(300),
  slug: z
    .string()
    .min(3, 'اسلاگ حداقل ۳ کاراکتر باشد')
    .regex(/^[a-z0-9-]+$/, 'اسلاگ فقط حروف انگلیسی کوچک، اعداد و خط تیره'),
  sku: z.string().min(2, 'کد محصول الزامی است').max(100),
  category_id: z.string().uuid('دسته‌بندی را انتخاب کنید'),
  short_description: z.string().max(500).optional().or(z.literal('')),
  description: z.string().min(10, 'توضیحات حداقل ۱۰ کاراکتر باشد'),
  price: z.coerce.number({ required_error: 'قیمت الزامی است' }).min(1, 'قیمت باید مثبت باشد'),
  compare_price: z.coerce.number().min(0).optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0, 'موجودی باید ≥ ۰ باشد').default(0),
  stock_status: z.enum(['in_stock', 'out_of_stock', 'pre_order', 'discontinued']).default('in_stock'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(true),
  meta_title: z.string().max(255).optional().or(z.literal('')),
  meta_description: z.string().max(500).optional().or(z.literal('')),
  linked_frame_ids: z.array(z.string().uuid()).default([]),
})

export type ProductReviewFormData = z.infer<typeof productReviewSchema>
export type ProductFilterData = z.infer<typeof productFilterSchema>
export type CouponFormData = z.infer<typeof couponSchema>
export type ProductFormData = z.infer<typeof productFormSchema>

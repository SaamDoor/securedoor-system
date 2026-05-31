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

export type ProductReviewFormData = z.infer<typeof productReviewSchema>
export type ProductFilterData = z.infer<typeof productFilterSchema>
export type CouponFormData = z.infer<typeof couponSchema>

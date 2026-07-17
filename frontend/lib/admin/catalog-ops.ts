import { z } from 'zod'

export const ADMIN_CATALOG_PAGE_SIZE = 50
export const ADMIN_CATALOG_MAX_PAGE_SIZE = 100

export const adminCatalogSortSchema = z.enum([
  'name_asc',
  'name_desc',
  'price_asc',
  'price_desc',
  'stock_asc',
  'stock_desc',
  'updated_desc',
])

export const adminCatalogFilterSchema = z.object({
  search: z.string().max(200).optional().default(''),
  categoryId: z.union([z.string().uuid(), z.literal('')]).optional().default(''),
  isActive: z.enum(['all', 'true', 'false']).optional().default('all'),
  stockLevel: z
    .enum(['all', 'in_stock', 'out_of_stock', 'low', 'pre_order', 'discontinued'])
    .optional()
    .default('all'),
  minStock: z.coerce.number().int().min(0).optional(),
  maxStock: z.coerce.number().int().min(0).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: adminCatalogSortSchema.optional().default('name_asc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(ADMIN_CATALOG_MAX_PAGE_SIZE)
    .optional()
    .default(ADMIN_CATALOG_PAGE_SIZE),
})

export type AdminCatalogFilter = z.infer<typeof adminCatalogFilterSchema>
export type AdminCatalogSort = z.infer<typeof adminCatalogSortSchema>

export const inventoryRowPatchSchema = z.object({
  id: z.string().uuid(),
  stock_left: z.coerce.number().int().min(0),
  stock_right: z.coerce.number().int().min(0),
  low_stock_threshold: z.coerce.number().int().min(0),
})

export const inventoryBulkSchema = z.object({
  mode: z.enum(['set', 'increase', 'decrease']),
  field: z.enum(['stock_left', 'stock_right', 'low_stock_threshold', 'both_sides']),
  value: z.coerce.number().int().min(0),
  target: z.discriminatedUnion('type', [
    z.object({ type: z.literal('ids'), ids: z.array(z.string().uuid()).min(1).max(5000) }),
    z.object({ type: z.literal('filtered'), filter: adminCatalogFilterSchema }),
  ]),
})

export const pricingRowPatchSchema = z.object({
  id: z.string().uuid(),
  price: z.coerce.number().int().min(1),
  compare_price: z.union([z.coerce.number().int().min(0), z.null()]),
  cost_price: z.union([z.coerce.number().int().min(0), z.null()]),
})

export const pricingBulkSchema = z.object({
  mode: z.enum(['set', 'increase_amount', 'decrease_amount', 'increase_percent', 'decrease_percent', 'clear']),
  field: z.enum(['price', 'compare_price', 'cost_price']),
  value: z.coerce.number().optional(),
  target: z.discriminatedUnion('type', [
    z.object({ type: z.literal('ids'), ids: z.array(z.string().uuid()).min(1).max(5000) }),
    z.object({ type: z.literal('filtered'), filter: adminCatalogFilterSchema }),
  ]),
}).superRefine((data, ctx) => {
  if (data.mode === 'clear') {
    if (data.field === 'price') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'قیمت اصلی را نمی‌توان پاک کرد', path: ['field'] })
    }
    return
  }
  if (data.value == null || Number.isNaN(data.value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'مقدار الزامی است', path: ['value'] })
    return
  }
  if (data.mode === 'set' && data.field === 'price' && data.value < 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'قیمت اصلی باید حداقل ۱ باشد', path: ['value'] })
  }
  if ((data.mode === 'increase_percent' || data.mode === 'decrease_percent') && data.value < 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'درصد نمی‌تواند منفی باشد', path: ['value'] })
  }
})

export type InventoryRowPatch = z.infer<typeof inventoryRowPatchSchema>
export type InventoryBulkInput = z.infer<typeof inventoryBulkSchema>
export type PricingRowPatch = z.infer<typeof pricingRowPatchSchema>
export type PricingBulkInput = z.infer<typeof pricingBulkSchema>

export interface AdminInventoryRow {
  id: string
  name: string
  sku: string
  stock: number
  stock_left: number
  stock_right: number
  low_stock_threshold: number
  stock_status: string
  is_active: boolean
  price: number
  category_id: string | null
  category_name: string | null
  updated_at: string | null
}

export interface AdminPricingRow {
  id: string
  name: string
  sku: string
  price: number
  compare_price: number | null
  cost_price: number | null
  stock: number
  stock_status: string
  is_active: boolean
  category_id: string | null
  category_name: string | null
  updated_at: string | null
}

export interface AdminCatalogPageResult<T> {
  rows: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function emptyCatalogFilter(): AdminCatalogFilter {
  return adminCatalogFilterSchema.parse({})
}

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import {
  adminCatalogFilterSchema,
  type AdminCatalogFilter,
  type AdminCatalogPageResult,
  type AdminInventoryRow,
  type AdminPricingRow,
  type InventoryBulkInput,
  type InventoryRowPatch,
  type PricingBulkInput,
  type PricingRowPatch,
} from '@/lib/admin/catalog-ops'

type DbClient = SupabaseClient

async function getServerClient() {
  return createClient()
}

function escapeIlike(value: string) {
  return value.replace(/[%_,]/g, '\\$&')
}

function applyCatalogFilters(query: any, filter: AdminCatalogFilter) {
  const search = filter.search?.trim()
  if (search) {
    const term = escapeIlike(search)
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
  }

  if (filter.categoryId) {
    query = query.eq('category_id', filter.categoryId)
  }

  if (filter.isActive === 'true') query = query.eq('is_active', true)
  if (filter.isActive === 'false') query = query.eq('is_active', false)

  switch (filter.stockLevel) {
    case 'in_stock':
      query = query.eq('stock_status', 'in_stock').gt('stock', 0)
      break
    case 'out_of_stock':
      query = query.eq('stock_status', 'out_of_stock')
      break
    case 'low':
      query = query.eq('is_low_stock', true)
      break
    case 'pre_order':
      query = query.eq('stock_status', 'pre_order')
      break
    case 'discontinued':
      query = query.eq('stock_status', 'discontinued')
      break
    default:
      break
  }

  if (typeof filter.minStock === 'number') query = query.gte('stock', filter.minStock)
  if (typeof filter.maxStock === 'number') query = query.lte('stock', filter.maxStock)
  if (typeof filter.minPrice === 'number') query = query.gte('price', filter.minPrice)
  if (typeof filter.maxPrice === 'number') query = query.lte('price', filter.maxPrice)

  return query
}

function applyCatalogSort(query: any, sortBy: AdminCatalogFilter['sortBy']) {
  switch (sortBy) {
    case 'name_desc':
      return query.order('name', { ascending: false }).order('id', { ascending: true })
    case 'price_asc':
      return query.order('price', { ascending: true }).order('id', { ascending: true })
    case 'price_desc':
      return query.order('price', { ascending: false }).order('id', { ascending: true })
    case 'stock_asc':
      return query.order('stock', { ascending: true }).order('id', { ascending: true })
    case 'stock_desc':
      return query.order('stock', { ascending: false }).order('id', { ascending: true })
    case 'updated_desc':
      return query.order('updated_at', { ascending: false }).order('id', { ascending: true })
    case 'name_asc':
    default:
      return query.order('name', { ascending: true }).order('id', { ascending: true })
  }
}

function mapInventoryRow(row: Record<string, unknown>): AdminInventoryRow {
  const category = row.category as { id?: string; name?: string } | null
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    sku: String(row.sku ?? ''),
    stock: Number(row.stock ?? 0),
    stock_left: Number(row.stock_left ?? 0),
    stock_right: Number(row.stock_right ?? 0),
    low_stock_threshold: Number(row.low_stock_threshold ?? 0),
    stock_status: String(row.stock_status ?? 'in_stock'),
    is_active: Boolean(row.is_active),
    price: Number(row.price ?? 0),
    category_id: category?.id ?? (row.category_id ? String(row.category_id) : null),
    category_name: category?.name ?? null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  }
}

function mapPricingRow(row: Record<string, unknown>): AdminPricingRow {
  const category = row.category as { id?: string; name?: string } | null
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    sku: String(row.sku ?? ''),
    price: Number(row.price ?? 0),
    compare_price: row.compare_price == null ? null : Number(row.compare_price),
    cost_price: row.cost_price == null ? null : Number(row.cost_price),
    stock: Number(row.stock ?? 0),
    stock_status: String(row.stock_status ?? 'in_stock'),
    is_active: Boolean(row.is_active),
    category_id: category?.id ?? (row.category_id ? String(row.category_id) : null),
    category_name: category?.name ?? null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  }
}

async function runCatalogPageQuery(
  supabase: DbClient,
  filter: AdminCatalogFilter,
  select: string,
) {
  const from = (filter.page - 1) * filter.limit
  const to = from + filter.limit - 1

  let query = supabase.from('products').select(select, { count: 'exact' })
  query = applyCatalogFilters(query, filter)
  query = applyCatalogSort(query, filter.sortBy)
  return query.range(from, to)
}

export async function fetchAdminInventoryPageServer(
  rawFilter: Partial<AdminCatalogFilter> = {},
): Promise<AdminCatalogPageResult<AdminInventoryRow>> {
  const filter = adminCatalogFilterSchema.parse(rawFilter)
  const supabase = await getServerClient()
  const select = `id, name, sku, stock, stock_left, stock_right, low_stock_threshold, stock_status, is_active, price, category_id, updated_at,
       category:product_categories(id, name)`

  let result = await runCatalogPageQuery(supabase, filter, select)

  // Fallback when migration 021 (is_low_stock) is not applied yet.
  if (result.error && filter.stockLevel === 'low' && /is_low_stock/i.test(result.error.message)) {
    const fallbackFilter = { ...filter, stockLevel: 'all' as const }
    result = await runCatalogPageQuery(supabase, fallbackFilter, select)
    if (!result.error) {
      const filtered = ((result.data ?? []) as unknown as Record<string, unknown>[])
        .map((row) => mapInventoryRow(row))
        .filter((row) => row.stock > 0 && row.stock <= row.low_stock_threshold)
      return {
        rows: filtered,
        total: filtered.length,
        page: 1,
        limit: filter.limit,
        totalPages: 1,
      }
    }
  }

  if (result.error) throw result.error

  const total = result.count ?? 0
  return {
    rows: ((result.data ?? []) as unknown as Record<string, unknown>[]).map((row) => mapInventoryRow(row)),
    total,
    page: filter.page,
    limit: filter.limit,
    totalPages: Math.max(1, Math.ceil(total / filter.limit)),
  }
}

export async function fetchAdminPricingPageServer(
  rawFilter: Partial<AdminCatalogFilter> = {},
): Promise<AdminCatalogPageResult<AdminPricingRow>> {
  const filter = adminCatalogFilterSchema.parse(rawFilter)
  const supabase = await getServerClient()
  const select = `id, name, sku, price, compare_price, cost_price, stock, stock_status, is_active, category_id, updated_at,
       category:product_categories(id, name)`

  let result = await runCatalogPageQuery(supabase, filter, select)
  if (result.error && filter.stockLevel === 'low' && /is_low_stock/i.test(result.error.message)) {
    const fallbackFilter = { ...filter, stockLevel: 'all' as const }
    result = await runCatalogPageQuery(supabase, fallbackFilter, select)
    if (!result.error) {
      const filtered = ((result.data ?? []) as unknown as Record<string, unknown>[])
        .map((row) => mapPricingRow(row))
        .filter((row) => row.stock > 0)
      return {
        rows: filtered,
        total: filtered.length,
        page: 1,
        limit: filter.limit,
        totalPages: 1,
      }
    }
  }

  if (result.error) throw result.error

  const total = result.count ?? 0
  return {
    rows: ((result.data ?? []) as unknown as Record<string, unknown>[]).map((row) => mapPricingRow(row)),
    total,
    page: filter.page,
    limit: filter.limit,
    totalPages: Math.max(1, Math.ceil(total / filter.limit)),
  }
}

async function resolveFilteredIds(
  supabase: DbClient,
  rawFilter: Partial<AdminCatalogFilter>,
): Promise<string[]> {
  const filter = adminCatalogFilterSchema.parse({ ...rawFilter, page: 1, limit: 100 })
  const ids: string[] = []
  let page = 1
  let totalPages = 1
  let useLowStockFallback = false

  while (page <= totalPages) {
    const from = (page - 1) * 100
    const to = from + 99
    const activeFilter = useLowStockFallback
      ? { ...filter, page, limit: 100, stockLevel: 'all' as const }
      : { ...filter, page, limit: 100 }
    let query = supabase
      .from('products')
      .select(useLowStockFallback ? 'id, stock, low_stock_threshold' : 'id', { count: 'exact' })
    query = applyCatalogFilters(query, activeFilter)
    query = applyCatalogSort(query, filter.sortBy)
    const { data, error, count } = await query.range(from, to)

    if (error && !useLowStockFallback && filter.stockLevel === 'low' && /is_low_stock/i.test(error.message)) {
      useLowStockFallback = true
      page = 1
      totalPages = 1
      ids.length = 0
      continue
    }
    if (error) throw error

    totalPages = Math.max(1, Math.ceil((count ?? 0) / 100))
    for (const row of (data ?? []) as unknown as Array<{
      id: string
      stock?: number
      low_stock_threshold?: number
    }>) {
      if (useLowStockFallback) {
        const stock = Number(row.stock ?? 0)
        const threshold = Number(row.low_stock_threshold ?? 0)
        if (!(stock > 0 && stock <= threshold)) continue
      }
      ids.push(String(row.id))
    }
    if (!data?.length) break
    page += 1
    if (ids.length > 5000) {
      throw new Error('تعداد نتایج فیلتر بیش از ۵۰۰۰ است؛ فیلتر را محدودتر کنید')
    }
  }

  return ids
}

async function resolveTargetIds(
  supabase: DbClient,
  target: InventoryBulkInput['target'] | PricingBulkInput['target'],
): Promise<string[]> {
  if (target.type === 'ids') return [...new Set(target.ids)]
  return resolveFilteredIds(supabase, target.filter)
}

async function rpcOrThrow(supabase: DbClient, fn: string, args: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw error
  return Number(data ?? 0)
}

export async function patchInventoryRowsServer(rows: InventoryRowPatch[]) {
  const supabase = await getServerClient()
  try {
    return await rpcOrThrow(supabase, 'admin_bulk_patch_inventory', { p_rows: rows })
  } catch (error) {
    // Fallback when migration is not applied yet.
    let updated = 0
    for (const row of rows) {
      const { data, error: updateError } = await supabase
        .from('products')
        .update({
          stock_left: row.stock_left,
          stock_right: row.stock_right,
          low_stock_threshold: row.low_stock_threshold,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
        .select('id')
        .maybeSingle()
      if (updateError) throw updateError
      if (data) updated += 1
    }
    if (!updated && rows.length) {
      throw error instanceof Error ? error : new Error('ذخیره موجودی ناموفق بود')
    }
    return updated
  }
}

export async function bulkAdjustInventoryServer(input: InventoryBulkInput) {
  const supabase = await getServerClient()
  const ids = await resolveTargetIds(supabase, input.target)
  if (!ids.length) return 0

  try {
    return await rpcOrThrow(supabase, 'admin_bulk_adjust_inventory', {
      p_ids: ids,
      p_mode: input.mode,
      p_field: input.field,
      p_value: input.value,
    })
  } catch (error) {
    const patches: InventoryRowPatch[] = []
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('id, stock_left, stock_right, low_stock_threshold')
      .in('id', ids)
    if (fetchError) throw fetchError

    for (const row of data ?? []) {
      let left = Number(row.stock_left)
      let right = Number(row.stock_right)
      let threshold = Number(row.low_stock_threshold)
      const apply = (current: number) => {
        if (input.mode === 'set') return input.value
        if (input.mode === 'increase') return current + input.value
        return Math.max(0, current - input.value)
      }
      if (input.field === 'stock_left' || input.field === 'both_sides') left = apply(left)
      if (input.field === 'stock_right' || input.field === 'both_sides') right = apply(right)
      if (input.field === 'low_stock_threshold') threshold = apply(threshold)
      patches.push({
        id: String(row.id),
        stock_left: left,
        stock_right: right,
        low_stock_threshold: threshold,
      })
    }

    if (!patches.length) {
      throw error instanceof Error ? error : new Error('عملیات گروهی موجودی ناموفق بود')
    }
    return patchInventoryRowsServer(patches)
  }
}

export async function patchPricingRowsServer(rows: PricingRowPatch[]) {
  const supabase = await getServerClient()
  try {
    return await rpcOrThrow(supabase, 'admin_bulk_patch_pricing', { p_rows: rows })
  } catch (error) {
    let updated = 0
    for (const row of rows) {
      const { data, error: updateError } = await supabase
        .from('products')
        .update({
          price: row.price,
          compare_price: row.compare_price,
          cost_price: row.cost_price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
        .select('id')
        .maybeSingle()
      if (updateError) throw updateError
      if (data) updated += 1
    }
    if (!updated && rows.length) {
      throw error instanceof Error ? error : new Error('ذخیره قیمت ناموفق بود')
    }
    return updated
  }
}

function adjustPriceValue(
  current: number | null,
  fallback: number,
  mode: PricingBulkInput['mode'],
  value: number | undefined,
): number | null {
  if (mode === 'clear') return null
  const base = current ?? fallback
  const amount = value ?? 0
  let next = base
  switch (mode) {
    case 'set':
      next = amount
      break
    case 'increase_amount':
      next = base + amount
      break
    case 'decrease_amount':
      next = base - amount
      break
    case 'increase_percent':
      next = base * (1 + amount / 100)
      break
    case 'decrease_percent':
      next = base * (1 - amount / 100)
      break
  }
  return Math.max(0, Math.round(next))
}

export async function bulkAdjustPricingServer(input: PricingBulkInput) {
  const supabase = await getServerClient()
  const ids = await resolveTargetIds(supabase, input.target)
  if (!ids.length) return 0

  try {
    return await rpcOrThrow(supabase, 'admin_bulk_adjust_pricing', {
      p_ids: ids,
      p_mode: input.mode,
      p_field: input.field,
      p_value: input.mode === 'clear' ? null : input.value ?? null,
    })
  } catch (error) {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('id, price, compare_price, cost_price')
      .in('id', ids)
    if (fetchError) throw fetchError

    const patches: PricingRowPatch[] = (data ?? []).map((row) => {
      const price = Number(row.price)
      let nextPrice = price
      let nextCompare = row.compare_price == null ? null : Number(row.compare_price)
      let nextCost = row.cost_price == null ? null : Number(row.cost_price)

      if (input.field === 'price') {
        nextPrice = Math.max(1, adjustPriceValue(price, price, input.mode, input.value) ?? 1)
      } else if (input.field === 'compare_price') {
        nextCompare = adjustPriceValue(nextCompare, price, input.mode, input.value)
      } else {
        nextCost = adjustPriceValue(nextCost, price, input.mode, input.value)
      }

      return {
        id: String(row.id),
        price: nextPrice,
        compare_price: nextCompare,
        cost_price: nextCost,
      }
    })

    if (!patches.length) {
      throw error instanceof Error ? error : new Error('عملیات گروهی قیمت ناموفق بود')
    }
    return patchPricingRowsServer(patches)
  }
}

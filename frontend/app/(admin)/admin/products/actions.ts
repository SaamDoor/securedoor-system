'use server'

import { revalidatePath } from 'next/cache'
import { appendFile } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_ROLES, type UserRole } from '@/types'
import type {
  AdminProductImageInput,
  AdminProductInput,
  AdminProductSpecificationInput,
} from '@/lib/api/products'
import {
  createProductServer,
  deleteCategoryServer,
  fetchAdminCategoriesServer,
  fetchAdminProductsServer,
  saveCategoryServer,
  updateProductServer,
  type CategorySaveInput,
} from '@/lib/api/products-admin.server'

async function debugLog(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  const entry = JSON.stringify({
    sessionId: '8b5927',
    runId: 'post-fix',
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  })
  try {
    await appendFile(join(process.cwd(), '..', '.cursor', 'debug-8b5927.log'), `${entry}\n`)
  } catch {
    // ignore
  }
}

async function requireCatalogAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('لطفاً دوباره وارد شوید')

  const { data: role, error: roleError } = await supabase.rpc('get_my_role')
  if (roleError) throw roleError
  if (!role || !ADMIN_ROLES.includes(role as UserRole)) {
    throw new Error('دسترسی مدیریت محصولات ندارید')
  }

  return supabase
}

export async function fetchAdminProductsAction(search = '') {
  try {
    await requireCatalogAdmin()
    const products = await fetchAdminProductsServer(search)
    await debugLog('actions.ts:fetchAdminProductsAction', 'admin products fetched', {
      search,
      productCount: products.length,
    }, 'H5')
    return { ok: true as const, products }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در بارگذاری محصولات'
    await debugLog('actions.ts:fetchAdminProductsAction', 'admin products fetch failed', {
      search,
      error: message,
    }, 'H1-H5')
    return { ok: false as const, error: message }
  }
}

export async function fetchAdminCategoriesAction() {
  try {
    await requireCatalogAdmin()
    const categories = await fetchAdminCategoriesServer()
    await debugLog('actions.ts:fetchAdminCategoriesAction', 'categories fetched', {
      categoryCount: categories.length,
    }, 'H1-H4')
    return { ok: true as const, categories }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'دریافت دسته‌بندی‌ها ناموفق بود'
    await debugLog('actions.ts:fetchAdminCategoriesAction', 'categories fetch failed', {
      error: message,
    }, 'H1-H4')
    return { ok: false as const, error: message }
  }
}

export async function saveCategoryAction(editingId: string | undefined, payload: CategorySaveInput) {
  try {
    await requireCatalogAdmin()
    await saveCategoryServer(editingId, payload)
    revalidatePath('/admin/products/categories')
    revalidatePath('/admin/products/new')
    await debugLog('actions.ts:saveCategoryAction', 'category saved', {
      editingId: editingId ?? null,
      slug: payload.slug,
    }, 'H2')
    return { ok: true as const }
  } catch (error) {
    const dbError = error as { code?: string; message?: string }
    const message = dbError.code === '23505'
      ? 'این نامک قبلاً استفاده شده است'
      : dbError.message ?? 'ذخیره دسته‌بندی ناموفق بود'
    await debugLog('actions.ts:saveCategoryAction', 'category save failed', {
      editingId: editingId ?? null,
      slug: payload.slug,
      error: message,
      errorCode: dbError.code ?? null,
    }, 'H2')
    return { ok: false as const, error: message }
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireCatalogAdmin()
    await deleteCategoryServer(id)
    revalidatePath('/admin/products/categories')
    return { ok: true as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'حذف دسته‌بندی ناموفق بود'
    return { ok: false as const, error: message }
  }
}

export async function createProductAction(
  input: AdminProductInput,
  images: AdminProductImageInput[] = [],
  specifications: AdminProductSpecificationInput[] = [],
) {
  try {
    await requireCatalogAdmin()
    const product = await createProductServer(input, images, specifications)
    revalidatePath('/admin/products')
    await debugLog('actions.ts:createProductAction', 'product created', {
      productId: product.id,
      slug: product.slug,
    }, 'H2')
    return { ok: true as const, productId: product.id as string }
  } catch (error) {
    const dbError = error as { code?: string; message?: string }
    const message = dbError.message ?? 'خطا در ذخیره محصول'
    await debugLog('actions.ts:createProductAction', 'product create failed', {
      slug: input.slug,
      error: message,
      errorCode: dbError.code ?? null,
    }, 'H1-H2')
    return { ok: false as const, error: message }
  }
}

export async function updateProductAction(
  id: string,
  input: AdminProductInput,
  images?: AdminProductImageInput[],
  specifications?: AdminProductSpecificationInput[],
) {
  try {
    await requireCatalogAdmin()
    await updateProductServer(id, input, images, specifications)
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}/edit`)
    return { ok: true as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در به‌روزرسانی محصول'
    return { ok: false as const, error: message }
  }
}

/** Normalize + upload product gallery images (1200×1200 WebP) via server. */
export async function uploadProductImagesAction(formData: FormData) {
  try {
    await requireCatalogAdmin()
    const files = formData
      .getAll('files')
      .filter((item): item is File => item instanceof File && item.size > 0)

    if (!files.length) return { ok: false as const, error: 'هیچ فایلی انتخاب نشده است' }

    const { uploadNormalizedProductImages } = await import('@/lib/admin/product-images.server')
    const urls = await uploadNormalizedProductImages(files)
    return { ok: true as const, urls }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'آپلود تصویر ناموفق بود'
    return { ok: false as const, error: message }
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { requirePanelAdmin, actionError, actionOk } from '@/lib/admin/auth'
import {
  fetchAdminOrdersServer,
  updateOrderStatusServer,
  fetchOrderReturnsServer,
  updateReturnStatusServer,
  fetchShippingMethodsServer,
  saveShippingMethodServer,
} from '@/lib/admin/orders.server'
import { fetchCouponsServer, saveCouponServer, deleteCouponServer } from '@/lib/admin/coupons.server'
import {
  fetchBlogPostsServer,
  fetchBlogPostServer,
  fetchBlogCategoriesServer,
  fetchBlogTagsServer,
  fetchBlogCommentsServer,
  saveBlogPostServer,
  deleteBlogPostServer,
  saveBlogCategoryServer,
  saveBlogTagServer,
  setBlogCommentApprovedServer,
} from '@/lib/admin/blog.server'
import {
  fetchPagesServer,
  savePageServer,
  deletePageServer,
  fetchFaqsServer,
  saveFaqServer,
  fetchMenusServer,
  saveMenuServer,
  fetchBannersServer,
  saveBannerServer,
  fetchRedirectsServer,
  saveRedirectServer,
  fetchSeoSettingsServer,
  saveSeoSettingServer,
} from '@/lib/admin/cms.server'
import {
  fetchSupportTicketsServer,
  updateTicketStatusServer,
  fetchBulkQuotesServer,
  fetchKbArticlesServer,
  fetchMessageTemplatesServer,
  fetchContactMessagesServer,
  markContactMessageReadServer,
} from '@/lib/admin/support.server'
import { fetchDashboardStatsServer, fetchAuditLogsServer } from '@/lib/admin/dashboard.server'
import {
  fetchAllSettingsServer,
  upsertSettingsServer,
  fetchMediaServer,
  saveMediaServer,
  fetchProductReviewsServer,
  setReviewApprovedServer,
  fetchWebhooksServer,
  saveWebhookServer,
  fetchWebhookLogsServer,
  fetchFramePricesServer,
  fetchBuilderTiersServer,
  fetchPayoutsServer,
  fetchInvoicesServer,
} from '@/lib/admin/misc.server'
import type { OrderStatus } from '@/types'

function revalidate(...paths: string[]) {
  paths.forEach((p) => revalidatePath(p))
}

export async function getDashboardStatsAction() {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchDashboardStatsServer())
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getOrdersAction(search = '', status = 'all') {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchAdminOrdersServer(search, status))
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, note?: string) {
  try {
    await requirePanelAdmin()
    await updateOrderStatusServer(orderId, status, note)
    revalidate('/admin/orders', '/admin/orders/kanban', '/admin/dashboard')
    return actionOk(true)
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getReturnsAction() {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchOrderReturnsServer())
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function updateReturnStatusAction(id: string, status: string, adminNote?: string) {
  try {
    await requirePanelAdmin()
    await updateReturnStatusServer(id, status, adminNote)
    revalidate('/admin/orders/returns')
    return actionOk(true)
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getShippingMethodsAction() {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchShippingMethodsServer())
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function saveShippingMethodAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    const savedId = await saveShippingMethodServer(input, id)
    revalidate('/admin/orders/shipping')
    return actionOk(savedId)
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getCouponsAction() {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchCouponsServer())
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function saveCouponAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    const savedId = await saveCouponServer(input as Parameters<typeof saveCouponServer>[0], id)
    revalidate('/admin/coupons')
    return actionOk(savedId)
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function deleteCouponAction(id: string) {
  try {
    await requirePanelAdmin()
    await deleteCouponServer(id)
    revalidate('/admin/coupons')
    return actionOk(true)
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getBlogPostsAction() {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchBlogPostsServer())
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getBlogPostAction(id: string) {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchBlogPostServer(id))
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function saveBlogPostAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    const savedId = await saveBlogPostServer(input, id)
    revalidate('/admin/blog', `/admin/blog/${savedId}/edit`)
    return actionOk(savedId)
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function deleteBlogPostAction(id: string) {
  try {
    await requirePanelAdmin()
    await deleteBlogPostServer(id)
    revalidate('/admin/blog')
    return actionOk(true)
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getBlogCategoriesAction() {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchBlogCategoriesServer())
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function saveBlogCategoryAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    return actionOk(await saveBlogCategoryServer(input, id))
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getBlogTagsAction() {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchBlogTagsServer())
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function saveBlogTagAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    return actionOk(await saveBlogTagServer(input, id))
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getBlogCommentsAction() {
  try {
    await requirePanelAdmin()
    return actionOk(await fetchBlogCommentsServer())
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function setBlogCommentApprovedAction(id: string, approved: boolean) {
  try {
    await requirePanelAdmin()
    await setBlogCommentApprovedServer(id, approved)
    revalidate('/admin/blog/comments')
    return actionOk(true)
  } catch (e) {
    return actionError(e instanceof Error ? e.message : 'خطا')
  }
}

export async function getPagesAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchPagesServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function savePageAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    const savedId = await savePageServer(input, id)
    revalidate('/admin/pages')
    return actionOk(savedId)
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function deletePageAction(id: string) {
  try {
    await requirePanelAdmin()
    await deletePageServer(id)
    revalidate('/admin/pages')
    return actionOk(true)
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getFaqsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchFaqsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function saveFaqAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    revalidate('/admin/faqs')
    return actionOk(await saveFaqServer(input, id))
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getMenusAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchMenusServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function saveMenuAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    revalidate('/admin/menus')
    return actionOk(await saveMenuServer(input, id))
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getBannersAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchBannersServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function saveBannerAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    revalidate('/admin/notices')
    return actionOk(await saveBannerServer(input, id))
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getRedirectsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchRedirectsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function saveRedirectAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    revalidate('/admin/seo/redirects')
    return actionOk(await saveRedirectServer(input, id))
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getSeoSettingsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchSeoSettingsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function saveSeoSettingAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    revalidate('/admin/seo/pages')
    return actionOk(await saveSeoSettingServer(input, id))
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getSupportTicketsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchSupportTicketsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function updateTicketStatusAction(id: string, status: string) {
  try {
    await requirePanelAdmin()
    await updateTicketStatusServer(id, status)
    revalidate('/admin/support/tickets')
    return actionOk(true)
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getBulkQuotesAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchBulkQuotesServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getKbArticlesAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchKbArticlesServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getMessageTemplatesAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchMessageTemplatesServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getContactMessagesAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchContactMessagesServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function markContactMessageAction(id: string, reply?: string) {
  try {
    await requirePanelAdmin()
    await markContactMessageReadServer(id, reply)
    revalidate('/admin/messages')
    return actionOk(true)
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getAuditLogsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchAuditLogsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getSettingsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchAllSettingsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function saveSettingsAction(entries: { key: string; value: unknown; group?: string }[]) {
  try {
    await requirePanelAdmin()
    await upsertSettingsServer(entries)
    revalidate('/admin/settings')
    return actionOk(true)
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getMediaAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchMediaServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function saveMediaAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    revalidate('/admin/media')
    return actionOk(await saveMediaServer(input, id))
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getProductReviewsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchProductReviewsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function setReviewApprovedAction(id: string, approved: boolean) {
  try {
    await requirePanelAdmin()
    await setReviewApprovedServer(id, approved)
    revalidate('/admin/products/reviews')
    return actionOk(true)
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getWebhooksAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchWebhooksServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function saveWebhookAction(input: Record<string, unknown>, id?: string) {
  try {
    await requirePanelAdmin()
    revalidate('/admin/webhooks')
    return actionOk(await saveWebhookServer(input, id))
  } catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getWebhookLogsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchWebhookLogsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getFramePricesAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchFramePricesServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getBuilderTiersAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchBuilderTiersServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getPayoutsAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchPayoutsServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

export async function getInvoicesAction() {
  try { await requirePanelAdmin(); return actionOk(await fetchInvoicesServer()) }
  catch (e) { return actionError(e instanceof Error ? e.message : 'خطا') }
}

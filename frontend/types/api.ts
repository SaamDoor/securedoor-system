export type IntegrationProvider =
  | 'zarinpal'
  | 'idpay'
  | 'nextpay'
  | 'sms_ir'
  | 'kavenegar'
  | 'melipayamak'
  | 'digikala'
  | 'basalam'
  | 'torob'
  | 'emallz'
  | 'custom'

export type IntegrationCategory =
  | 'payment'
  | 'sms'
  | 'marketplace'
  | 'shipping'
  | 'analytics'
  | 'crm'
  | 'custom'

export interface Integration {
  id: string
  name: string
  slug: string
  provider: IntegrationProvider
  category: IntegrationCategory
  description?: string
  logoUrl?: string
  isActive: boolean
  isConfigured: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiConfiguration {
  id: string
  integrationId: string
  integration: Integration
  name: string
  baseUrl: string
  token?: string
  secretKey?: string
  merchantId?: string
  extraHeaders?: Record<string, string>
  extraParams?: Record<string, string>
  sandboxMode: boolean
  isActive: boolean
  lastTestedAt?: string
  testResult?: 'success' | 'failure'
  createdAt: string
  updatedAt: string
}

export type WebhookEvent =
  | 'order_created'
  | 'order_updated'
  | 'order_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'user_registered'
  | 'product_created'
  | 'product_updated'
  | 'inventory_changed'
  | 'review_submitted'

export interface Webhook {
  id: string
  name: string
  url: string
  secret?: string
  events: WebhookEvent[]
  isActive: boolean
  retryCount: number
  maxRetries: number
  lastTriggeredAt?: string
  successCount: number
  failureCount: number
  createdAt: string
  updatedAt: string
}

export interface WebhookLog {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: Record<string, unknown>
  responseStatus?: number
  responseBody?: string
  duration?: number
  success: boolean
  attempt: number
  createdAt: string
}

export interface AdminDashboardStats {
  revenue: {
    today: number
    week: number
    month: number
    year: number
    growth: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    completed: number
    cancelled: number
  }
  users: {
    total: number
    newToday: number
    newWeek: number
    newMonth: number
  }
  products: {
    total: number
    active: number
    outOfStock: number
    lowStock: number
  }
  inventory: {
    totalItems: number
    lowStockAlerts: number
    outOfStockItems: number
  }
}

export interface RevenueChartData {
  date: string
  revenue: number
  orders: number
}

export interface CategorySalesData {
  categoryName: string
  sales: number
  revenue: number
  percentage: number
}

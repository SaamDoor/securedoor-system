import type { Address } from './common'
import type { User } from './auth'
import type { Product } from './product'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'on_hold'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial'

export type PaymentMethod =
  | 'online'
  | 'card_to_card'
  | 'bank_transfer'
  | 'cash_on_delivery'
  | 'installment'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Pick<Product, 'id' | 'name' | 'slug' | 'images' | 'sku'>
  quantity: number
  unitPrice: number
  totalPrice: number
  discount: number
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  status: OrderStatus
  note?: string
  createdBy?: string
  createdAt: string
}

export interface Payment {
  id: string
  orderId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  gateway?: string
  paidAt?: string
  failureReason?: string
  createdAt: string
}

export interface Invoice {
  id: string
  orderId: string
  invoiceNumber: string
  fileUrl?: string
  issuedAt: string
  dueDate?: string
  totalAmount: number
  taxAmount: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>
  items: OrderItem[]
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  shippingAddress: Address
  billingAddress?: Address
  subtotal: number
  discount: number
  shippingCost: number
  tax: number
  total: number
  couponCode?: string
  customerNote?: string
  adminNote?: string
  trackingCode?: string
  shippingProvider?: string
  estimatedDelivery?: string
  deliveredAt?: string
  payments: Payment[]
  invoice?: Invoice
  statusHistory: OrderStatusHistory[]
  files?: string[]
  createdAt: string
  updatedAt: string
}

export interface ShippingMethod {
  id: string
  name: string
  description?: string
  price: number
  estimatedDays: number
  isActive: boolean
  minOrderAmount?: number
  freeShippingThreshold?: number
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  startDate?: string
  endDate?: string
  isActive: boolean
  userId?: string
}

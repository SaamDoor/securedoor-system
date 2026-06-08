import type { CustomerTier } from './auth'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  birthDate?: string
  nationalId?: string
  company?: string
  website?: string
  createdAt: string
  customerTier?: CustomerTier
  specialDiscountPercent?: number
}

export interface UserStats {
  totalOrders: number
  totalSpent: number
  totalReviews: number
  wishlistCount: number
  pendingOrders: number
}

export interface ChatSession {
  id: string
  userId: string
  agentId?: string
  status: 'open' | 'closed' | 'pending'
  subject?: string
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  senderId: string
  senderType: 'user' | 'agent' | 'system'
  content: string
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  isRead: boolean
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface Download {
  id: string
  userId: string
  productId?: string
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  downloadCount: number
  lastDownloadedAt?: string
  expiresAt?: string
}

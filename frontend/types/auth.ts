export type UserRole = 'super_admin' | 'admin' | 'manager' | 'support' | 'customer'

export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: PermissionAction
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage'

export interface Role {
  id: string
  name: string
  slug: UserRole
  permissions: Permission[]
  isSystem: boolean
}

export interface Session {
  id: string
  userId: string
  deviceInfo: string
  ipAddress: string
  lastActiveAt: string
  expiresAt: string
  isActive: boolean
}

import axios from 'axios'
import type { ApiError } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'fa',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('samdoor-auth')
    if (stored) {
      try {
        const { state } = JSON.parse(stored)
        if (state?.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${state.tokens.accessToken}`
        }
      } catch {
        // Ignore parse errors
      }
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const stored = sessionStorage.getItem('samdoor-auth')
        if (stored) {
          const { state } = JSON.parse(stored)
          const refreshToken = state?.tokens?.refreshToken

          if (refreshToken) {
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            })
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
            return apiClient(originalRequest)
          }
        }
      } catch {
        // Refresh failed — redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message ?? error.message ?? 'خطای نامشخص',
      errors: error.response?.data?.errors,
      statusCode: error.response?.status ?? 500,
    }

    return Promise.reject(apiError)
  },
)

export default apiClient

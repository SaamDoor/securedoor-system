import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: User, tokens: AuthTokens) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth(user, tokens) {
        set({ user, tokens, isAuthenticated: true, isLoading: false })
      },

      setUser(user) {
        set({ user })
      },

      clearAuth() {
        set({ user: null, tokens: null, isAuthenticated: false })
      },

      setLoading(loading) {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'samdoor-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, tokens: state.tokens, isAuthenticated: state.isAuthenticated }),
    },
  ),
)

import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

type AuthState = {
  username: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  username: localStorage.getItem('auth_username'),
  isAuthenticated: Boolean(localStorage.getItem('access_token')),
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true })
    try {
      const { data } = await apiClient.post('/token/', { username, password })
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('auth_username', username)

      try {
        const statusRes = await apiClient.get('/system-status/')
        if (statusRes.data.setup_completed) {
          localStorage.setItem('setup_completed', 'true')
        } else {
          localStorage.removeItem('setup_completed')
        }
      } catch (e) {
        console.error('Failed to check system status', e)
      }

      set({ username, isAuthenticated: true, isLoading: false })
    } catch (error: unknown) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ isLoading: false })
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response: { data: { detail?: string } } }).response?.data
              ?.detail ?? 'اسم المستخدم أو كلمة المرور غير صحيحة'
          : 'تعذر الاتصال بالخادم'
      throw new Error(message, { cause: error })
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_username')
    set({ username: null, isAuthenticated: false })
  },
}))

import { create } from 'zustand'

type AppState = {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
}

const storedTheme = localStorage.getItem('app_theme') === 'dark' ? 'dark' : 'light'
document.documentElement.classList.toggle('dark', storedTheme === 'dark')

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  theme: storedTheme,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('app_theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
      return { theme }
    }),
}))

// src/stores/settingsStore.ts
import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface SettingsState {
  theme: Theme
  toggleTheme: () => void
}

export const useSettings = create<SettingsState>((set) => ({
  // 初期値は localStorage から取得、なければ 'light'
  theme:
    (typeof window !== 'undefined'
      ? (localStorage.getItem('theme') as Theme | null)
      : null) || 'light',
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'light' ? 'dark' : 'light'
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', next)
        document.documentElement.setAttribute('data-theme', next)
      }
      return { theme: next }
    }),
}))

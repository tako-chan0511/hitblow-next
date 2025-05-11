// src/components/ThemeToggle.tsx
'use client'

import { useEffect } from 'react'
import { useSettings } from '@/stores/settingsStore'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useSettings()

  // マウント時にも属性を同期
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? 'ライトモード' : 'ダークモード'}
    </button>
  )
}

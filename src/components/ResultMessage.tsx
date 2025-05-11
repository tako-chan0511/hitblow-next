// src/components/ResultMessage.tsx
'use client'

import React from 'react'
import { useGameStore } from '@/stores/gameStore'
import styles from './ResultMessage.module.css'

type ResultMessageProps = {}

export default function ResultMessage({}: ResultMessageProps) {
  const message = useGameStore(state => state.message)
  if (!message) return null

  return (
    <p className={styles.message}>{message}</p>
  )
}

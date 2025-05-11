// src/components/GuessInput.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useGameStore } from '@/stores/gameStore'
import styles from './GuessInput.module.css'

type GuessInputProps = {}

export default function GuessInput({}: GuessInputProps) {
  const digitCount = useGameStore(state => state.digitCount)
  const checkGuess = useGameStore(state => state.checkGuess)

  const [digits, setDigits] = useState<string[]>(Array(digitCount).fill(''))
  const [pasteValue, setPasteValue] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [currentIdx, setCurrentIdx] = useState<number | null>(null)
  const [pickerVisible, setPickerVisible] = useState(false)

  // 初期化 or 桁数変更時にスロットリセット
  useEffect(() => {
    setDigits(Array(digitCount).fill(''))
    setPasteValue('')
  }, [digitCount])

  const numbers = useMemo(() => Array.from({ length: 10 }, (_, i) => i), [])

  // スロット操作
  function openPicker(idx: number) {
    setCurrentIdx(idx)
    setPickerVisible(true)
  }
  function closePicker() {
    setPickerVisible(false)
    setCurrentIdx(null)
  }
  function selectDigit(n: number) {
    if (currentIdx === null) return
    const arr = [...digits]
    arr[currentIdx] = String(n)
    setDigits(arr)
    closePicker()
  }
  function clearDigit() {
    if (currentIdx === null) return
    const arr = [...digits]
    arr[currentIdx] = ''
    setDigits(arr)
    closePicker()
  }

  // 貼付処理
  function pasteInput() {
    const str = pasteValue.trim()
    if (str.length !== digitCount) {
      alert(`${digitCount}桁の文字列を貼り付けてください`)
      return
    }
    if (!/^\d+$/.test(str) || new Set(str).size !== digitCount) {
      alert('重複なく数字のみを貼り付けてください')
      return
    }
    setDigits(str.split(''))
  }

  // バリデーション
  const isValid = useMemo(
    () => digits.every(d => d !== '') && new Set(digits).size === digitCount,
    [digits, digitCount]
  )

  // 判定実行
  async function submitGuess() {
    if (!isValid || loading) return
    setLoading(true)
    const start = Date.now()
    const triggerTimeout = window.setTimeout(() => setShowTimer(true), 3000)
    const timerInterval = window.setInterval(() => {
      setElapsedMs(Date.now() - start)
    }, 100)

    // 次の更新サイクル
    await new Promise(r => setTimeout(r, 0))

    // ストアへ判定
    await checkGuess(digits.join(''))

    // リセット
    setDigits(Array(digitCount).fill(''))
    setPasteValue('')

    clearTimeout(triggerTimeout)
    clearInterval(timerInterval)
    setLoading(false)
    setShowTimer(false)
    setElapsedMs(0)
  }

  const formattedTime = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000)
    const ms = elapsedMs % 1000
    return `${s}.${String(ms).padStart(3, '0')} 秒`
  }, [elapsedMs])

  return (
    <div className={styles.wrapper}>
      <div className={styles.slots}>
        {digits.map((digit, idx) => (
          <div
            key={idx}
            className={styles.slot}
            onClick={() => openPicker(idx)}
          >
            {digit || 'ー'}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <div className={styles.pasteInputContainer}>
          <input
            className={styles.pasteInput}
            value={pasteValue}
            onChange={e => setPasteValue(e.target.value)}
            placeholder={`${digitCount}桁の数字を貼り付け`}
            maxLength={digitCount}
          />
          <button
            className={styles.pasteBtn}
            disabled={loading}
            onClick={pasteInput}
          >
            貼付
          </button>
        </div>
        <button
          className={styles.submitBtn}
          disabled={!isValid || loading}
          onClick={submitGuess}
        >
          判定
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <p>判定中…</p>
          {showTimer && <p>経過時間: {formattedTime}</p>}
        </div>
      )}

      {pickerVisible && (
        <div className={styles.pickerOverlay} onClick={closePicker}>
          <div
            className={styles.pickerPanel}
            onClick={e => e.stopPropagation()}
          >
            {numbers.map(n => (
              <button
                key={n}
                className={styles.pickerBtn}
                onClick={() => selectDigit(n)}
                disabled={digits.includes(String(n))}
              >
                {n}
              </button>
            ))}
            <button
              className={`${styles.pickerBtn} ${styles.deleteBtn}`}
              onClick={clearDigit}
            >
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

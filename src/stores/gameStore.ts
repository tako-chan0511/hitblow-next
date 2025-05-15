// src/stores/gameStore.ts
import { create } from 'zustand'
import { addResult } from '@/lib/db'

/**
 * 重複なしランダム文字列を生成
 */
function generateSecret(digitCount: number): string {
  const numbers = Array.from({ length: 10 }, (_, i) => i.toString())
  return Array.from({ length: digitCount }, () => {
    const idx = Math.floor(Math.random() * numbers.length)
    return numbers.splice(idx, 1)[0]
  }).join('')
}

/**
 * 全候補をビットマスク＋キャッシュ方式で生成
 */
const candidateCache: Record<number, string[]> = {}
function allCandidatesFast(digitCount: number): string[] {
  if (candidateCache[digitCount]) return candidateCache[digitCount]
  const res: string[] = []
  function dfs(prefix: string, mask: number) {
    if (prefix.length === digitCount) {
      res.push(prefix)
      return
    }
    for (let d = 0; d < 10; d++) {
      if (!(mask & (1 << d))) dfs(prefix + d.toString(), mask | (1 << d))
    }
  }
  dfs('', 0)
  candidateCache[digitCount] = res
  return res
}

export interface HistoryEntry { guess: string; hit: number; blow: number }

export interface GameState {
  digitCount: number
  secret: string
  history: HistoryEntry[]
  message: string
  candidates: string[]
  candidatesHistory: string[][]
  startTime: number

  // 新規: 入力スロット用 state
  currentGuess: string[]
  setCurrentGuess: (digits: string[]) => void

  setDigitCount: (n: number) => void
  reset: () => void
  checkGuess: (guess: string) => Promise<void>
  rollbackTo: (index: number) => void
  remainingCandidatesAt: (index: number) => number
}

export const useGameStore = create<GameState>((set, get) => ({
  digitCount: 4,
  secret: generateSecret(4),
  history: [],
  message: '',
  candidates: allCandidatesFast(4),
  candidatesHistory: [allCandidatesFast(4)],
  startTime: Date.now(),

  // 初期入力スロットを空文字で埋める
  currentGuess: Array(4).fill(''),
  setCurrentGuess: (digits) => set({ currentGuess: digits }),

  setDigitCount: (n) => {
    const cnt = Math.max(1, Math.min(10, n))
    const init = allCandidatesFast(cnt)
    set({
      digitCount: cnt,
      secret: generateSecret(cnt),
      history: [],
      message: '',
      candidates: init,
      candidatesHistory: [init],
      startTime: Date.now(),
      currentGuess: Array(cnt).fill(''),
    })
  },

  reset: () => {
    const cnt = get().digitCount
    const init = allCandidatesFast(cnt)
    set({
      secret: generateSecret(cnt),
      history: [],
      message: '',
      candidates: init,
      candidatesHistory: [init],
      startTime: Date.now(),
      currentGuess: Array(cnt).fill(''),
    })
  },

  checkGuess: async (guess) => {
    const { digitCount, secret, history, candidates, candidatesHistory } = get()
    let hit = 0; let blow = 0
    for (let i = 0; i < digitCount; i++) {
      if (guess[i] === secret[i]) hit++
      else if (secret.includes(guess[i])) blow++
    }
    const newHistory = [...history, { guess, hit, blow }]
    const newCands = candidates.filter(candidate => {
      let h = 0, b = 0
      for (let i = 0; i < digitCount; i++) {
        if (candidate[i] === guess[i]) h++
        else if (guess.includes(candidate[i])) b++
      }
      return h === hit && b === blow
    })
    const newCandHist = [...candidatesHistory, newCands]
    const msg = hit === digitCount
      ? `正解！秘密の数字は ${secret} でした。`
      : `${hit} Hit, ${blow} Blow`
    set({ history: newHistory, candidates: newCands, candidatesHistory: newCandHist, message: msg })
    if (hit === digitCount) {
      const elapsed = Date.now() - get().startTime
      await addResult(digitCount, newHistory.length, elapsed)
    }
  },

  rollbackTo: (index) => {
    const hist = get().history.slice(0, index)
    const candHist = get().candidatesHistory.slice(0, index + 1)
    const currentCands = candHist[candHist.length - 1]
    set({ history: hist, candidatesHistory: candHist, candidates: currentCands, message: '' })
  },

  remainingCandidatesAt: (index) => {
    const hist = get().candidatesHistory
    return hist[index + 1]?.length ?? 0
  },
}))

// src/pages/index.tsx
import { useState, useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useSettings } from "@/stores/settingsStore";
import GuessInput from "@/components/GuessInput";
import ResultMessage from "@/components/ResultMessage";
import HistoryList from "@/components/HistoryList";
import CandidateList from "@/components/CandidateList";
import ResultHistory from "@/components/ResultHistory";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "@/styles/Home.module.css"; // 任意の CSS モジュール

export default function Home() {
  const store = useGameStore();
  const { theme } = useSettings();
  const [showCands, setShowCands] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // ページごとにテーマ属性を適用
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <main className={styles.container}>
      <header className={styles.appHeader}>
        <h1>Hit & Blow Next.js版 ({store.digitCount}桁)</h1>
        <ThemeToggle />
      </header>

      <p>{store.digitCount}桁の数字を当ててください（各桁異なる）</p>
      <div className={styles.digitSelect}>
        <label htmlFor="digitCount">桁数:</label>
        <select
          id="digitCount"
          value={store.digitCount}
          onChange={(e) => store.setDigitCount(+e.target.value)}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}桁
            </option>
          ))}
        </select>
      </div>

      <GuessInput />
      <ResultMessage />
      <HistoryList />

      <div className={styles.buttonRow}>
        <button className={styles.showCands} onClick={() => setShowCands(true)}>
          残り候補を表示
        </button>
        <button className={styles.reset} onClick={store.reset}>
          再スタート
        </button>
        <button
          className={styles.historyBtn}
          onClick={() => setShowHistory((s) => !s)}
        >
          {showHistory ? "履歴を閉じる" : "プレイ履歴を表示"}
        </button>
      </div>

      {showCands && <CandidateList onClose={() => setShowCands(false)} />}
      {showHistory && <ResultHistory />}
    </main>
  );
}

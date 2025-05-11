"use client";

import GuessInput from "@/components/GuessInput";
import ResultMessage from "@/components/ResultMessage";
import HistoryList from "@/components/HistoryList";
import CandidateList from "@/components/CandidateList";
import ResultHistory from "@/components/ResultHistory";
import ThemeToggle from "@/components/ThemeToggle";
import { useGameStore } from "@/stores/gameStore";
import { useSettings } from "@/stores/settingsStore";
import { useState, useEffect } from "react";

export default function Page() {
  const store = useGameStore();
  const { theme } = useSettings();
  const [showCands, setShowCands] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // テーマ適用
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <main className="container">
      <header className="app-header">
        <h1>Hit & Blow Next.js版!!! ({store.digitCount}桁)</h1>
        <ThemeToggle />
      </header>

      <p>{store.digitCount}桁の数字を当ててください（各桁異なる）</p>

      <div className="digit-select">
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

      {/* ボタンを横並びに */}
      <div className="flex justify-center gap-3 mt-5">
        <button className="show-cands" onClick={() => setShowCands(true)}>
          残り候補を表示
        </button>
        <button className="reset" onClick={() => store.reset()}>
          再スタート
        </button>
        <button
          className="history-btn"
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

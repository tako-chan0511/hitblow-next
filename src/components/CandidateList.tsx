"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";
import styles from "./CandidateList.module.css";

type CandidateListProps = {
  onClose: () => void;
};

export default function CandidateList({ onClose }: CandidateListProps) {
  const remainingCandidates = useGameStore((state) => state.candidates);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    let triggerTimeout: ReturnType<typeof setTimeout>;
    let timerInterval: ReturnType<typeof setInterval>;

    async function generate() {
      // 3秒後にタイマー開始
      triggerTimeout = setTimeout(() => {
        setShowTimer(true);
        const start = Date.now();
        timerInterval = setInterval(() => {
          setElapsedMs(Date.now() - start);
        }, 100);
      }, 3000);

      // 非同期で候補取得（Vue版と同じく即時）
      await new Promise((resolve) => setTimeout(resolve, 0));
      setCandidates(remainingCandidates);

      // 停止＆終了
      clearTimeout(triggerTimeout);
      clearInterval(timerInterval);
      setLoading(false);
    }

    generate();

    return () => {
      clearTimeout(triggerTimeout);
      clearInterval(timerInterval);
    };
  }, [remainingCandidates]);

  const formattedTime = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000);
    const ms = elapsedMs % 1000;
    return `${s}.${String(ms).padStart(3, "0")} 秒`;
  }, [elapsedMs]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          閉じる
        </button>

        {!loading ? (
          <>
            <h2>残り候補 ({candidates.length})</h2>
            <div className={styles.list}>
              {candidates.map((num) => (
                <span key={num} className={styles.listItem}>
                  {num}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.loading}>
            <p>候補を生成中…</p>
            {showTimer && <p>経過時間: {formattedTime}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

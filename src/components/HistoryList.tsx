// src/components/HistoryList.tsx
"use client";

import React from "react";
import { useGameStore } from "@/stores/gameStore";
import styles from "./HistoryList.module.css";

type HistoryEntry = {
  guess: string;
  hit: number;
  blow: number;
};

type HistoryListProps = {};

export default function HistoryList({}: HistoryListProps) {
  const history = useGameStore((state) => state.history);
  const remainingCandidatesAt = useGameStore(
    (state) => state.remainingCandidatesAt
  );
  const rollbackTo = useGameStore((state) => state.rollbackTo);

  const confirmRollback = (index: number) => {
    const label =
      index > 0
        ? `${index + 1}回目からやり直しますか？`
        : "最初からやり直しますか？";
    if (window.confirm(`${label}\n以降の履歴は削除されます。`)) {
      rollbackTo(index);
    }
  };

  return (
    <div className={styles.container}>
      <h2>履歴</h2>
      {history.length === 0 ? (
        <p>まだ履歴がありません。</p>
      ) : (
        <ul className={styles.list}>
          {history.map((entry: HistoryEntry, i: number) => (
            <li key={i} className={styles.entry}>
              <span className={styles.entryText}>
                {i + 1}回目: {entry.guess} - {entry.hit} Hit, {entry.blow} Blow
              </span>
              <span className={styles.remaining}>
                残り候補: {remainingCandidatesAt(i)}
              </span>
              <button
                className={styles.rollbackBtn}
                onClick={() => confirmRollback(i)}
              >
                ↓ ここ以降を取り消す
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

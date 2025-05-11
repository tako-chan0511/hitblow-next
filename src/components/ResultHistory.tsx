// src/components/ResultHistory.tsx
"use client";

import React, { useEffect, useState } from "react";
import { fetchResults, deleteResult } from "@/lib/db";
import styles from "./ResultHistory.module.css";

type Result = {
  id: number;
  digit_count: number;
  attempts: number;
  elapsed_ms: number;
  played_at: string;
};

export default function ResultHistory() {
  const [results, setResults] = useState<Result[]>([]);

  const load = async () => {
    const res = await fetchResults();
    setResults(res);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm("本当にこの履歴を削除しますか？")) return;
    await deleteResult(id);
    load();
  };

  return (
    <div className={styles.container}>
      <h2>プレイ履歴</h2>
      {results.length === 0 ? (
        <p>まだ履歴がありません。</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.cell}>操作</th>
              <th className={styles.cell}>桁数</th>
              <th className={styles.cell}>回数</th>
              <th className={styles.cell}>時間 (秒)</th>
              <th className={styles.cell}>日時</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.id}>
                <td className={styles.cell}>
                  <button
                    className={styles.delBtn}
                    onClick={() => onDelete(row.id)}
                  >
                    削除
                  </button>
                </td>
                <td className={styles.cell}>{row.digit_count}</td>
                <td className={styles.cell}>{row.attempts}</td>
                <td className={styles.cell}>
                  {(row.elapsed_ms / 1000).toFixed(2)}
                </td>
                <td className={styles.cell}>
                  {new Date(row.played_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

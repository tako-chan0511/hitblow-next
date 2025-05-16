// src/components/CandidateList.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";
import styles from "./CandidateList.module.css";

type CandidateListProps = {
  onClose: () => void;
  onSelectCandidate?: (candidate: string) => void;
};

export default function CandidateList({
  onClose,
  onSelectCandidate,
}: CandidateListProps) {
  const setDigits = useGameStore((s) => s.setCurrentGuess);
  const remainingCandidates = useGameStore((s) => s.candidates);
  const digitCount = useGameStore((s) => s.digitCount);
  const secret = useGameStore((s) => s.secret);

  const [loading, setLoading] = useState(true);
  const [filterSlots, setFilterSlots] = useState<string[]>([]);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);

  const [showTimer, setShowTimer] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // ★ ヒント数のステート
  const [hintCount, setHintCount] = useState<number>(0);

  // ローディングタイマー
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;
    timeoutId = setTimeout(() => {
      setShowTimer(true);
      const start = Date.now();
      intervalId = setInterval(() => setElapsedMs(Date.now() - start), 100);
    }, 3000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [remainingCandidates]);

  // 初期フィルタースロット生成
  useEffect(() => {
    if (remainingCandidates.length > 0) {
      setFilterSlots(Array(digitCount).fill(""));
      setLoading(false);
    }
  }, [remainingCandidates, digitCount]);

  // ★ hintCount が変わったら、filterSlots に直接ヒントを埋め込む
  useEffect(() => {
    const newSlots = Array(digitCount).fill("");
    if (hintCount > 0) {
      // 乱数でヒント位置を選択
      const indices = Array.from({ length: digitCount }, (_, i) => i);
      for (let k = 0; k < hintCount && indices.length > 0; k++) {
        const rnd = Math.floor(Math.random() * indices.length);
        const pos = indices.splice(rnd, 1)[0];
        newSlots[pos] = secret[pos];
      }
    }
    setFilterSlots(newSlots);
    // pickerIdxリセット
    setPickerIdx(null);
  }, [hintCount, digitCount, secret]);

  // フィルタリング
  const displayed = useMemo(() => {
    if (filterSlots.every((d) => d === "")) return remainingCandidates;
    return remainingCandidates.filter((num) =>
      filterSlots.every((d, i) => d === "" || num[i] === d)
    );
  }, [remainingCandidates, filterSlots]);

  const displayedLimited = useMemo(() => displayed.slice(0, 1000), [displayed]);
  const allowButtons = displayed.length <= 10;

  const formattedTime = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000);
    const ms = elapsedMs % 1000;
    return `${s}.${String(ms).padStart(3, "0")} 秒`;
  }, [elapsedMs]);

  const numbers = useMemo(
    () => Array.from({ length: 10 }, (_, i) => String(i)),
    []
  );

  function selectFilter(digit: string, idx: number) {
    setFilterSlots((prev) => {
      const arr = [...prev];
      arr[idx] = digit;
      return arr;
    });
    setPickerIdx(null);
  }

  function handleSelect(num: string) {
    if (onSelectCandidate) onSelectCandidate(num);
    else setDigits(num.split(""));
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          閉じる
        </button>

        {!loading ? (
          <>
            {/* ヒントプルダウン */}
            <div className={styles.hintControls}>
              <label htmlFor="hintCount">ヒント数:</label>
              <select
                id="hintCount"
                value={hintCount}
                onChange={(e) => setHintCount(Number(e.target.value))}
              >
                <option value={0}>なし</option>
                {Array.from({ length: digitCount }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* フィルタースロット */}
            <div className={styles.filterSlots}>
              {filterSlots.map((digit, idx) => (
                <div key={idx} className={styles.slotWrapper}>
                  <button
                    className={styles.filterSlot}
                    onClick={() => setPickerIdx(pickerIdx === idx ? null : idx)}
                  >
                    {digit || "ー"}
                  </button>
                  {pickerIdx === idx && (
                    <div className={styles.filterPickerPanel}>
                      {numbers.map((num) => (
                        <button
                          key={num}
                          className={styles.filterPickerBtn}
                          disabled={filterSlots.includes(num)}
                          onClick={() => selectFilter(num, idx)}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        className={styles.filterPickerClear}
                        disabled={filterSlots[idx] === ""}
                        onClick={() => selectFilter("", idx)}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 件数＆表示 */}
            <h2>残り候補 ({displayed.length})</h2>
            {displayed.length > 1000 && (
              <p className={styles.limitNotice}>
                ※先頭1000件のみ表示しています
              </p>
            )}
            {allowButtons && (
              <p className={styles.buttonNotice}>
                候補が10件以下になりました。番号をクリックしてください。
              </p>
            )}

            {/* 候補リスト */}
            <div className={styles.list}>
              {allowButtons
                ? displayed.map((num) => (
                    <button
                      key={num}
                      className={styles.listItemButton}
                      style={{ backgroundColor: "#4a90e2", color: "#fff" }}
                      onClick={() => handleSelect(num)}
                    >
                      {num}
                    </button>
                  ))
                : displayedLimited.map((num) => (
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

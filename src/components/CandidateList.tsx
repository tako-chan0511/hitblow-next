"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";
import styles from "./CandidateList.module.css";

type CandidateListProps = {
  onClose: () => void;
};

export default function CandidateList({ onClose }: CandidateListProps) {
  const remainingCandidates = useGameStore((s) => s.candidates);
  const [loading, setLoading] = useState(true);
  const [filterSlots, setFilterSlots] = useState<string[]>([]);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // 1) 候補が更新されたらフィルタースロット初期化
  useEffect(() => {
    if (remainingCandidates.length > 0) {
      setFilterSlots(Array(remainingCandidates[0].length).fill(""));
      setLoading(false);
    }
  }, [remainingCandidates]);

  // 2) ローディング演出
  useEffect(() => {
    let to: ReturnType<typeof setTimeout>;
    let iv: ReturnType<typeof setInterval>;
    to = setTimeout(() => {
      setShowTimer(true);
      const start = Date.now();
      iv = setInterval(() => setElapsedMs(Date.now() - start), 100);
    }, 3000);
    return () => {
      clearTimeout(to);
      clearInterval(iv);
    };
  }, [remainingCandidates]);

  // 3) 絞り込み
  const displayed = useMemo(() => {
    if (filterSlots.every((d) => d === "")) return remainingCandidates;
    return remainingCandidates.filter((num) =>
      filterSlots.every((d, i) => d === "" || num[i] === d)
    );
  }, [remainingCandidates, filterSlots]);

  // スロット選択時
  const onSlotClick = (idx: number) => {
    setPickerIdx(pickerIdx === idx ? null : idx);
  };
  // ポップアップの値選択／クリア
  const selectFilter = (digit: string, idx: number) => {
    setFilterSlots((prev) => {
      const arr = [...prev];
      arr[idx] = digit;
      return arr;
    });
    setPickerIdx(null);
  };

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
            <div className={styles.filterSlots}>
              {filterSlots.map((digit, idx) => (
                <div key={idx} className={styles.slotWrapper}>
                  <button
                    className={styles.filterSlot}
                    onClick={() => onSlotClick(idx)}
                  >
                    {digit === "" ? "―" : digit}
                  </button>

                  {pickerIdx === idx && (
                    <div className={styles.filterPickerPanel}>
                      {/* 0-9 */}
                      {Array.from({ length: 10 }, (_, i) => (
                        <button
                          key={i}
                          className={styles.filterPickerBtn}
                          onClick={() => selectFilter(String(i), idx)}
                        >
                          {i}
                        </button>
                      ))}
                      {/* 削除 */}
                      <button
                        className={styles.filterPickerClear}
                        onClick={() => selectFilter("", idx)}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h2>残り候補 ({displayed.length})</h2>
            <div className={styles.list}>
              {displayed.map((num) => (
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

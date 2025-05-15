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
  // fallback: directly update store if callback absent
  const setDigits = useGameStore((s) => s.setCurrentGuess);

  const remainingCandidates = useGameStore((s) => s.candidates);
  const [loading, setLoading] = useState(true);
  const [filterSlots, setFilterSlots] = useState<string[]>([]);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Debug: ensure prop is passed
  useEffect(() => {
    console.log("CandidateList onSelectCandidate prop:", onSelectCandidate);
  }, [onSelectCandidate]);

  // Initialize filterSlots when candidates load
  useEffect(() => {
    if (remainingCandidates.length > 0) {
      setFilterSlots(Array(remainingCandidates[0].length).fill(""));
      setLoading(false);
    }
  }, [remainingCandidates]);

  // Loading timer
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

  // Filter logic
  const displayed = useMemo(() => {
    if (filterSlots.every((d) => d === "")) return remainingCandidates;
    return remainingCandidates.filter((num) =>
      filterSlots.every((d, i) => d === "" || num[i] === d)
    );
  }, [remainingCandidates, filterSlots]);

  // Performance: cap at 1000
  const displayedLimited = useMemo(() => displayed.slice(0, 1000), [displayed]);

  // Format elapsed
  const formattedTime = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000);
    const ms = elapsedMs % 1000;
    return `${s}.${String(ms).padStart(3, "0")} 秒`;
  }, [elapsedMs]);

  // Button mode when <=10
  const allowButtons = displayed.length <= 10;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          閉じる
        </button>

        {!loading ? (
          <>
            {/* Filter slots */}
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
                      {Array.from({ length: 10 }, (_, i) => String(i)).map(
                        (num) => (
                          <button
                            key={num}
                            className={styles.filterPickerBtn}
                            disabled={filterSlots.includes(num)}
                            onClick={() => {
                              setFilterSlots((prev) => {
                                const arr = [...prev];
                                arr[idx] = num;
                                return arr;
                              });
                              setPickerIdx(null);
                            }}
                          >
                            {num}
                          </button>
                        )
                      )}
                      <button
                        className={styles.filterPickerClear}
                        disabled={filterSlots[idx] === ""}
                        onClick={() => {
                          setFilterSlots((prev) => {
                            const arr = [...prev];
                            arr[idx] = "";
                            return arr;
                          });
                          setPickerIdx(null);
                        }}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Count & notice */}
            <h2>残り候補 ({displayed.length})</h2>
            {displayed.length > 1000 && (
              <p className={styles.limitNotice}>
                ※先頭1000件のみ表示しています
              </p>
            )}

            {/* When <=10 show message */}
            {allowButtons && (
              <p className={styles.buttonNotice}>
                候補が10件以下になりました。番号を選択してください。
              </p>
            )}

            {/* Candidate list */}
            <div className={styles.list}>
              {allowButtons
                ? displayed.map((num) => (
                    <button
                      key={num}
                      className={styles.listItemButton}
                      style={{ backgroundColor: "#4a90e2", color: "#fff" }}
                      onClick={() => {
                        console.log("CandidateList clicked:", num);
                        if (onSelectCandidate) {
                          onSelectCandidate(num);
                        } else {
                          setDigits(num.split(""));
                        }
                        onClose();
                      }}
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

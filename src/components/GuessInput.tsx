// src/components/GuessInput.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";
import CandidateList from "./CandidateList";
import styles from "./GuessInput.module.css";

type GuessInputProps = {};

export default function GuessInput({}: GuessInputProps) {
  // ゲーム設定・判定アクション
  const digitCount = useGameStore((s) => s.digitCount);
  const checkGuess = useGameStore((s) => s.checkGuess);

  // グローバル入力スロット state
  const digits = useGameStore((s) => s.currentGuess);
  const setDigits = useGameStore((s) => s.setCurrentGuess);

  // 候補一覧モーダル表示 state
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);

  // 判定用ステート
  const [pasteValue, setPasteValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  // 桁数変更時に入力スロットをリセット
  useEffect(() => {
    setDigits(Array(digitCount).fill(""));
    setPasteValue("");
  }, [digitCount, setDigits]);

  // 数字ピッカー用数字リスト
  const numbers = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);

  // スロットピッカー操作
  function openPicker(idx: number) {
    setCurrentIdx(idx);
    setPickerVisible(true);
  }
  function closePicker() {
    setPickerVisible(false);
    setCurrentIdx(null);
  }
  function selectDigit(n: number) {
    if (currentIdx === null) return;
    const newDigits = [...digits];
    newDigits[currentIdx] = String(n);
    setDigits(newDigits);
    closePicker();
  }
  function clearDigit() {
    if (currentIdx === null) return;
    const newDigits = [...digits];
    newDigits[currentIdx] = "";
    setDigits(newDigits);
    closePicker();
  }

  // 候補選択ハンドラ
  function handleSelectCandidate(candidate: string) {
    console.log("GuessInput received candidate:", candidate);
    setDigits(candidate.split(""));
    setCandidateModalVisible(false);
  }

  // 貼付処理
  function pasteInput() {
    const str = pasteValue.trim();
    if (str.length !== digitCount) {
      alert(`${digitCount}桁の文字列を貼り付けてください`);
      return;
    }
    if (!/^\d+$/.test(str) || new Set(str).size !== digitCount) {
      alert("重複なく数字のみを貼り付けてください");
      return;
    }
    setDigits(str.split(""));
  }

  // 判定ボタン有効化判定
  const isValid = useMemo(
    () => digits.every((d) => d !== "") && new Set(digits).size === digitCount,
    [digits, digitCount]
  );

  // 判定実行
  async function submitGuess() {
    if (!isValid || loading) return;
    setLoading(true);
    const start = Date.now();
    const timerTimeout = window.setTimeout(() => setShowTimer(true), 3000);
    const timerInterval = window.setInterval(
      () => setElapsedMs(Date.now() - start),
      100
    );

    // 次のレンダーサイクル後に判定
    await new Promise((r) => setTimeout(r, 0));
    await checkGuess(digits.join(""));

    // 入力スロットをリセット
    setDigits(Array(digitCount).fill(""));
    setPasteValue("");

    clearTimeout(timerTimeout);
    clearInterval(timerInterval);
    setLoading(false);
    setShowTimer(false);
    setElapsedMs(0);
  }

  // 経過時間フォーマット
  const formattedTime = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000);
    const ms = elapsedMs % 1000;
    return `${s}.${String(ms).padStart(3, "0")} 秒`;
  }, [elapsedMs]);

  return (
    <>
      <div className={styles.wrapper}>
        {/* 数字スロット */}
        <div className={styles.slots}>
          {digits.map((digit, idx) => (
            <div
              key={idx}
              className={styles.slot}
              onClick={() => openPicker(idx)}
            >
              {digit || "ー"}
            </div>
          ))}
        </div>

        {/* 貼付・判定エリア */}
        <div className={styles.actions}>
          <div className={styles.pasteInputContainer}>
            <input
              className={styles.pasteInput}
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
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

        {/* ローディング表示 */}
        {loading && (
          <div className={styles.loading}>
            <p>判定中…</p>
            {showTimer && <p>経過時間: {formattedTime}</p>}
          </div>
        )}

        {/* 数字ピッカー */}
        {pickerVisible && (
          <div className={styles.pickerOverlay} onClick={closePicker}>
            <div
              className={styles.pickerPanel}
              onClick={(e) => e.stopPropagation()}
            >
              {numbers.map((n) => (
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
                disabled={currentIdx === null || digits[currentIdx] === ""}
              >
                削除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 候補一覧モーダル */}
      {candidateModalVisible && (
        <CandidateList
          onClose={() => setCandidateModalVisible(false)}
          onSelectCandidate={handleSelectCandidate}
        />
      )}
    </>
  );
}

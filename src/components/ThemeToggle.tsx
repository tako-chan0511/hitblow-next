// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/stores/settingsStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();
  const [mounted, setMounted] = useState(false);

  // マウント時にのみ true に
  useEffect(() => {
    setMounted(true);
  }, []);

  // マウント前は空返しで SSR と同じままに
  if (!mounted) return null;

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {theme === "dark" ? "ライトモードへ切替" : "ダークモードへ切替"}
    </button>
  );
}

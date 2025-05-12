// src/app/head.tsx
import React from "react";

export default function Head() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "./";
  return (
    <>
      {/* development: "./" / production: "/hitblow-next/" */}
      <base href={base} />
      {/* テーマ復元スクリプト */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const t = localStorage.getItem('theme');
                if (t) document.documentElement.setAttribute('data-theme', t);
              } catch {}
            })();
          `,
        }}
      />
    </>
  );
}

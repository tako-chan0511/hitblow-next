// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hit & Blow",
  description: "ブラウザ上で遊べる Hit & Blow ゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // ビルド時に注入される環境変数
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "./";
  console.log(">>> base href is:", base);
  return (
    <html lang="ja">
      <head>
        {/* development では "./"、production では "/hitblow-next/" */}
        <base href={base} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const t = localStorage.getItem('theme');
                if (t) document.documentElement.setAttribute('data-theme', t);
              } catch {}
            })();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

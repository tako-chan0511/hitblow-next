import type { NextConfig } from "next";

// GitHub Pages のリポジトリ名（= サブパス）
// https://<user>.github.io/<repo>/
const repo = "hitblow-next";

const isGhPages = process.env.DEPLOY_TARGET === "GH_PAGES";
const basePath = isGhPages ? `/${repo}` : "";

// assetPrefix は末尾スラッシュ付きにして、_next 配下の結合を安定させる
const assetPrefix = isGhPages ? `${basePath}/` : undefined;

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,

  // 開発中はPWA無効（現状維持）
  disable: process.env.NODE_ENV === "development",

  // GH Pages 配下で SW の scope がルートになって事故らないように合わせる
  ...(isGhPages ? { scope: `${basePath}/` } : {}),
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // GH Pages の時だけ export + basePath を効かせる
  ...(isGhPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix,

        // GH Pages（静的ホスティング）でパス解決を安定化
        trailingSlash: true,

        // export 時は next/image が壊れやすいので基本は unoptimized 推奨
        images: { unoptimized: true },
      }
    : {}),

  // Turbopack用（現状維持）
  turbopack: {
    resolveAlias: {
      fs: "unimplemented",
      path: "unimplemented",
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack用（現状維持）
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default withPWA(nextConfig);

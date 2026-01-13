import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // 開発中はPWA無効（現状維持）
  disable: process.env.NODE_ENV === "development",
});

const isGhPages = process.env.DEPLOY_TARGET === "GH_PAGES";
const basePath = isGhPages ? "/hitblow-next" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // GH Pages の時だけ export + basePath を効かせる
  ...(isGhPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        // GitHub Pages は next/image が壊れやすいので必要なら有効化
        // images: { unoptimized: true },
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

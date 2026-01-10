import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ★ GitHub Pages デプロイ用の設定を追加
  output: 'export',
  basePath: '/hitblow-next',
  assetPrefix: '/hitblow-next',

  // Turbopack用
  turbopack: {
    resolveAlias: {
      "fs": "unimplemented",
      "path": "unimplemented",
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack用
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
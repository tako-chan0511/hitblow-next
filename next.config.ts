// next.config.ts
import { NextConfig } from 'next'

// 静的エクスポートかつ GitHub Pages 用サブパスを環境変数 DEPLOY_TARGET で制御
const isGh = process.env.DEPLOY_TARGET === 'GH_PAGES'
console.log('🛠 next.config.ts → isGh=', isGh)

const nextConfig: NextConfig = {
  // 完全静的エクスポート
  output: 'export',
  // GitHub Pages では index.html が必須のため末尾スラッシュ付与
  trailingSlash: true,
  // GitHub Pages の場合にサブパスを付与、Vercel やローカル開発ではルートで配信
  basePath: isGh ? '/hitblow-next' : '',
  assetPrefix: isGh ? '/hitblow-next/' : '',
  eslint: {
    // ビルド時に ESLint エラーを無視
    ignoreDuringBuilds: true,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // ブラウザバンドル向けに Node モジュールのフォールバックを無効化
      config.resolve.fallback = { fs: false, path: false }
    }
    return config
  },
}

export default nextConfig

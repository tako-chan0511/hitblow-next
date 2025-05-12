// next.config.ts
import { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
console.log('🛠 next.config.ts → isProd=', isProd)

const nextConfig: NextConfig = {
  // output: 'export',
  trailingSlash: true,
  // 開発時は空文字、本番時だけ /hitblow-next を付与
  basePath: isProd ? '/hitblow-next' : '',
  assetPrefix: isProd ? '/hitblow-next' : '',
  eslint: {
    ignoreDuringBuilds: true,    // ビルド時の ESLint エラーを無視
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false }
    }
    return config
  },
}

export default nextConfig

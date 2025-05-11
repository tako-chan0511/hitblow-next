// next.config.ts
import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 静的 HTML とアセットを出力
  output: 'export',
  // /foo/index.html 形式で出力する
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false }
    }
    return config
  },
}

export default nextConfig

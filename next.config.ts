// next.config.ts
import { NextConfig } from 'next'

const isGhPages = process.env.DEPLOY_TARGET === 'GH_PAGES'
const isVercel = Boolean(process.env.VERCEL)

const nextConfig: NextConfig = {
  // GH Pages 向けだけ完全静的エクスポートにする
  output: isGhPages ? 'export' : undefined,
  trailingSlash: isGhPages,
  basePath: isGhPages ? '/hitblow-next' : '',
  assetPrefix: isGhPages ? '/hitblow-next/' : '',
  eslint: { ignoreDuringBuilds: true },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false }
    }
    return config
  },
}

export default nextConfig

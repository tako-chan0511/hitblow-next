// next.config.ts
import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    }
    return config
  },
  // もし Turbopack を使いつつ jsconfig.json も使う場合は experimental.appDir: true なども
  // experimental: {
  //   appDir: true,
  // },
}

export default nextConfig

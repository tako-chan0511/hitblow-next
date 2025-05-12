const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/hitblow-next',       // 本番時のベースパス
  assetPrefix: '/hitblow-next/',   // ← 末尾に「/」を必ず付ける
  eslint: { ignoreDuringBuilds: true },
  webpack(config, { isServer }) {
    if (!isServer) config.resolve.fallback = { fs: false, path: false }
    return config
  },
}
export default nextConfig

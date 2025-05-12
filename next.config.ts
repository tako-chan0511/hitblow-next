const isProd = process.env.NODE_ENV === 'production'
console.log('🛠 next.config.ts → isProd=', isProd)
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/hitblow-next' : '',        // ← ここ
  assetPrefix: isProd ? '/hitblow-next/' : '',    // ← ここ
  eslint: { ignoreDuringBuilds: true },
  webpack(config, { isServer }) {
    if (!isServer) config.resolve.fallback = { fs: false, path: false }
    return config
  },
}
export default nextConfig

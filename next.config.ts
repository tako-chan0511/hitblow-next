const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/hitblow-next' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/hitblow-next/' : '',
  webpack(config, { isServer }) {
    if (!isServer) config.resolve.fallback = { fs: false, path: false }
    return config
  },
}
export default nextConfig

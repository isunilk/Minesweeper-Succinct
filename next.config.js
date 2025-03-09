/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Allow wasm
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Add wasm MIME type
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async'
    })

    return config
  }
};

module.exports = nextConfig;
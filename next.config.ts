import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Skip ESLint during production builds (Vercel CI)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip TypeScript type-checking during production builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable Next.js image optimization (use the raw <img> tag or external CDN)
  images: {
    unoptimized: true,
  },
}

export default nextConfig

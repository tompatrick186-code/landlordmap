/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
      { hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig

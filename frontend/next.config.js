/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'wrapped.in'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

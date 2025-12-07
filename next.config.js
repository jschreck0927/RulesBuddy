/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "cdn.supabase.com"],
  },
  eslint: {
    dirs: ["src"],
  },
};

module.exports = nextConfig;
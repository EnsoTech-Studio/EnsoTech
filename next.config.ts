import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Bản thư pháp từng thử ở /thu-phap, nay là trang chính.
  redirects: async () => [{ source: '/thu-phap', destination: '/', permanent: true }],
};

export default nextConfig;

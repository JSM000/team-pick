import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // GitHub Actions에서 NEXT_PUBLIC_BASE_PATH=/레포이름 으로 주입
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

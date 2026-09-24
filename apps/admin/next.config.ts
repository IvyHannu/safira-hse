import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@safira/design-tokens',
    '@safira/types',
    '@safira/validation',
  ],
};

export default nextConfig;

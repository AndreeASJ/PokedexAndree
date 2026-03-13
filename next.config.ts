import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/PokedexAndree' : '',
  assetPrefix: isProd ? '/PokedexAndree/' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? '/PokedexAndree' : '',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/**',
      },
    ],
  },
  trailingSlash: true,
};

export default nextConfig;

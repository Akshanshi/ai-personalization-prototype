/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
  },
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
};

module.exports = nextConfig;

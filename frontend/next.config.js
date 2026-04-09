/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use src/ directory
  // Output standalone for production
  output: 'standalone',

  // Enable gzip compression in standalone mode
  compress: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },

  // Proxy API calls to backend in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:1002/api/:path*',
      },
      {
        source: '/ws',
        destination: 'http://127.0.0.1:1002/ws',
      },
    ];
  },

  // Image domains (if needed)
  images: {
    unoptimized: true,
  },

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;

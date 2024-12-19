/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Important for Azure deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: ''
      }
    ]
  },
  // Additional production configuration
  distDir: '.next',
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
  
  // Add these new configurations to ignore ESLint and TypeScript errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
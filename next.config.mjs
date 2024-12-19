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
};

export default nextConfig;
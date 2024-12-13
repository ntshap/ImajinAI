/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Penting untuk deployment Azure
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: ''
      }
    ]
  },
  // Tambahan konfigurasi untuk production
  distDir: '.next',
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
};

export default nextConfig;

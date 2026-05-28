// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add the 'images' configuration block here
  images: {
    // Cloudinary URLs are already optimized by CDN; disable Next optimizer to avoid
    // Windows/dev sharp issues that surface as `/_next/image` 500s.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
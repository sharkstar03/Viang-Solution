import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 55, 60, 75],
  },
  /* config options here */
};

export default nextConfig;

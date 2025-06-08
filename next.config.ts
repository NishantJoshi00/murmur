import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@assets': path.resolve(__dirname, 'assets'),
    };
    return config;
  },
};

export default nextConfig;

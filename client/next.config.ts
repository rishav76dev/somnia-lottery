import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Fix for React Native async-storage
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react-native-sqlite-storage': false,
      '@react-native-async-storage/async-storage': false,
    };

    return config;
  },
  // Disable SSR for pages using wallet connectors to avoid indexedDB errors
  experimental: {
    // This helps with some wallet connector issues
  },
};

export default nextConfig;

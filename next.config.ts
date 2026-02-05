import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "api.microlink.io", // Microlink Image Preview
    ],
  },
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;

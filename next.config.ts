import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the home directory otherwise
  // makes Next.js guess the wrong root
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.wgsl": {
        loaders: ["@vgpu/wgsl/loader-webpack"],
        as: "*.js",
      },
    },
  },
  async redirects() {
    return [{ source: "/projects/atlasllm", destination: "/projects/ramelli", permanent: true }];
  },
  async rewrites() {
    return [
      {
        source: "/travels",
        destination: "/travels/index.html",
      },
    ];
  },
};

export default nextConfig;

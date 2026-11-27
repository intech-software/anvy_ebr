import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // Leave room for multipart metadata around a 20 MB avatar.
    serverActions: { bodySizeLimit: "21mb" },
  },
};

export default nextConfig;

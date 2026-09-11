import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: ["mpegts.js"],
  serverExternalPackages: [],
};

export default nextConfig;

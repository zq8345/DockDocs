import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@dock/shared"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

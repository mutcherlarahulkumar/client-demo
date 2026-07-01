import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Produce a self-contained build for a slim Docker runtime image.
  output: "standalone",
};

export default nextConfig;

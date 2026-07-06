import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Self-contained server bundle (own minimal node_modules) — Azure Web App's
  // zip-deploy doesn't reliably preserve pnpm's symlinked node_modules across
  // the upload, so standalone output avoids depending on it at runtime.
  output: "standalone",
};

export default nextConfig;

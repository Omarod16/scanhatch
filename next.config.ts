import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Static export has no image optimisation server
  images: { unoptimized: true },
  // Produces /about/index.html style paths, which Cloudflare Pages serves cleanly
  trailingSlash: true,
};

export default nextConfig;

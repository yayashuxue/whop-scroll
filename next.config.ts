import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "img-v2-prod.whop.com" },
      { protocol: "https", hostname: "assets-2-prod.whop.com" },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optional: allow remote dev-preview origins (comma-separated) when
  // developing through a proxied domain. Unset in normal local dev and in
  // production — it has no effect on the deployed site.
  ...(process.env.DEV_PREVIEW_ORIGINS
    ? { allowedDevOrigins: process.env.DEV_PREVIEW_ORIGINS.split(",") }
    : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const parsedAppUrl = new URL(appUrl);

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: parsedAppUrl.protocol.replace(":", "") as "http" | "https",
        hostname: parsedAppUrl.hostname,
        port: parsedAppUrl.port || undefined,
        pathname: "/uploads/**",
      },
      {
        protocol: parsedAppUrl.protocol.replace(":", "") as "http" | "https",
        hostname: parsedAppUrl.hostname,
        port: parsedAppUrl.port || undefined,
        pathname: "/api/media/**",
      },
    ],
  },
  async rewrites() {
    // Serve runtime uploads via API (public/ alone is wiped/ignored on redeploy).
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/media/:path*",
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
};

export default nextConfig;

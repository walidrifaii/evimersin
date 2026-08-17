import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const parsedAppUrl = new URL(appUrl);

const nextConfig: NextConfig = {
  output: "standalone",
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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "amctag-evimersin.38f0fz.easypanel.host",
          },
        ],
        destination: "https://evimersin.co/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon.jpg",
      },
      {
        source: "/firebase-messaging-sw.js",
        destination: "/api/firebase/messaging-sw",
      },
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

export default withNextIntl(nextConfig);

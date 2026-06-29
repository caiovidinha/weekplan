import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@neondatabase/serverless"],
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Service worker in dev causes stale-cache headaches; only enable in prod.
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);

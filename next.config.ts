import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

// Note: PWA config is temporarily disabled due to build issues.
// Uncomment to enable offline support.
// export default withPWA(nextConfig);
export default nextConfig;

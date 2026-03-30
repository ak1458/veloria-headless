import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uncomment for static export (production builds without Node.js server)
  // output: 'export',
  // distDir: 'dist',
  // dynamicParams: false,
  
  trailingSlash: false,
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "veloriavault.com",
      },
      {
        protocol: "https",
        hostname: "*.veloriavault.com",
      },
      {
        protocol: "https",
        hostname: "*.wp.com",
      },
    ],
  },
  
  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default nextConfig;

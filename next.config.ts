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
        protocol: "http",
        hostname: "145.79.212.69",
      },
      {
        protocol: "https",
        hostname: "veloriavault.com",
      },
      {
        protocol: "https",
        hostname: "api.veloriavault.com",
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
  
  // Add CSP headers for Razorpay and other external resources
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' https: http: blob: data:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' http://145.79.212.69 https://*.veloriavault.com https://veloriavault.com https://api.veloriavault.com https://*.razorpay.com https://api.razorpay.com",
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.razorpay.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
  
  // Proxy wp-content requests to WordPress server (product images, CSS, etc.)
  // Routes through our API media proxy because:
  // - api.veloriavault.com DNS → Hostinger now properly routes and serves static
  //   files for the "api.veloriavault.com" vhost.
  // - The API proxy fetches from the IP with Host: api.veloriavault.com header
  async rewrites() {
    return [
      {
        source: "/wp-content/:path*",
        destination: "/api/media/:path*",
      },
      {
        source: "/wp-includes/:path*",
        destination: "https://api.veloriavault.com/wp-includes/:path*",
      },
    ];
  },

  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default nextConfig;

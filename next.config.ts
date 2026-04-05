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
              "img-src 'self' blob: data: https://*.veloriavault.com https://veloriavault.com https://*.wp.com https://*.razorpay.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.veloriavault.com https://veloriavault.com https://*.razorpay.com https://api.razorpay.com",
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
  async rewrites() {
    return [
      {
        source: "/wp-content/:path*",
        destination: "http://145.79.212.69/wp-content/:path*",
      },
    ];
  },

  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default nextConfig;

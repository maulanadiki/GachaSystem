import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5002/:path*", // 👈 replace 8000 with your actual backend port
      },
    ];
  },
};

export default nextConfig;
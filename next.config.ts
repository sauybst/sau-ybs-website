import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'topluluk.sabis.sakarya.edu.tr',
      },
      {
        protocol: 'https',
        hostname: 's3-esentepe.sakarya.edu.tr',
      },
      {
        protocol: 'https',
        hostname: 'aefwkvvqyvmmfxcojkjm.supabase.co',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  serverExternalPackages: ['jsdom'],

  poweredByHeader: false,

  async headers() {
    return [
      {
        // Tüm sayfalara güvenlik başlıkları uygula
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Zararlı script çalıştırmayı önlemek için 'unsafe-inline' ve 'unsafe-eval' kaldırıldı
              "script-src 'self'", 
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://aefwkvvqyvmmfxcojkjm.supabase.co https://topluluk.sabis.sakarya.edu.tr https://s3-esentepe.sakarya.edu.tr",
              "connect-src 'self' https://aefwkvvqyvmmfxcojkjm.supabase.co https://topluluk.sabis.sakarya.edu.tr",
              // Pentest raporunda istenen ek güvenlik sıkılaştırmaları:
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
    ]
  },
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

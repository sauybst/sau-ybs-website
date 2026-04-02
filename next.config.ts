import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {

  serverExternalPackages: ['jsdom'],

  poweredByHeader: false,

  async headers() {

    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://me.kis.v2.scr.kaspersky-labs.com ws://me.kis.v2.scr.kaspersky-labs.com"
      : "script-src 'self'";

    const connectSrc = isDev
      ? "connect-src 'self' ws://localhost:* wss://localhost:* https://aefwkvvqyvmmfxcojkjm.supabase.co https://topluluk.sabis.sakarya.edu.tr http://me.kis.v2.scr.kaspersky-labs.com ws://me.kis.v2.scr.kaspersky-labs.com"
      : "connect-src 'self' https://aefwkvvqyvmmfxcojkjm.supabase.co https://topluluk.sabis.sakarya.edu.tr";

    return [
      {
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
              scriptSrc,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://aefwkvvqyvmmfxcojkjm.supabase.co https://topluluk.sabis.sakarya.edu.tr https://s3-esentepe.sakarya.edu.tr",
              connectSrc,
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
    ];
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
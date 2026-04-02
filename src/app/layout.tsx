import type { Metadata } from 'next'
import { Poppins, Lato, Montserrat } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import ScrollToTop from '@/components/ScrollToTop';
import CookieBanner from '@/components/CookieBanner';
import NextTopLoader from 'nextjs-toploader';
import { ToastProvider } from '@/components/ToastProvider';

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin-ext'],
  variable: '--font-poppins',
  display: 'swap',
})

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin-ext'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  // 0. Canonical URL çözümlemesi (tüm alt sayfalar için temel URL)
  metadataBase: new URL('https://www.sauybst.com'),

  // 1. Tarayıcı Sekmesi ve Google Arama Sonuçları İçin
  title: {
    default: 'SAÜ YBS | Geleceğin Analisti',
    template: '%s | SAÜ YBS'
  },
  description: 'Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu resmi web sitesi. Etkinlikler, projeler, staj ilanları ve daha fazlası.',
  keywords: ['SAÜ', 'YBS', 'Yönetim Bilişim Sistemleri', 'Sakarya Üniversitesi', 'öğrenci topluluğu', 'etkinlik', 'staj', 'proje'],

  // 2. WhatsApp, LinkedIn, Facebook vb. (Open Graph) İçin
  openGraph: {
    title: 'SAÜ YBS | Geleceğin Analisti',
    description: 'Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu resmi web sitesi ve dijital ekosistemi.',
    url: 'https://www.sauybst.com',
    siteName: 'SAÜ YBS',
    images: [
      {
        url: '/og-default.webp',
        width: 1200,
        height: 630,
        alt: 'SAÜ YBS Kapak Görseli',
      }
    ],
    locale: 'tr_TR',
    type: 'website',
  },

  // 3. X (Twitter) İçin Özel Kart Yapısı
  twitter: {
    card: 'summary_large_image',
    title: 'SAÜ YBS | Geleceğin Analisti',
    description: 'Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu',
    images: ['/og-default.webp'],
  },

  // 4. Arama motoru davranış ayarları
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" data-scroll-behavior="smooth" className={`scroll-smooth ${poppins.variable} ${lato.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">

        <NextTopLoader
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
          zIndex={1600}
        />

        <ToastProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ToastProvider>

        <ScrollToTop />
        <CookieBanner />
      </body>
    </html>
  )
}
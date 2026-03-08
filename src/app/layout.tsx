import type { Metadata } from 'next'
import { Poppins, Lato, Montserrat } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import ScrollToTop from '@/components/ScrollToTop';
import CookieBanner from '@/components/CookieBanner'; 
// YENİ EKLENEN İMPORT
import NextTopLoader from 'nextjs-toploader';

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
  title: 'SAU YBS Topluluğu',
  description: 'Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu Resmi Web Sitesi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`scroll-smooth ${poppins.variable} ${lato.variable}`}>
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

          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          
          <ScrollToTop />
          <CookieBanner />
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import { Poppins, Lato } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'

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
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}

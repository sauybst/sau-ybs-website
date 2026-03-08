'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingContact from '@/components/FloatingContact';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuthOrAdmin = pathname.startsWith('/admin') || pathname === '/login'

    return (
        <div id="public-layout-wrapper" className="flex flex-col flex-1">
            {!isAuthOrAdmin && <Header />}
            <main className="flex-1 flex flex-col">{children}</main>
            {!isAuthOrAdmin && <Footer />}
            {!isAuthOrAdmin && <FloatingContact />} 
        </div>
    )
}
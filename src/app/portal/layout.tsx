import { redirect } from 'next/navigation'
import { getCurrentPassport } from '@/actions/passports'

export const metadata = {
    title: 'Dijital Cüzdan | zaferOPS',
    description: 'zaferOPS Dijital Pasaport ve Bilet Yönetim Merkezi',
}

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 1. UÇTAN UCA GÜVENLİK KALKANI
    // Bu kontrol sayesinde /portal altındaki hiçbir sayfaya (bilet detay, onay vs.) yetkisiz girilemez.
    const passport = await getCurrentPassport()

    // Eğer öğrencinin aktif bir pasaport oturumu yoksa, doğrudan giriş/kayıt sayfasına fırlat
    if (!passport) {
        redirect('/pasaport')
    }

    // 2. RENDER (Tüm alt sayfalar bu kalkanın içinde güvenle çalışır)
    return (
        <main className="portal-layout-wrapper bg-slate-50 min-h-screen flex flex-col">
            {children}
        </main>
    )
}
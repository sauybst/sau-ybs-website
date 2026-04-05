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
    const passport = await getCurrentPassport()

    if (!passport) {
        redirect('/pasaport')
    }

    // 2. RENDER 
    return (
        <div className="portal-layout-wrapper bg-slate-50 min-h-screen flex flex-col">
            {children}
        </div>
    )
}
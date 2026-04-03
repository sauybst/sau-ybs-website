"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { logoutPassport } from '@/actions/passports'

export default function LogoutButton() {
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        // Zaten çıkış yapılıyorsa tekrar tetiklenmesini engelle
        if (isLoggingOut) return;
        
        setIsLoggingOut(true)
        
        try {
            await logoutPassport()
            router.push('/')
            router.refresh() // Mevcut durumu temizle
        } catch (error) {
            console.error("Çıkış yapılırken hata oluştu:", error)
            setIsLoggingOut(false)
        }
    }

    return (
        <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors border border-red-100 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
                {isLoggingOut ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
            </span>
            {/* Mobilde sadece ikon ve kısa metin veya sadece ikon görünebilir, tasarımı daraltmamak için */}
            <span className="sm:hidden">
                {isLoggingOut ? 'Bekleyin...' : 'Çıkış'}
            </span>
        </button>
    )
}
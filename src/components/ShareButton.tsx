'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface ShareButtonProps {
    title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
    const [isCopied, setIsCopied] = useState(false)
    const { showToast } = useToast()

    const handleShare = async () => {
        // Mevcut sayfanın tam URL'sini alıyoruz
        const currentUrl = window.location.href

        // 1. Senaryo: Web Share API (Mobil cihazlar ve destekleyen güncel tarayıcılar için)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `${title} - Okumanı tavsiye ederim!`,
                    url: currentUrl,
                })
                return; // Paylaşım başarılıysa fonksiyondan çık
            } catch (error) {
                // Kullanıcı menüyü kapatırsa panik yapma, kopyalama adımına geç
                console.log('Paylaşım menüsü kapatıldı veya desteklenmiyor.');
            }
        }

        // 2. Senaryo: Fallback (Masaüstü bilgisayarlar için panoya kopyalama)
        try {
            await navigator.clipboard.writeText(currentUrl)
            setIsCopied(true)
            showToast('Bağlantı kopyalandı!', 'success')
            
            // 2 saniye sonra yeşil tiki tekrar paylaş ikonuna çevir
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            showToast('Bağlantı kopyalanamadı.', 'error')
        }
    }

    return (
        <button 
            onClick={handleShare}
            title="Yazıyı Paylaş"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors border border-slate-200 hover:border-brand-200 shadow-sm relative overflow-hidden group"
        >
            {isCopied ? (
                <Check className="w-5 h-5 text-green-600 animate-in zoom-in duration-200" />
            ) : (
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            )}
        </button>
    )
}
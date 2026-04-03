"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { acquireTicket } from '@/actions/tickets'

type Props = {
    eventId: string
    pinCode: string
    keywordHash: string
}

export default function TicketAcquireButton({ eventId, pinCode, keywordHash }: Props) {
    const router = useRouter()
    const { showToast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAcquire = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            const result = await acquireTicket(eventId, pinCode, keywordHash)

            if (result.error) {
                showToast(result.error, 'error')
                setIsSubmitting(false)
                return
            } else {
                showToast('Biletiniz başarıyla oluşturuldu! Cüzdanınıza yönlendiriliyorsunuz.', 'success')
                // Başarılıysa cüzdana yönlendir
                router.push('/portal')
                router.refresh()
            }
        } catch (error: any) {

            if (error.message === 'NEXT_REDIRECT') return;

            console.error("Bilet alma hatası:", error)
            showToast('Beklenmeyen bir hata oluştu.', 'error')
            setIsSubmitting(false)
        }
    }

    return (
        <button
            onClick={handleAcquire}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-lg hover:shadow-xl transition-all font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 disabled:hover:translate-y-0"
        >
            {isSubmitting ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Bilet Üretiliyor...
                </>
            ) : (
                <>
                    <Ticket className="h-5 w-5" />
                    Bileti Onayla ve Cüzdana Ekle
                </>
            )}
        </button>
    )
}
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { cancelMyTicket } from '@/actions/tickets'

type Props = {
    ticketId: string
    pinCode: string
}

export default function TicketCancelButton({ ticketId, pinCode }: Props) {
    const router = useRouter()
    const { showToast } = useToast()
    
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    // Sadece Modalı açar
    const handleOpenModal = () => {
        if (!isCancelling) setIsModalOpen(true)
    }

    // Modal kapatılırsa tetiklenir
    const handleCloseModal = () => {
        if (!isCancelling) setIsModalOpen(false)
    }

    // Modal içindeki "Evet, İptal Et" butonuna basıldığında asıl işlemi yapar
    const executeCancel = async () => {
        setIsCancelling(true)
        setIsModalOpen(false) // İşlem başlarken modalı kapat ki arka planda loading görünsün

        try {
            const result = await cancelMyTicket(ticketId, pinCode)

            if (result.error) {
                showToast(result.error, 'error')
                setIsCancelling(false)
            } else {
                showToast('Biletiniz başarıyla iptal edildi ve kontenjan geri verildi.', 'success')
                router.push('/portal')
                router.refresh()
            }
        } catch (error) {
            console.error("İptal hatası:", error)
            showToast('Beklenmeyen bir hata oluştu.', 'error')
            setIsCancelling(false)
        }
    }

    return (
        <>
            {/* ANA BUTON (Sayfada Duran) */}
            <button
                onClick={handleOpenModal}
                disabled={isCancelling}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-bold disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isCancelling ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Trash2 className="w-5 h-5" />
                )}
                {isCancelling ? 'İptal Ediliyor...' : 'Bileti İptal Et (Kontenjanı Bırak)'}
            </button>

            {/* ONAY MODALI (Gizli katman) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Arka plan karartması */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                        onClick={handleCloseModal}
                        aria-hidden="true"
                    />
                    
                    {/* Modal Kutusu */}
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Kapatma İkonu */}
                        <button 
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-6 pt-8 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Bileti İptal Et</h3>
                            <p className="text-sm text-slate-500 mb-8">
                                Bu işlemi onaylarsanız biletiniz geçersiz sayılacak ve ayırdığınız kontenjan anında başka bir öğrenciye devredilecektir. Emin misiniz?
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={executeCancel}
                                    className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-colors"
                                >
                                    Evet, Biletimi İptal Et
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                                >
                                    Vazgeç, Bileti Koru
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
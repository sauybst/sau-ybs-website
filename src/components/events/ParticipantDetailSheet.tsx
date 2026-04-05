"use client"

import { useState, useTransition, useEffect } from 'react'
import { 
    X, 
    Clock, 
    Ticket as TicketIcon, 
    CheckCircle, 
    AlertCircle, 
    RotateCcw,
    UserCheck
} from 'lucide-react'
import { updateTicketStatus } from '@/actions/events'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { TICKET_STATUS } from '@/types/tickets'

interface Props {
    ticket: {
        id: string;
        pin_code: string;
        status: number;
        created_at: string;
        updated_at: string;
    }
}

export default function ParticipantDetailSheet({ ticket }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { showToast } = useToast()
    const router = useRouter()

    // --- UX & A11y: Scroll Kilitleme ve ESC Tuşu ile Kapatma ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isPending) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleKeyDown)
        } else {
            document.body.style.overflow = 'unset'
        }
        
        return () => {
            document.body.style.overflow = 'unset'
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, isPending])

    const handleStatusUpdate = (newStatus: number) => {
        startTransition(async () => {
            try {
                const res = await updateTicketStatus(ticket.id, newStatus)
                
                if (res.success) {
                    showToast('Bilet durumu başarıyla güncellendi.', 'success')
                    router.refresh()
                    setIsOpen(false)
                } else {
                    showToast(res.error || 'Güncelleme sırasında bir hata oluştu.', 'error')
                }
            } catch (error) {
                showToast('Sunucu ile bağlantı kurulamadı.', 'error')
            }
        })
    }

    return (
        <>
            <button 
                type="button"
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                title="Detayları Görüntüle"
            >
                <TicketIcon className="h-4 w-4" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200" 
                    onClick={() => !isPending && setIsOpen(false)} 
                    aria-hidden="true"
                />
            )}

            {/* Panel */}
            <div 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="sheet-title"
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 id="sheet-title" className="text-xl font-bold text-slate-900">Katılımcı Detayları</h2>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            disabled={isPending}
                            aria-label="Paneli kapat"
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <div className="bg-brand-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-brand-200">
                            <p className="text-brand-100 text-xs font-bold uppercase tracking-widest mb-2">Pasaport PIN</p>
                            <h3 className="text-4xl font-mono font-black tracking-[0.2em] mb-4">{ticket.pin_code}</h3>
                            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {ticket.status === TICKET_STATUS.SCANNED ? 'Giriş Yaptı' : 
                                 ticket.status === TICKET_STATUS.CANCELLED ? 'İptal Edildi' : 'Aktif'}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-100 rounded-2xl text-slate-500"><Clock className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bilet Alma Tarihi</p>
                                    <p className="text-slate-700 font-semibold">{new Date(ticket.created_at).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-100 rounded-2xl text-slate-500"><CheckCircle className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Son İşlem Zamanı</p>
                                    <p className="text-slate-700 font-semibold">{new Date(ticket.updated_at).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="space-y-4">
                            <p className="text-sm font-bold text-slate-900">Durumu Güncelle</p>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    disabled={isPending || ticket.status === TICKET_STATUS.SCANNED}
                                    onClick={() => handleStatusUpdate(TICKET_STATUS.SCANNED)}
                                    className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-emerald-100 text-emerald-700 font-bold hover:bg-emerald-50 transition-all disabled:opacity-50"
                                >
                                    <UserCheck className="h-5 w-5" /> 
                                    {isPending ? 'İşleniyor...' : 'Manuel Giriş Onayla'}
                                </button>

                                <button 
                                    disabled={isPending || ticket.status === TICKET_STATUS.ACTIVE}
                                    onClick={() => handleStatusUpdate(TICKET_STATUS.ACTIVE)}
                                    className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-blue-100 text-blue-700 font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
                                >
                                    <RotateCcw className="h-5 w-5" /> Bekliyor Yap
                                </button>

                                <button 
                                    disabled={isPending || ticket.status === TICKET_STATUS.CANCELLED}
                                    onClick={() => handleStatusUpdate(TICKET_STATUS.CANCELLED)}
                                    className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-rose-100 text-rose-700 font-bold hover:bg-rose-50 transition-all disabled:opacity-50"
                                >
                                    <AlertCircle className="h-5 w-5" /> Bileti İptal Et
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 text-center">
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-widest">
                            zaferOPS Security Layer v2.0 <br />
                            Tüm işlemler loglanmaktadır.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
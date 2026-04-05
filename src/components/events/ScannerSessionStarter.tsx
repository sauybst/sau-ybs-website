"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScanLine, Bus, Play, X } from 'lucide-react'
import { TICKETING_MODE } from '@/types/event'
import { useToast } from '@/components/ToastProvider' // 🚀 Toast eklendi

export default function ScannerSessionStarter({ eventId, ticketingMode }: { eventId: string, ticketingMode: number }) {
    const router = useRouter()
    const { showToast } = useToast()
    
    const [isOpen, setIsOpen] = useState(false)
    const [sessionName, setSessionName] = useState('Gidiş Yoklaması')
    const [customSession, setCustomSession] = useState('')

    // --- UX & A11y: Scroll Kilitleme ve ESC Tuşu ile Kapatma ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
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
    }, [isOpen])

    const handleStart = () => {
        // Girdi temizliği (trim) burada yapılarak değişkene atanıyor
        const finalSession = sessionName === 'Diğer' ? customSession.trim() : sessionName
        
        if (!finalSession) {
            // alert() yerine sisteme entegre modern bildirim kullanıldı
            return showToast("Oturum adı boş olamaz!", "error")
        }
        
        // Seçilen oturum adını URL parametresi (query) olarak Scanner'a gönderiyoruz
        router.push(`/admin/events/${eventId}/scanner?session=${encodeURIComponent(finalSession)}`)
    }

    // Eğer standart etkinlikse, eski usul direkt tarayıcıya git
    if (ticketingMode !== TICKETING_MODE.BUS_QR) {
        return (
            <button 
                onClick={() => router.push(`/admin/events/${eventId}/scanner`)}
                className="flex items-center justify-center px-6 py-3 rounded-xl shadow-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:scale-95"
            >
                <ScanLine className="mr-2 h-5 w-5" />
                Yoklama Al
            </button>
        )
    }

    // Eğer otobüs etkinliğiyse, oturum seçici menüyü aç
    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center px-6 py-3 rounded-xl shadow-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 hover:-translate-y-0.5 transition-all active:scale-95"
            >
                <Bus className="mr-2 h-5 w-5" />
                Çoklu Yoklama Başlat
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Arka plan karartması (tıklanınca kapanır) */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    
                    {/* Erişilebilir Modal Kutusu */}
                    <div 
                        role="dialog" 
                        aria-modal="true" 
                        aria-labelledby="scanner-modal-title"
                        className="relative bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 z-10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 id="scanner-modal-title" className="text-xl font-bold text-slate-900">Yoklama Oturumu</h3>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                aria-label="Kapat"
                                className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1.5 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Hangi aşamanın yoklaması alınıyor?</label>
                                <select 
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-700 transition-all"
                                >
                                    <option value="Gidiş Yoklaması">🚌 Gidiş Yoklaması</option>
                                    <option value="Dönüş Yoklaması">🏡 Dönüş Yoklaması</option>
                                    <option value="Mola Yeri Sayımı">☕ Mola Yeri Sayımı</option>
                                    <option value="Diğer">✏️ Diğer (Özel İsim)...</option>
                                </select>
                            </div>

                            {sessionName === 'Diğer' && (
                                <div className="animate-in slide-in-from-top-2">
                                    <input 
                                        type="text" 
                                        placeholder="Örn: Müze Girişi"
                                        value={customSession}
                                        onChange={(e) => setCustomSession(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-700 transition-all"
                                    />
                                </div>
                            )}

                            <button 
                                onClick={handleStart}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200"
                            >
                                <Play className="h-5 w-5 fill-current" />
                                Tarayıcıyı Başlat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
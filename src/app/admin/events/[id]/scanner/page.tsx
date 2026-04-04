"use client"

import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { ArrowLeft, CheckCircle2, XCircle, ScanLine, Ticket, Keyboard } from 'lucide-react'

import { scanTicket, scanTicketByPin } from '@/actions/scanner'

// 1. ADIM: Asıl Scanner İçeriğini Suspense için ayrı bir bileşene ayırıyoruz
function ScannerContent() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string

    // Oturum bilgisini URL'den çek (Örn: ?session=Gidiş Yoklaması)
    const searchParams = useSearchParams()
    const sessionName = searchParams.get('session') || 'Giriş'
      
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [scannedPin, setScannedPin] = useState('')
    const [manualPin, setManualPin] = useState('')

    const isProcessing = useRef(false)

    // DIŞA BAĞIMLI OLMAYAN, SAF JS KAMERA MOTORU
    useEffect(() => {
        const html5QrCode = new Html5Qrcode("qr-reader")
        let isStarting = true

        html5QrCode.start(
            { facingMode: "environment" },
            { 
                fps: 10,
                qrbox: { width: 250, height: 250 },
                disableFlip: false 
            },
            (decodedText) => handleScan(decodedText, 'qr'),
            () => {} // Kamera saniyede 10 kez tarayıp kod bulamayınca buraya düşer, sessizce geçiyoruz
        ).then(() => {
            isStarting = false
        }).catch((err) => {
            isStarting = false
            console.error("Kamera Hatası:", err)
        })

        return () => {
            if (!isStarting && html5QrCode.isScanning) {
                html5QrCode.stop().catch(console.error)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const processResult = (result: any) => {
        if (result.error) {
            setStatus('error')
            setMessage(result.error)
        } else {
            setStatus('success')
            setMessage(result.message || 'Geçiş Onaylandı!')
            setScannedPin(result.pinCode || '')
        }

        setTimeout(() => {
            setStatus('idle')
            setMessage('')
            setScannedPin('')
            setManualPin('')
            isProcessing.current = false
        }, 2500)
    }

    // YANLIŞ YERE YAZILAN KOD BURAYA TAŞINDI
    const handleScan = async (data: string, mode: 'qr' | 'manual') => {
        if (isProcessing.current || !data) return
        isProcessing.current = true

        try {
            // Backend'e sessionName parametresini yolluyoruz
            const result = mode === 'qr' 
                ? await scanTicket(eventId, data, sessionName) 
                : await scanTicketByPin(eventId, data, sessionName)

            processResult(result)
        } catch (error) {
            console.error("Tarama hatası:", error)
            setStatus('error')
            setMessage('Sunucu ile bağlantı kurulamadı.')
            processResult({ error: 'Bağlantı hatası' })
        }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (manualPin.trim().length > 3) {
            handleScan(manualPin.trim(), 'manual')
        }
    }

    return (
        <div className="flex flex-col w-full h-[calc(100vh-8rem)] min-h-[500px] max-h-[850px] bg-slate-950 text-slate-100 font-montserrat overflow-hidden rounded-2xl shadow-2xl border border-slate-800">
            
            {/* Üst Bar */}
            <div className="flex-none flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-sm z-20">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold hidden sm:inline">Panele Dön</span>
                </button>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 text-brand-400 font-bold tracking-wider text-sm sm:text-base">
                        <ScanLine className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="truncate">zaferOPS SCANNER</span>
                    </div>
                    {/* Sahada görevlinin hangi oturumda olduğunu görmesi için */}
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        {sessionName}
                    </span>
                </div>
            </div>

            {/* Kamera Alanı */}
            <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden bg-black">
                
                <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                    <div id="qr-reader" className="w-full h-full opacity-80" />
                </div>

                {/* Overlay ve Lazer */}
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 shadow-[0_0_0_4000px_rgba(0,0,0,0.6)] rounded-lg">
                        <div className="absolute top-0 left-0 w-8 sm:w-12 h-8 sm:h-12 border-t-4 border-l-4 border-brand-500 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 sm:w-12 h-8 sm:h-12 border-t-4 border-r-4 border-brand-500 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 sm:w-12 h-8 sm:h-12 border-b-4 border-l-4 border-brand-500 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 sm:w-12 h-8 sm:h-12 border-b-4 border-r-4 border-brand-500 rounded-br-xl" />
                        
                        {status === 'idle' && (
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-400 shadow-[0_0_15px_rgba(var(--brand-400),1)] animate-scan" />
                        )}
                    </div>
                    <p className="mt-6 text-white font-medium tracking-widest text-[10px] sm:text-xs bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md">
                        QR KODU ÇERÇEVEYE HİZALAYIN
                    </p>
                </div>
            </div>

            {/* Manuel PIN Barı */}
            <div className="flex-none bg-slate-900 border-t border-slate-800 p-3 sm:p-5 z-20">
                <form 
                    onSubmit={handleManualSubmit} 
                    className="flex w-full max-w-md mx-auto bg-slate-800 p-1.5 rounded-xl border border-slate-700 focus-within:border-brand-500 transition-colors"
                >
                    <div className="pl-3 pr-2 flex items-center text-slate-400 hidden sm:flex">
                        <Keyboard className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={manualPin}
                        onChange={(e) => setManualPin(e.target.value.toUpperCase())}
                        placeholder="PIN KODU"
                        disabled={status !== 'idle'}
                        className="flex-1 min-w-0 bg-transparent text-white px-2 py-2 outline-none font-mono placeholder:text-slate-500 uppercase font-bold tracking-widest disabled:opacity-50 text-sm sm:text-base"
                    />
                    <button
                        type="submit"
                        disabled={!manualPin || status !== 'idle'}
                        className="bg-brand-600 hover:bg-brand-500 text-white px-4 sm:px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 text-sm sm:text-base"
                    >
                        Onayla
                    </button>
                </form>
            </div>

            {/* SONUÇ EKRANI */}
            {status !== 'idle' && (
                <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200
                    ${status === 'success' ? 'bg-green-600/95 backdrop-blur-md' : 'bg-red-600/95 backdrop-blur-md'}
                `}>
                    {status === 'success' ? (
                        <CheckCircle2 className="w-20 h-20 sm:w-28 sm:h-28 text-white mb-4 sm:mb-6 animate-bounce" />
                    ) : (
                        <XCircle className="w-20 h-20 sm:w-28 sm:h-28 text-white mb-4 sm:mb-6" />
                    )}
                    
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight mb-4 leading-tight">
                        {message}
                    </h2>

                    {status === 'success' && scannedPin && (
                        <div className="bg-black/20 p-4 sm:p-6 rounded-2xl flex flex-col items-center border border-white/20 mt-2">
                            <Ticket className="w-6 h-6 text-green-200 mb-1" />
                            <span className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">Pasaport PIN</span>
                            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-widest">{scannedPin}</span>
                        </div>
                    )}
                </div>
            )}
            
            <style jsx global>{`
                #qr-reader { border: none !important; }
                
                #qr-reader video { 
                    object-fit: cover !important; 
                    width: 100% !important; 
                    height: 100% !important; 
                    min-height: 100% !important; 
                }

                #qr-reader svg, 
                #qr-shaded-region { 
                    display: none !important; 
                }
                
                #qr-reader__dashboard_section_csr span, 
                #qr-reader__dashboard_section_swaplink { 
                    display: none !important; 
                }
                
                @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
                .animate-scan { animation: scan 3s linear infinite; }
            `}</style>
            
        </div>
    )
}

// 2. ADIM: Sayfanın dışa aktarımını yaparken useSearchParams kullandığımız için Suspense ile sarmalıyoruz
export default function EventScannerPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[50vh] text-slate-400 font-bold font-mono">
                KAMERA SİSTEMİ BAŞLATILIYOR...
            </div>
        }>
            <ScannerContent />
        </Suspense>
    )
}
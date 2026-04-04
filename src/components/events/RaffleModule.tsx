"use client"

import { useState, useTransition } from 'react'
import { Trophy, Play, X } from 'lucide-react'
import { getRafflePool } from '@/actions/raffle'
import confetti from 'canvas-confetti'
import { useToast } from '@/components/ToastProvider' // Toast kancasını içe aktar

export default function RaffleModule({ eventId }: { eventId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [pool, setPool] = useState<string[]>([])
    const [isSpinning, setIsSpinning] = useState(false)
    const [winner, setWinner] = useState<string | null>(null)
    const [displayPin, setDisplayPin] = useState('????')
    
    // Geçiş durumu ve toast bildirimleri
    const [isPending, startTransition] = useTransition()
    const { showToast } = useToast()

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    const startRaffle = () => {
        // Sunucu isteğini bir geçiş (transition) içinde başlat
        startTransition(async () => {
            try {
                const res = await getRafflePool(eventId);
                
                if (res.success && res.pool.length > 0) {
                    setPool(res.pool);
                    setIsOpen(true);
                    setWinner(null);
                    setDisplayPin('????');
                } else {
                    // alert yerine Toast kullanımı
                    showToast(res.error || "İçeride henüz onaylı katılımcı yok!", "info");
                }
            } catch (error) {
                showToast("Havuz bilgileri alınırken bir hata oluştu.", "error");
            }
        });
    }

    const spin = () => {
        if (pool.length === 0) return
        setIsSpinning(true)
        setWinner(null)

        let counter = 0
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * pool.length)
            setDisplayPin(pool[randomIndex])
            counter++

            if (counter > 30) {
                clearInterval(interval)
                const finalWinner = pool[Math.floor(Math.random() * pool.length)]
                setWinner(finalWinner)
                setDisplayPin(finalWinner)
                setIsSpinning(false)
                triggerConfetti()
            }
        }, 100)
    }

    return (
        <>
            <button 
                onClick={startRaffle}
                disabled={isPending} // İstek sürerken butonu devre dışı bırak
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 disabled:opacity-50"
            >
                <Trophy className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
                {isPending ? 'Hazırlanıyor...' : 'Çekiliş Başlat'}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-lg p-12 text-center relative overflow-hidden shadow-2xl border border-slate-100">
                        
                        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-50">
                            <X className="h-6 w-6" />
                        </button>

                        <div className="space-y-8">
                            <div className="flex justify-center">
                                <div className="p-4 bg-amber-50 rounded-3xl animate-bounce">
                                    <Trophy className="h-12 w-12 text-amber-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Şanslı Kişiyi Seç</h2>
                                <p className="text-slate-500 font-medium">Toplam {pool.length} bilet arasından...</p>
                            </div>

                            <div className="bg-slate-50 rounded-[32px] p-10 border-4 border-slate-100 relative group">
                                <span className={`text-5xl font-mono font-black tracking-[0.2em] transition-all ${isSpinning ? 'text-brand-600 blur-[1px]' : 'text-slate-900'}`}>
                                    {displayPin}
                                </span>
                                
                                {winner && (
                                    <div className="absolute inset-0 bg-emerald-500 rounded-[28px] flex items-center justify-center animate-in zoom-in-50 duration-500 shadow-2xl shadow-emerald-200">
                                        <div className="text-center">
                                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-[0.3em] mb-1">KAZANAN TEBRİKLER!</p>
                                            <h3 className="text-5xl font-mono font-black text-white tracking-widest">{winner}</h3>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={spin}
                                    disabled={isSpinning}
                                    className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                                >
                                    <Play className="h-6 w-6 fill-current text-amber-400" />
                                    {winner ? 'BİR DAHA ÇEK' : 'ŞİMDİ ÇEVİR'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
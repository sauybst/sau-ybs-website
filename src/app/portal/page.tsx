"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Ticket, CalendarX2, ShieldCheck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { logoutPassport, getCurrentPassport } from '@/actions/passports'

export default function PortalPage() {
    const router = useRouter()
    const [passport, setPassport] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            const data = await getCurrentPassport()
            if (data) {
                setPassport(data)
            } else {
                router.push('/pasaport') // Veri yoksa geri fırlat
            }
            setLoading(false)
        }
        fetchUserData()
    }, [router])

    const handleLogout = async () => {
        await logoutPassport()
        router.push('/')
        router.refresh()
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="animate-pulse text-brand-600 font-semibold">Cüzdanınız Yükleniyor...</span></div>
    }

    if (!passport) return null;

    return (
        <div className="min-h-screen pt-28 pb-12 bg-slate-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Karşılama ve Çıkış Barı */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="h-12 w-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Hoş Geldin, {passport.name_mask}</h1>
                            <p className="text-sm text-slate-500">Anonim kimliğin güvende ve aktif.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors border border-red-100"
                    >
                        <LogOut className="h-4 w-4" /> Çıkış Yap
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SOL KISIM: Dijital Pasaport Kartı */}
                    <div className="md:col-span-1">
                        <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-1 rounded-3xl shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                                <Ticket className="h-32 w-32" />
                            </div>
                            
                            <div className="bg-white rounded-[22px] p-6 text-center relative z-10">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tarama İçin Hazır</p>
                                
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-center mb-6">
                                    <QRCodeSVG 
                                        value={passport.pin_code} 
                                        size={180} 
                                        level="H" 
                                        includeMargin={true}
                                        className="rounded-lg shadow-sm"
                                    />
                                </div>
                                
                                <p className="text-xs text-slate-500 font-medium mb-1">Pasaport PIN</p>
                                <p className="text-2xl font-mono font-bold text-brand-600 tracking-wider">
                                    {passport.pin_code}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KISIM: Etkinlikler ve Biletler */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-brand-500" /> Yaklaşan Etkinliklerim
                            </h2>
                            
                            {/* Boş Durum (Empty State) - İleride biletler buraya gelecek */}
                            <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <CalendarX2 className="h-12 w-12 text-slate-300 mb-4" />
                                <h3 className="text-slate-700 font-semibold mb-1">Henüz Biletiniz Yok</h3>
                                <p className="text-sm text-slate-500 max-w-sm">
                                    Topluluğun düzenlediği etkinliklere katılarak biletlerinizi burada görüntüleyebilirsiniz. Kapı girişlerinde sadece soldaki QR kodu okutmanız yeterli olacaktır.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
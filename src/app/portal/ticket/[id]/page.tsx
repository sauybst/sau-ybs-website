import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, CalendarIcon, MapPin, Clock, Ticket, AlertCircle, Ban } from 'lucide-react'

import { getCurrentPassport } from '@/actions/passports'
import { getTicketForDisplay } from '@/actions/tickets'
import { TICKET_STATUS, TICKET_STATUS_LABELS } from '@/types/tickets'
import TicketCancelButton from './TicketCancelButton'

type Props = {
    params: Promise<{ id: string }>
}

export default async function LiveTicketPage({ params }: Props) {
    const { id } = await params
    const passport = await getCurrentPassport()

    if (!passport) redirect('/pasaport')

    // Bileti veritabanından getir (Yetki kontrolü action içinde yapılıyor)
    const { ticket, error } = await getTicketForDisplay(id, passport.pin_code, passport.keyword_hash)

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Bilet Bulunamadı</h2>
                <p className="text-slate-500 mb-6">{error || 'Bu bilet sistemde mevcut değil veya size ait değil.'}</p>
                <Link href="/portal" className="text-brand-600 font-semibold hover:underline">Cüzdana Dön</Link>
            </div>
        )
    }

    // Durum Kontrolleri
    const isCancelled = ticket.status === TICKET_STATUS.CANCELLED
    const isScanned = ticket.status === TICKET_STATUS.SCANNED
    const eventDate = new Date(ticket.events.event_date)
    const isPast = eventDate < new Date()
    
    // QR kodun gösterilip gösterilmeyeceği mantığı
    const showQR = !isCancelled && !isPast

    return (
        <div className="max-w-md mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col min-h-[calc(100vh-80px)]">
            <Link
                href="/portal"
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Cüzdana Dön
            </Link>

            {/* BİLET TASARIMI (Bilet koçanı görünümü) */}
            <div className={`relative bg-white rounded-3xl shadow-xl border overflow-hidden flex-1 flex flex-col
                ${isCancelled ? 'border-red-200' : 'border-slate-100'}
            `}>
                
                {/* Soluklaştırma katmanı (Geçmiş veya İptal ise) */}
                {(isCancelled || isPast) && (
                    <div className="absolute inset-0 bg-slate-50/70 z-30 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                        <div className="bg-white/90 px-6 py-3 rounded-2xl shadow-lg border border-slate-200 transform -rotate-12 flex items-center gap-3">
                            <Ban className={`w-6 h-6 ${isCancelled ? 'text-red-500' : 'text-slate-400'}`} />
                            <span className={`font-black uppercase tracking-widest text-lg ${isCancelled ? 'text-red-600' : 'text-slate-600'}`}>
                                {isCancelled ? 'İPTAL EDİLDİ' : 'SÜRESİ DOLDU'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Üst Kısım: Etkinlik Özeti */}
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    {/* Bilet statüsü etiketi */}
                    <div className="absolute top-4 right-4">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest
                            ${ticket.status === TICKET_STATUS.ACTIVE ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                              ticket.status === TICKET_STATUS.SCANNED ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 
                              'bg-red-500/20 text-red-300 border border-red-500/30'}`}
                        >
                            {TICKET_STATUS_LABELS[ticket.status as number]}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-brand-300 mb-4 mt-2">
                        <Ticket className="w-5 h-5" />
                        <span className="font-semibold tracking-widest text-xs uppercase opacity-80">zaferOPS Dijital Bilet</span>
                    </div>
                    
                    <h1 className="text-2xl font-bold leading-tight mb-6">{ticket.events.title}</h1>
                    
                    <div className="space-y-3 text-sm text-slate-300">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-4 h-4 opacity-70" />
                            <span>{eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 opacity-70" />
                            <span>{eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 opacity-70 mt-0.5" />
                            <span className="line-clamp-2">{ticket.events.location}</span>
                        </div>
                    </div>
                </div>

                {/* Perforaj (Bilet Koparma Çizgisi efekti) */}
                <div className="relative h-8 bg-slate-900 overflow-hidden flex items-center justify-between">
                    <div className="w-4 h-8 bg-slate-50 rounded-r-full absolute left-0" />
                    <div className="flex-1 border-t-2 border-dashed border-slate-700 mx-4" />
                    <div className="w-4 h-8 bg-slate-50 rounded-l-full absolute right-0" />
                </div>

                {/* Alt Kısım: QR Kod ve Pin */}
                <div className="p-8 bg-white flex flex-col items-center justify-center flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Kapı Giriş Kodu</p>
                    
                    <div className={`p-4 rounded-2xl border-2 mb-6 transition-all ${isScanned ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                        {showQR ? (
                            <QRCodeSVG 
                                value={ticket.qr_hash} 
                                size={200} 
                                level="H" 
                                includeMargin={true}
                                className="rounded-xl shadow-sm bg-white"
                            />
                        ) : (
                            <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-100 rounded-xl">
                                <Ticket className="w-16 h-16 text-slate-300" />
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center mb-6">
                        <p className="text-xs text-slate-500 font-medium mb-1">Kimlik PIN Kodu</p>
                        <p className="text-2xl font-mono font-bold text-slate-800 tracking-widest">
                            {ticket.pin_code}
                        </p>
                    </div>

                    {/* Sadece aktif ve yaklaşan etkinlikler için iptal butonu gösterilir */}
                    {!isCancelled && !isPast && !isScanned && (
                        <div className="w-full mt-auto pt-6 border-t border-slate-100 relative z-40">
                            <TicketCancelButton 
                                ticketId={ticket.id} 
                                pinCode={passport.pin_code} 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
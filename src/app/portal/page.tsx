import { redirect } from 'next/navigation'
import { Ticket, CalendarX2, ShieldCheck, ArrowRight, Award } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'
import CertificateGenerator from '@/components/portal/CertificateGenerator'

import { getCurrentPassport } from '@/actions/passports'
import { getUserTickets } from '@/actions/tickets'
import { TICKET_STATUS, TICKET_STATUS_LABELS } from '@/types/tickets'

import LogoutButton from '@/components/portal/LogoutButton' 

// --- TİP TANIMLAMALARI (Clean Code: Type Safety) ---
interface PortalTicket {
    id: string;
    status: number;
    events: {
        title: string;
        event_date: string;
        location: string;
    } | null; 
}

export default async function PortalPage() {
    // 1. Pasaportu Sunucuda Doğrula
    const passport = await getCurrentPassport()
    if (!passport) {
        redirect('/pasaport')
    }

    // 2. Biletleri Getir 
    const { tickets, error } = await getUserTickets(passport.pin_code)
    
    // Güvenli Hata Yönetimi (Silent failure engellemesi)
    if (error) {
        console.error(`[Portal Error] ${passport.pin_code} için biletler çekilemedi:`, error)
    }
    
    const validTickets = (tickets || []) as PortalTicket[]

    // 3. Sertifika Hakkı Kontrolü (En az 1 tane SCANNED bilet var mı?)
    const hasAttendedEvent = validTickets.some(ticket => ticket.status === TICKET_STATUS.SCANNED)

    // İsim maskesini güvenli bir şekilde oluşturma
    const maskedName = passport.name_mask?.replace(/\d/g, (match: string) => '*'.repeat(parseInt(match, 10))) || 'Anonim'

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
                            <h1 className="text-xl font-bold text-slate-800">
                                Hoş Geldin, {maskedName}
                            </h1>
                            <p className="text-sm text-slate-500">Anonim kimliğin güvende ve aktif.</p>
                        </div>
                    </div>
                    {/* Logout butonunu Client Component yaptık */}
                    <LogoutButton /> 
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SOL KISIM: Dijital Pasaport Kartı */}
                    <div className="md:col-span-1">
                        <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-1 rounded-3xl shadow-lg relative overflow-hidden group h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                                <Ticket className="h-32 w-32" />
                            </div>
                            
                            <div className="bg-white rounded-[22px] p-6 text-center relative z-10 h-full flex flex-col justify-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Genel Tarama İçin Hazır</p>
                                
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
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-brand-500" /> Biletlerim ve Etkinlikler
                            </h2>
                            
                            {/* BİLET LİSTESİ */}
                            <div className="flex-1 flex flex-col gap-4">
                                {validTickets.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <CalendarX2 className="h-12 w-12 text-slate-300 mb-4" />
                                        <h3 className="text-slate-700 font-semibold mb-1">Henüz Biletiniz Yok</h3>
                                        <p className="text-sm text-slate-500 max-w-sm">
                                            Topluluğun düzenlediği etkinliklere katılarak biletlerinizi burada görüntüleyebilirsiniz.
                                        </p>
                                    </div>
                                ) : (
                                    validTickets.map((ticket) => {
                                        // 🚨 Null Safety: Eğer veritabanı hatasıyla yetim bir bilet kalmışsa (events null ise) crash olmasını engelle
                                        if (!ticket.events) return null;

                                        const eventDate = new Date(ticket.events.event_date);
                                        const isPast = eventDate < new Date();
                                        const isActive = ticket.status === TICKET_STATUS.ACTIVE && !isPast;
                                        
                                        return (
                                            <Link 
                                                key={ticket.id} 
                                                href={`/portal/ticket/${ticket.id}`}
                                                className="group relative flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-md transition-all overflow-hidden"
                                            >
                                                {/* İptal Edilmişse veya Geçmişse Soluk Göster */}
                                                {(ticket.status === TICKET_STATUS.CANCELLED || isPast) && (
                                                    <div className="absolute inset-0 bg-slate-50/80 z-10"></div>
                                                )}

                                                <div className="relative z-20 flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide
                                                            ${ticket.status === TICKET_STATUS.ACTIVE ? 'bg-green-100 text-green-700' : 
                                                              ticket.status === TICKET_STATUS.SCANNED ? 'bg-blue-100 text-blue-700' : 
                                                              'bg-red-100 text-red-700'}`}
                                                        >
                                                            {TICKET_STATUS_LABELS[ticket.status]}
                                                        </span>
                                                        {isPast && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 uppercase">Geçmiş Etkinlik</span>}
                                                    </div>
                                                    <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                                                        {ticket.events.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                        {eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span className="line-clamp-1">{ticket.events.location}</span>
                                                    </p>
                                                </div>

                                                <div className="relative z-20 pl-4">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-brand-50 group-hover:bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <ArrowRight className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ALT KISIM: KAZANIMLARIM VE SERTİFİKALAR */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" /> Kazanımlarım ve Sertifikalar
                    </h2>
                    
                    {hasAttendedEvent ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100/50">
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-bold text-amber-900 mb-1">Katılım Sertifikanız Hazır!</h3>
                                <p className="text-sm text-amber-700 max-w-md">
                                    Etkinliklerimize gösterdiğiniz değerli katılım için teşekkür ederiz. Sistem tarafından doğrulanabilir dijital sertifikanızı hemen üretebilirsiniz.
                                </p>
                            </div>
                            <div className="shrink-0">
                                <CertificateGenerator pinCode={passport.pin_code} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Award className="h-10 w-10 text-slate-300 mb-3" />
                            <h3 className="text-slate-700 font-semibold mb-1">Henüz Sertifika Hakkınız Yok</h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                                Sertifika üretebilmek için en az bir etkinliğimize katılım sağlamanız (yoklamanızın alınmış olması) gerekmektedir.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
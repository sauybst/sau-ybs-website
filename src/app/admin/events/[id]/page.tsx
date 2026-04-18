import { getEventDashboardData } from '@/actions/events'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { 
    ArrowLeft, 
    Users, 
    UserCheck, 
    UserMinus, 
    Clock, 
    Edit, 
    Calendar, 
    MapPin,
    Ticket as TicketIcon,
    Search
} from 'lucide-react'
import { TICKET_STATUS } from '@/types/tickets'
import { TICKETING_MODE } from '@/types/event'
import ExportTicketsButton from '@/components/events/ExportTicketsButton'
import ParticipantDetailSheet from '@/components/events/ParticipantDetailSheet'
import RaffleModule from '@/components/events/RaffleModule'
import ScannerSessionStarter from '@/components/events/ScannerSessionStarter'
import PinSearch from '@/components/events/PinSearch'

// --- TİP TANIMLAMALARI (Clean Code: Type Safety) ---
interface Props {
    params: Promise<{ id: string }>
}

interface AttendanceRecord {
    id: string;
    passport_pin?: string;
    pin_code?: string;
    session_name: string;
    scanned_at?: string;
    created_at?: string;
}

const normalizePin = (pin?: string | null) => (pin || '').trim().toUpperCase()

function buildAttendanceMap(attendances: AttendanceRecord[] = []) {
    return attendances.reduce((acc: Record<string, AttendanceRecord[]>, attendance) => {
        const pin = normalizePin(attendance.passport_pin ?? attendance.pin_code)
        if (!pin) return acc

        if (!acc[pin]) acc[pin] = []
        acc[pin].push(attendance)
        return acc
    }, {})
}

export default async function EventDashboardPage({ params }: Props) {
    const { id } = await params
    const data = await getEventDashboardData(id)

    if (data.error?.includes('yetki')) {
        redirect('/admin')
    }
    
    if (data.error || !data.event || !data.stats) {
        return notFound()
    }

    const { event, tickets, attendances, stats } = data
    
    const isBusMode = event.ticketing_mode === TICKETING_MODE.BUS_QR
    const occupancyRate = event.capacity ? Math.round((stats.totalValid / event.capacity) * 100) : 0
    
    // Temizlenmiş veri haritası
    const attendanceMap = buildAttendanceMap(attendances)

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
            
            {/* ÜST HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Link href="/admin/events" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Etkinlik Listesine Dön
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                            {event.title}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${new Date(event.event_date) > new Date() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {new Date(event.event_date) > new Date() ? 'Yaklaşan' : 'Geçmiş'}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                        <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-brand-500" />
                            {new Date(event.event_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-brand-500" />
                            {event.location}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ScannerSessionStarter eventId={id} ticketingMode={event.ticketing_mode} />

                    <Link href={`/admin/events/edit/${id}`} className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors" title="Etkinliği Düzenle">
                        <Edit className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative group">
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Toplam Bilet</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.totalValid} <span className="text-lg text-slate-300 font-medium">/ {event.capacity}</span></h3>
                        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full transition-all duration-1000" style={{ width: `${occupancyRate}%` }} />
                        </div>
                    </div>
                    <Users className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-50 opacity-10 group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Giriş Yapanlar</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.scanned}</h3>
                        <p className="mt-2 text-xs text-slate-400 font-medium italic">Toplam katılım oranı: %{stats.totalValid > 0 ? Math.round((stats.scanned / stats.totalValid) * 100) : 0}</p>
                    </div>
                    <UserCheck className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-50 opacity-20 group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">Bekleyenler</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.active}</h3>
                        <p className="mt-2 text-xs text-slate-400 font-medium italic">Henüz kapıya gelmemiş biletler</p>
                    </div>
                    <Clock className="absolute -right-4 -bottom-4 h-24 w-24 text-amber-50 opacity-20 group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-1">İptaller</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.cancelled}</h3>
                        <p className="mt-2 text-xs text-slate-400 font-medium italic">Sistemden geri bırakılan kontenjan</p>
                    </div>
                    <UserMinus className="absolute -right-4 -bottom-4 h-24 w-24 text-rose-50 opacity-20 group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* KATILIMCI LİSTESİ TABLOSU */}
            <div className="p-6 border-b border-slate-50 flex flex-col gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Katılımcı Listesi</h2>
                    <p className="text-sm text-slate-500">Tüm bilet hareketlerini ve giriş zamanlarını takip edin.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <RaffleModule eventId={id} />
                    <ExportTicketsButton tickets={tickets} eventTitle={event.title} />
                    <PinSearch />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Pasaport PIN</th>
                                <th className="px-6 py-4">Bilet Durumu</th>
                                
                                {/* DİNAMİK SÜTUN: Etkinlik Otobüs Modundaysa Oturum Sütunu Eklenir */}
                                {isBusMode ? (
                                    <th className="px-6 py-4">Oturum Kayıtları (Yoklama)</th>
                                ) : (
                                    <th className="px-6 py-4">Son İşlem Saati</th>
                                )}
                                
                                <th className="px-6 py-4">Bilet Alma Tarihi</th>
                                <th className="px-6 py-4 text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tickets.map((ticket) => {
                                const userAttendances = attendanceMap[normalizePin(ticket.pin_code)] || []

                                return (
                                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                <TicketIcon className="h-4 w-4" />
                                            </div>
                                            <span className="font-mono font-bold text-slate-700 tracking-wider">
                                                {ticket.pin_code}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest
                                            ${ticket.status === TICKET_STATUS.SCANNED ? 'bg-emerald-100 text-emerald-700' : 
                                              ticket.status === TICKET_STATUS.CANCELLED ? 'bg-rose-100 text-rose-700' : 
                                              'bg-blue-100 text-blue-700'}
                                        `}>
                                            {ticket.status === TICKET_STATUS.SCANNED ? 'Okutuldu' : 
                                             ticket.status === TICKET_STATUS.CANCELLED ? 'İptal' : 'Aktif'}
                                        </span>
                                    </td>

                                    {/* OTOBÜS MODU ROZETLERİ VEYA STANDART SAAT */}
                                    {isBusMode ? (
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {userAttendances.map((att) => (
                                                    <span key={att.id} className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-[9px] font-bold uppercase tracking-widest shadow-sm">
                                                        {att.session_name}
                                                    </span>
                                                ))}
                                                {userAttendances.length === 0 && (
                                                    <span className="text-xs text-slate-400 italic">Kayıt Yok</span>
                                                )}
                                            </div>
                                        </td>
                                    ) : (
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {ticket.status === TICKET_STATUS.SCANNED ? (
                                                <span className="text-emerald-600 font-medium">
                                                    {new Date(ticket.updated_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    )}

                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(ticket.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <ParticipantDetailSheet ticket={ticket} />
                                    </td>
                                </tr>
                                )
                            })}

                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Henüz bu etkinlik için bilet alınmamış.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
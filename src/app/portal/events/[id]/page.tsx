import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarIcon, MapPin, Clock, ArrowLeft, Ticket, AlertCircle, CheckCircle2, Users } from 'lucide-react'

import { getCurrentPassport } from '@/actions/passports'
import { TICKETING_MODE } from '@/types/event'
import { TICKET_STATUS } from '@/types/tickets'
import TicketAcquireButton from './TicketAcquireButton'

type Props = {
    params: Promise<{ id: string }>
}

export default async function EventTicketConfirmationPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const passport = await getCurrentPassport()

    if (!passport) redirect('/pasaport')

    // 1. Etkinlik Bilgilerini Çek
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (eventError || !event) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Etkinlik Bulunamadı</h2>
                <p className="text-slate-500 mb-6">Aradığınız etkinlik sistemde mevcut değil veya silinmiş.</p>
                <Link href="/events" className="text-brand-600 font-semibold hover:underline">Vitrine Geri Dön</Link>
            </div>
        )
    }

    // Serbest katılımlı etkinliğe bilet almaya çalışıyorsa engelle
    if (event.ticketing_mode === TICKETING_MODE.FREE) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <Users className="w-16 h-16 text-brand-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Bu Etkinlik Serbest Katılımlıdır</h2>
                <p className="text-slate-500 mb-6">Bu etkinlik için dijital bilet almanıza gerek yoktur.</p>
                <Link href={`/events/${event.slug}`} className="text-brand-600 font-semibold hover:underline">Etkinliğe Geri Dön</Link>
            </div>
        )
    }

    // 2. Öğrenci bu bileti daha önce almış mı? (Aktif bir bileti var mı?)
    const { data: existingTicket } = await supabase
        .from('tickets')
        .select('id')
        .eq('event_id', id)
        .eq('pin_code', passport.pin_code)
        .eq('status', TICKET_STATUS.ACTIVE)
        .single()

    const hasTicket = !!existingTicket
    const isFull = event.capacity !== null && event.purchased_tickets >= event.capacity
    const eventDate = new Date(event.event_date)

    return (
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
            <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Etkinlik Detayına Dön
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Üst Bilgi (Banner) */}
                <div className="bg-slate-900 h-48 relative flex items-center justify-center overflow-hidden p-8">
                    {event.image_url ? (
                        <>
                            <Image src={event.image_url} alt="" fill className="object-cover blur-xl opacity-40 scale-110" />
                            <Image src={event.image_url} alt={event.title} fill className="object-contain p-4 relative z-10 drop-shadow-2xl" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900" />
                    )}
                </div>

                <div className="p-8 sm:p-10">
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 mb-4">
                            Bilet Onayı
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mb-4 leading-tight">
                            {event.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                            <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                                {eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                {event.location}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8 mt-8">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 text-center">
                            İşlem Durumu
                        </h3>

                        {/* SENARYO 1: Zaten Bilet Almış */}
                        {hasTicket ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h4 className="text-lg font-bold text-green-900 mb-1">Biletiniz Zaten Var!</h4>
                                <p className="text-green-700 text-sm mb-6">Bu etkinlik için daha önce dijital bilet oluşturmuşsunuz.</p>
                                <Link href="/portal" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white bg-green-600 hover:bg-green-700 font-semibold transition-colors">
                                    Cüzdanıma Git
                                </Link>
                            </div>
                        ) : 
                        /* SENARYO 2: Kontenjan Dolu */
                        isFull ? (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <h4 className="text-lg font-bold text-red-900 mb-1">Kontenjan Dolu</h4>
                                <p className="text-red-700 text-sm mb-6">Maalesef bu etkinlik için tüm biletler tükenmiştir.</p>
                                <button disabled className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-red-400 bg-red-100 font-semibold cursor-not-allowed">
                                    Bilet Alınamaz
                                </button>
                            </div>
                        ) : 
                        /* SENARYO 3: Bilet Almaya Uygun */
                        (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200">
                                    <span className="text-slate-600 font-medium">İşlem Yapılacak Kimlik</span>
                                    <span className="font-mono font-bold text-brand-600 bg-brand-100 px-3 py-1 rounded-lg">
                                        {passport.pin_code}
                                    </span>
                                </div>
                                
                                <TicketAcquireButton 
                                    eventId={event.id}
                                    pinCode={passport.pin_code}
                                    keywordHash={passport.keyword_hash}
                                />
                                <p className="text-xs text-center text-slate-400 mt-4">
                                    Bu işlem kontenjandan 1 kişilik yer ayıracaktır.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
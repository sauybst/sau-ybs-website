import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { CalendarIcon, MapPin, ArrowRight, ExternalLink, Clock } from 'lucide-react'

export const metadata = {
    title: 'Etkinlikler - YBS Topluluğu',
    description: 'Sakarya Üniversitesi YBS Topluluğu etkinlikleri',
}

export default async function PublicEventsPage() {
    const supabase = await createClient()

    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Takvim</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Etkinliklerimiz</h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-light">
                        İdeathonlar, eğitimler, seminerler ve anma programları. Geçmişten geleceğe tüm YBS buluşmaları.
                    </p>
                </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {(!events || events.length === 0) ? (
                        <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                            Şu an için listelenmiş bir etkinlik bulunmamaktadır.
                        </p>
                    ) : (
                        events.map((event) => {
                            const isUpcoming = new Date(event.event_date) > new Date()

                            return (
                                <div key={event.id} className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group">
                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${isUpcoming ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-slate-800/90 text-white'}`}>
                                            {isUpcoming ? 'Yaklaşan' : 'Geçmiş'}
                                        </span>
                                    </div>

                                    <div className="h-60 bg-slate-100 w-full relative overflow-hidden">
                                        {event.image_url ? (
                                            <img src={event.image_url} alt={event.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center text-brand-300">
                                                <CalendarIcon className="h-20 w-20 opacity-40" />
                                            </div>
                                        )}
                                        {/* Date Overlay */}
                                        <div className="absolute top-4 left-4">
                                            <div className="flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/50 w-16 h-16">
                                                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 w-full text-center py-1">
                                                    {new Date(event.event_date).toLocaleDateString('tr-TR', { month: 'short' })}
                                                </span>
                                                <span className="text-2xl font-heading font-extrabold text-slate-900 leading-none mt-1">
                                                    {new Date(event.event_date).getDate()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center space-x-2 text-sm text-brand-500 font-semibold mb-3">
                                            <Clock className="h-4 w-4" />
                                            <time dateTime={event.event_date}>
                                                {new Date(event.event_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                        </div>

                                        <h3 className="text-2xl font-heading font-bold text-slate-900 mb-4 tracking-tight leading-tight group-hover:text-brand-600 transition-colors">
                                            {event.title}
                                        </h3>

                                        <div className="flex items-start text-slate-500 text-sm mb-6">
                                            <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-brand-400 mt-0.5" />
                                            <span>{event.location}</span>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                                            {event.registration_url && isUpcoming ? (
                                                <a href={event.registration_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all w-full group-hover:-translate-y-0.5">
                                                    Hemen Kayıt Ol <ExternalLink className="ml-2 -mr-1 h-4 w-4" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-sm italic font-medium">
                                                    {isUpcoming ? 'Kayıt linki yok' : 'Etkinlik sona erdi'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            </div>
        </div>
    )
}

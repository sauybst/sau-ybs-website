import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { CalendarIcon, MapPin, ArrowRight, ExternalLink } from 'lucide-react'

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
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Etkinliklerimiz</h1>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        İdeathonlar, eğitimler, seminerler ve anma programları. Geçmişten geleceğe tüm YBS buluşmaları.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {(!events || events.length === 0) ? (
                        <p className="text-gray-500 col-span-3 text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                            Şu an için listelenmiş bir etkinlik bulunmamaktadır.
                        </p>
                    ) : (
                        events.map((event) => {
                            const isUpcoming = new Date(event.event_date) > new Date()

                            return (
                                <div key={event.id} className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider backdrop-blur-md ${isUpcoming ? 'bg-green-500/90 text-white' : 'bg-gray-800/80 text-white'}`}>
                                            {isUpcoming ? 'Yaklaşan' : 'Geçmiş'}
                                        </span>
                                    </div>

                                    <div className="h-64 bg-slate-100 w-full relative overflow-hidden">
                                        {event.image_url ? (
                                            <img src={event.image_url} alt={event.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-50 flex items-center justify-center text-indigo-300">
                                                <CalendarIcon className="h-20 w-20 opacity-40" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center space-x-2 text-sm text-indigo-600 font-semibold mb-3">
                                            <CalendarIcon className="h-4 w-4" />
                                            <time dateTime={event.event_date}>
                                                {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                            {event.title}
                                        </h3>

                                        <div className="flex items-start text-gray-600 text-sm mb-6">
                                            <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-gray-400 mt-0.5" />
                                            <span>{event.location}</span>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                            {event.registration_url && isUpcoming ? (
                                                <a href={event.registration_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors w-full">
                                                    Kayıt Ol <ExternalLink className="ml-2 -mr-1 h-4 w-4" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">
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
    )
}

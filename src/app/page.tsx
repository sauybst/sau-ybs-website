import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Calendar as CalendarIcon, MapPin, ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  // Fetch only upcoming events, limit to 3
  const { data: upcomingEvents, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3)

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-indigo-900 py-20 text-white relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-90 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 mt-8">
            Sakarya Üniversitesi YBS Topluluğu
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl md:text-2xl text-indigo-200">
            Geleceğin liderlerini, teknolojiyi ve yönetimi birleştiren bilişimciler olarak vizyonumuz.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="#events" className="rounded-full bg-indigo-500 px-8 py-3 text-lg font-semibold hover:bg-indigo-400 transition shadow-lg">
              Etkinliklerimizi İncele
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 bg-white w-full flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Yaklaşan Etkinlikler</h2>
            <Link href="/events" className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center transition-colors">
              Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(!upcomingEvents || upcomingEvents.length === 0) ? (
              <p className="text-gray-500 col-span-3 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                Şu an için yaklaşan veya listelenmiş bir etkinlik bulunmamaktadır.
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group">
                  <div className="h-48 bg-slate-200 w-full relative overflow-hidden">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-indigo-100 flex items-center justify-center text-indigo-300">
                        <CalendarIcon className="h-16 w-16 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-sm font-semibold text-indigo-600 mb-2 uppercase tracking-wider">
                      {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
                      <Link href={`/events/${event.slug}`}>
                        {event.title}
                      </Link>
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="mt-auto">
                      <Link href={`/events/${event.slug}`} className="text-indigo-600 font-medium text-sm hover:text-indigo-800 flex items-center group-hover:underline">
                        Detayları İncele
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

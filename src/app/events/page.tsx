import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import EventListCard from '@/components/events/EventListCard'
import type { EventListItem } from '@/types/event'

export const metadata: Metadata = {
  title: 'Etkinlikler',
  description:
    'Sakarya Üniversitesi YBS Topluluğu etkinlikleri — ideathonlar, eğitimler, seminerler ve anma programları.',
  alternates: { canonical: '/events' },
}

const EVENT_LIST_SELECT = 'id,slug,title,event_date,location,image_url,registration_url,ticketing_mode,capacity,purchased_tickets' as const

type SearchParams = Promise<{ filter?: string }>

export default async function PublicEventsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { filter } = await searchParams
  const currentFilter = filter === 'past' ? 'past' : 'upcoming'

  const supabase = await createClient()

  /* Filtrelemeyi Supabase seviyesinde yap — gereksiz veri çekmekten kaçın */
  const now = new Date().toISOString()
  let query = supabase
    .from('events')
    .select(EVENT_LIST_SELECT)
    .order('event_date', { ascending: currentFilter === 'upcoming' })

  if (currentFilter === 'upcoming') {
    query = query.gte('event_date', now)
  } else {
    query = query.lt('event_date', now)
  }

  const { data: events, error } = await query

  if (error) {
    console.error('[Public Events Error]: Veriler çekilirken hata oluştu:', error.message)
  }

  const typedEvents = (events ?? []) as EventListItem[]
  const isUpcoming = currentFilter === 'upcoming'

  return (
    <section aria-label="Etkinlik listesi" className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <header className="text-center mb-12">
          <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">
            Takvim
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
            Etkinliklerimiz
          </h1>
          <p className="mt-4 max-w-2xl text-medium text-slate-600 mx-auto font-montserrat">
            İdeathonlar, eğitimler, seminerler ve anma programları. Geçmişten geleceğe tüm YBS buluşmaları.
          </p>

          {/* Filtre */}
          <nav aria-label="Etkinlik filtresi" className="flex justify-center items-center gap-4 mt-8">
            <Link
              href="?filter=upcoming"
              scroll={false}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                currentFilter === 'upcoming'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Yaklaşan Etkinlikler
            </Link>
            <Link
              href="?filter=past"
              scroll={false}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                currentFilter === 'past'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Geçmiş Etkinlikler
            </Link>
          </nav>
        </header>

        {/* Etkinlik Kartları */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {typedEvents.length === 0 ? (
            <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
              Şu an için listelenmiş bir etkinlik bulunmamaktadır.
            </p>
          ) : (
            typedEvents.map((event) => (
              <EventListCard key={event.id} event={event} isUpcoming={isUpcoming} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
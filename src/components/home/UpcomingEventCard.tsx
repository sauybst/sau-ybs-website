import Link from 'next/link'
import Image from 'next/image'
import { Calendar as CalendarIcon, MapPin } from 'lucide-react'
import type { UpcomingEvent } from '@/lib/home-data'

export default function UpcomingEventCard({ event }: { event: UpcomingEvent }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-64 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {event.image_url ? (
          <>
            <div className="absolute inset-0 opacity-50" aria-hidden="true">
              <Image
                src={event.image_url}
                alt=""
                fill
                className="object-cover blur-xl scale-125 group-hover:scale-150 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="relative z-10 object-contain p-3 group-hover:scale-105 transition-transform duration-700 drop-shadow-xl"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center text-brand-300"
            aria-hidden="true"
          >
            <CalendarIcon className="h-16 w-16 opacity-50" />
          </div>
        )}

        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-sm text-brand-700 shadow-sm border border-white/50">
            <time dateTime={event.event_date}>
              {new Date(event.event_date).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
              })}
            </time>
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-heading font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {event.title}
        </h3>
        <div className="flex items-center text-slate-500 text-sm mt-auto">
          <MapPin className="h-4 w-4 mr-1.5 text-brand-400 flex-shrink-0" />
          <span className="truncate">{event.location ?? 'Belirtilmedi'}</span>
        </div>
      </div>
    </Link>
  )
}

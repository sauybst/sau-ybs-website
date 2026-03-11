import Link from 'next/link'
import Image from 'next/image'
import { Calendar as CalendarIcon, MapPin, Clock, ExternalLink } from 'lucide-react'
import type { EventListItem } from '@/types/event'

type EventListCardProps = {
  event: EventListItem
  isUpcoming: boolean
}

export default function EventListCard({ event, isUpcoming }: EventListCardProps) {
  const eventDate = new Date(event.event_date)

  return (
    <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group">
      {/* Yaklaşan / Geçmiş Rozeti */}
      <div className="absolute top-4 right-4 z-20">
        <span
          className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
            isUpcoming
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
              : 'bg-slate-800/90 text-white'
          }`}
        >
          {isUpcoming ? 'Yaklaşan' : 'Geçmiş'}
        </span>
      </div>

      {/* Görsel Alanı */}
      <div className="h-72 bg-slate-900 w-full relative overflow-hidden flex items-center justify-center">
        {event.image_url ? (
          <>
            <div className="absolute inset-0 opacity-50" aria-hidden="true">
              <Image
                src={event.image_url}
                alt=""
                fill
                className="object-cover blur-xl scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="relative z-10 object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-in-out drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center text-brand-300"
            aria-hidden="true"
          >
            <CalendarIcon className="h-20 w-20 opacity-40" />
          </div>
        )}

        {/* Tarih Overlay */}
        <div className="absolute top-4 left-4 z-20">
          <time
            dateTime={event.event_date}
            className="flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/50 w-16 h-16"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 w-full text-center py-1">
              {eventDate.toLocaleDateString('tr-TR', { month: 'short' })}
            </span>
            <span className="text-2xl font-heading font-extrabold text-slate-900 leading-none mt-1">
              {eventDate.getDate()}
            </span>
          </time>
        </div>
      </div>

      {/* Kart İçeriği */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center space-x-2 text-sm text-brand-500 font-semibold mb-3">
          <Clock className="h-4 w-4" />
          <time dateTime={event.event_date}>
            {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>

        <h3 className="text-2xl font-heading font-bold text-slate-900 mb-4 tracking-tight leading-tight group-hover:text-brand-600 transition-colors">
          <Link href={`/events/${event.slug}`}>
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            {event.title}
          </Link>
        </h3>

        <div className="flex items-start text-slate-500 text-sm mb-6">
          <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-brand-400 mt-0.5" />
          <span>{event.location}</span>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          {event.registration_url && isUpcoming ? (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all w-full group-hover:-translate-y-0.5"
            >
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
}

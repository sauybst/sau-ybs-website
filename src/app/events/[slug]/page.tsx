import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarIcon, MapPin, Clock, ArrowLeft, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'

import ShareButton from '@/components/ShareButton'
import EventJsonLd from '@/components/events/EventJsonLd'
import { sanitizeHtml } from '@/lib/sanitize'
import type { EventDetail } from '@/types/event'

export const dynamic = 'force-dynamic'

/** Detay sayfasında kullanılan alanlar */
const EVENT_DETAIL_SELECT = 'id,slug,title,event_date,location,description,image_url,registration_url' as const

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, description, image_url')
    .eq('slug', slug)
    .single()

  if (!event) return {}

  const cleanDescription =
    event.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'

  return {
    title: event.title,
    description: cleanDescription,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title: event.title,
      description: cleanDescription,
      images: [
        {
          url: event.image_url || '/og-default.webp',
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: cleanDescription,
      images: [event.image_url || '/og-default.webp'],
    },
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select(EVENT_DETAIL_SELECT)
    .eq('slug', slug)
    .single()

  if (error || !event) {
    notFound()
  }

  const typedEvent = event as EventDetail
  const eventDate = new Date(typedEvent.event_date)
  const isUpcoming = eventDate > new Date()

  /* XSS koruması: Veritabanından gelen HTML'i DOMPurify ile temizle */
  const safeDescription = typedEvent.description
    ? sanitizeHtml(typedEvent.description)
    : '<p>Bu etkinlik için henüz bir açıklama girilmemiş.</p>'

  return (
    <section aria-label="Etkinlik detayı" className="bg-slate-50 min-h-screen pt-24 pb-16">
      {/* JSON-LD Yapılandırılmış Veri */}
      <EventJsonLd event={typedEvent} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Geri Dön */}
        <Link
          href="/events"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Etkinliklere Dön
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Görsel Alanı */}
          <div className="h-[28rem] sm:h-[36rem] w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
            {typedEvent.image_url ? (
              <>
                <div className="absolute inset-0 opacity-40" aria-hidden="true">
                  <Image
                    src={typedEvent.image_url}
                    alt=""
                    fill
                    className="object-cover blur-2xl scale-125"
                    sizes="100vw"
                    priority
                  />
                </div>
                <Image
                  src={typedEvent.image_url}
                  alt={typedEvent.title}
                  fill
                  className="relative z-10 object-contain p-4 sm:p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              </>
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-brand-300"
                aria-hidden="true"
              >
                <CalendarIcon className="h-32 w-32 opacity-20" />
              </div>
            )}

            {/* Yaklaşan / Geçmiş Rozeti */}
            <div className="absolute top-6 right-6 z-10">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                  isUpcoming
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                    : 'bg-slate-800/90 text-white'
                }`}
              >
                {isUpcoming ? 'Yaklaşan Etkinlik' : 'Geçmiş Etkinlik'}
              </span>
            </div>
          </div>

          {/* İçerik */}
          <div className="p-8 sm:p-12">
            {/* Başlık ve Paylaş */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight flex-1">
                {typedEvent.title}
              </h1>
              <div className="flex-shrink-0 mt-1 sm:mt-0">
                <ShareButton title={typedEvent.title} />
              </div>
            </div>

            {/* Meta Bilgileri */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-center text-slate-600">
                <CalendarIcon className="w-5 h-5 mr-2 text-brand-500" />
                <time dateTime={typedEvent.event_date} className="font-medium">
                  {eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
              </div>
              <div className="flex items-center text-slate-600">
                <Clock className="w-5 h-5 mr-2 text-brand-500" />
                <time dateTime={typedEvent.event_date} className="font-medium">
                  {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(typedEvent.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-slate-600 hover:text-brand-600 transition-colors group"
                title="Google Haritalar'da Aç"
              >
                <MapPin className="w-5 h-5 mr-2 text-brand-500 group-hover:scale-110 group-hover:text-brand-600 transition-transform" />
                <span className="font-medium underline decoration-transparent group-hover:decoration-brand-300 underline-offset-4 transition-all">
                  {typedEvent.location}
                </span>
              </a>
            </div>

            {/* Açıklama — DOMPurify ile sanitize edilmiş HTML */}
            <div className="prose prose-slate prose-lg max-w-none font-montserrat prose-a:text-brand-600 hover:prose-a:text-brand-700">
              <div dangerouslySetInnerHTML={{ __html: safeDescription.replace(/&nbsp;|\u00A0/g, ' ') }} />
            </div>

            {/* Kayıt Butonu */}
            {isUpcoming && typedEvent.registration_url && (
              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                <a
                  href={typedEvent.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-brand-600 hover:bg-brand-500 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto"
                >
                  Etkinliğe Kayıt Ol <ExternalLink className="ml-2 w-5 h-5" />
                </a>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
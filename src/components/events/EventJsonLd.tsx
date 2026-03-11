import type { EventDetail } from '@/types/event'

type EventJsonLdProps = {
  event: EventDetail
}

/**
 * Etkinlik detay sayfası için JSON-LD yapılandırılmış verisi.
 * Google etkinlik aramasında zengin snippet gösterilmesini sağlar.
 * @see https://schema.org/Event
 */
export default function EventJsonLd({ event }: EventJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.event_date,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    description: event.description?.replace(/<[^>]*>?/gm, '').substring(0, 300),
    image: event.image_url || 'https://www.sauybst.com/og-default.webp',
    organizer: {
      '@type': 'Organization',
      name: 'SAÜ YBS Topluluğu',
      url: 'https://www.sauybst.com',
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.registration_url && {
      offers: {
        '@type': 'Offer',
        url: event.registration_url,
        price: '0',
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

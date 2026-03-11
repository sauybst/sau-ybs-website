/**
 * Veritabanındaki `events` tablosunun TypeScript karşılığı.
 * Tüm events sayfalarında ortak kullanılır.
 */
export type Event = {
  id: string
  title: string
  slug: string
  event_date: string
  location: string
  description: string | null
  image_url: string | null
  registration_url: string | null
  created_by: string | null
  created_at: string
}

/** events/page.tsx listesi için yalnızca gerekli alanlar */
export type EventListItem = Pick<
  Event,
  'id' | 'slug' | 'title' | 'event_date' | 'location' | 'image_url' | 'registration_url'
>

/** events/[slug]/page.tsx detayı için gerekli alanlar */
export type EventDetail = Pick<
  Event,
  'id' | 'slug' | 'title' | 'event_date' | 'location' | 'description' | 'image_url' | 'registration_url'
>

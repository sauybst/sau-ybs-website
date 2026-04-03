/**
 * Veritabanındaki `events` tablosunun TypeScript karşılığı.
 * Tüm events sayfalarında ortak kullanılır.
 */

export type EventType = 'TICKETED' | 'PASSPORT_CHECKIN' | 'TRIP' | 'STANDARD';


export const TICKETING_MODE = {
  FREE: 0,
  STANDARD_QR: 1,
  BUS_QR: 2,
} as const;


export const TICKETING_MODE_LABELS: Record<number, string> = {
  [TICKETING_MODE.FREE]: 'Serbest Katılım',
  [TICKETING_MODE.STANDARD_QR]: 'Salon (QR Bilet)',
  [TICKETING_MODE.BUS_QR]: 'Otobüslü Gezi (QR Bilet)',
};


export type TicketingMode = typeof TICKETING_MODE[keyof typeof TICKETING_MODE];

export type Event = {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  location: string;
  description: string | null;
  image_url: string | null;
  registration_url: string | null;
  created_by: string | null;
  created_at: string;
  event_type: EventType;
  capacity?: number | null;
  ticket_price?: number | null;
  
  ticketing_mode: TicketingMode;
  purchased_tickets: number;
}

/** events/page.tsx listesi için yalnızca gerekli alanlar */
export type EventListItem = Pick<
  Event,
  'id' | 'slug' | 'title' | 'event_date' | 'location' | 'image_url' | 'registration_url' | 'ticketing_mode' | 'capacity' | 'purchased_tickets'
>

/** events/[slug]/page.tsx detayı için gerekli alanlar */
export type EventDetail = Pick<
  Event,
  'id' | 'slug' | 'title' | 'event_date' | 'location' | 'description' | 'image_url' | 'registration_url' | 'ticketing_mode' | 'capacity' | 'purchased_tickets'
>
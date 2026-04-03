/**
 * Veritabanındaki `tickets` tablosunun TypeScript karşılığı.
 * Cüzdan, Bilet Alma ve QR Okutma sistemlerinde ortak kullanılır.
 */

// 1. MAPPING: Bilet Durumları (Veritabanına yazılacak sayısal değerler)
export const TICKET_STATUS = {
  CANCELLED: 0,
  ACTIVE: 1,
  SCANNED: 2,
} as const;

// 2. MAPPING LABELS: Cüzdanda ve ekranda gösterilecek Türkçe rozet metinleri
export const TICKET_STATUS_LABELS: Record<number, string> = {
  [TICKET_STATUS.CANCELLED]: 'İptal Edildi',
  [TICKET_STATUS.ACTIVE]: 'Kullanıma Hazır',
  [TICKET_STATUS.SCANNED]: 'Kullanıldı (İçeri Girildi)',
};

// 3. TİP TANIMI: Durum sadece 0, 1 veya 2 olabilir
export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

// 4. TABLO MODELİ: Veritabanındaki tablonun birebir karşılığı
export type Ticket = {
  id: string;
  event_id: string;
  pin_code: string;
  qr_hash: string;
  keyword_hash: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
};

// 5. CÜZDAN MODELİ (JOIN): Öğrencinin "Biletlerim" sayfasında göreceği, etkinlik detaylarıyla birleştirilmiş model
export type TicketWithEvent = Ticket & {
  events: {
    title: string;
    slug: string;
    event_date: string;
    location: string;
    image_url: string | null;
  };
};
import { Building2, Laptop, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Çalışma modeli numarasına karşılık gelen etiket */
export const workModelLabels: Record<number, string> = {
  0: 'Yüzyüze',
  1: 'Uzaktan',
  2: 'Hibrit',
  3: 'Belirtilmemiş',
}

/** Çalışma modeli numarasına karşılık gelen ikon */
export const workModelIcons: Record<number, LucideIcon> = {
  0: Building2,
  1: Laptop,
  2: MapPin,
  3: Building2,
}

/** Schema.org employmentType eşlemesi */
export const workModelSchemaMap: Record<number, string> = {
  0: 'FULL_TIME',
  1: 'FULL_TIME',
  2: 'FULL_TIME',
  3: 'OTHER',
}

/** HTML etiketlerini temizleyip düz metin özeti oluşturur */
export function stripHtmlToPlainText(html: string): string {
  if (!html) return ''
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

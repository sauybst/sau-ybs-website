import { BookOpen, Megaphone, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type BlogTypeConfig = {
  name: string
  color: string
  icon: LucideIcon
}

/**
 * Blog type numarasına göre yapılandırma döndürür.
 * Hem liste hem detay sayfasında ortak kullanılır (DRY).
 */
export function getBlogTypeConfig(typeNum: number): BlogTypeConfig {
  if (typeNum === 1) {
    return {
      name: 'Makale',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: BookOpen,
    }
  }
  if (typeNum === 2) {
    return {
      name: 'Duyuru',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Megaphone,
    }
  }
  return {
    name: 'Blog',
    color: 'bg-brand-50 text-brand-700 border-brand-200',
    icon: FileText,
  }
}

/** URL filtresi için izin verilen type değerleri */
export const VALID_BLOG_TYPE_FILTERS = ['0', '1', '2'] as const

/** Filtre butonları verisi — map ile DRY kullanım */
export const blogFilterButtons = [
  { href: '/blogs?type=all', label: 'Tümü', filterValue: 'all', activeColor: 'bg-brand-600 shadow-brand-500/30' },
  { href: '/blogs?type=0', label: 'Blog Yazıları', filterValue: '0', activeColor: 'bg-brand-600 shadow-brand-500/30' },
  { href: '/blogs?type=1', label: 'Akademik Makaleler', filterValue: '1', activeColor: 'bg-purple-600 shadow-purple-500/30' },
  { href: '/blogs?type=2', label: 'Duyurular', filterValue: '2', activeColor: 'bg-amber-500 shadow-amber-500/30' },
] as const

/**
 * Veritabanındaki `board_members` tablosunun TypeScript karşılığı.
 * Alanlar mevcut koddan çıkarılmıştır.
 */
export type BoardMember = {
  id: string
  slug: string
  full_name: string
  board_role: string
  board_level: string | null
  term_year: string
  is_active: boolean
  image_url: string | null
  linkedin_url: string | null
  description: string | null
  created_at: string
}

/** Liste sayfasında kart için gerekli alanlar */
export type BoardMemberListItem = Pick<
  BoardMember,
  'id' | 'slug' | 'full_name' | 'board_role' | 'board_level' | 'term_year' | 'is_active' | 'image_url' | 'linkedin_url'
>

/** Detay sayfası için gerekli alanlar */
export type BoardMemberDetail = Pick<
  BoardMember,
  'id' | 'slug' | 'full_name' | 'board_role' | 'board_level' | 'term_year' | 'is_active' | 'image_url' | 'linkedin_url' | 'description'
>

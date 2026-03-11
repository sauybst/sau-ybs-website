/**
 * Veritabanındaki `blogs` tablosunun TypeScript karşılığı.
 * Tüm blogs sayfalarında ortak kullanılır.
 */
export type Blog = {
  id: string
  title: string
  slug: string
  content: string
  cover_image_url: string | null
  published_at: string | null
  author_id: string | null
  created_at: string
  type: number
}

/** Supabase join ile gelen yazar profil bilgisi */
export type BlogAuthorProfile = {
  first_name: string | null
  last_name: string | null
}

/** blogs/page.tsx listesi için gerekli alanlar + yazar */
export type BlogListItem = Pick<
  Blog,
  'id' | 'slug' | 'title' | 'content' | 'cover_image_url' | 'published_at' | 'type'
> & {
  profiles: BlogAuthorProfile | null
}

/** blogs/[slug] detayı için gerekli alanlar + yazar */
export type BlogDetail = Pick<
  Blog,
  'id' | 'slug' | 'title' | 'content' | 'cover_image_url' | 'published_at' | 'type'
> & {
  profiles: BlogAuthorProfile | null
}

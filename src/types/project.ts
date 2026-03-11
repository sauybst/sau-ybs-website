/**
 * Veritabanındaki `projects` tablosunun TypeScript karşılığı.
 */
export type Project = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  project_url: string | null
  developer_names: string | null
  category: string | null
  created_at: string
}

/** projects/page.tsx listesi için gerekli alanlar */
export type ProjectListItem = Pick<
  Project,
  'id' | 'slug' | 'title' | 'image_url' | 'project_url' | 'developer_names' | 'category'
>

/** projects/[slug] detayı için gerekli alanlar */
export type ProjectDetail = Pick<
  Project,
  'id' | 'slug' | 'title' | 'description' | 'image_url' | 'project_url' | 'developer_names' | 'category' | 'created_at'
>

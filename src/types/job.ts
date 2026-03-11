/**
 * Veritabanındaki `job_postings` tablosunun TypeScript karşılığı.
 */
export type JobPosting = {
  id: string
  company_name: string
  company_logo_url: string | null
  position_name: string
  work_model: number
  description: string
  deadline_date: string | null
  application_link: string | null
  is_active: boolean
  created_at: string
  slug: string | null
}

/** Liste sayfasında kullanılan alanlar */
export type JobListItem = Pick<
  JobPosting,
  | 'id'
  | 'slug'
  | 'company_name'
  | 'company_logo_url'
  | 'position_name'
  | 'work_model'
  | 'description'
  | 'deadline_date'
  | 'application_link'
  | 'is_active'
>

/** Detay sayfasında kullanılan alanlar */
export type JobDetail = Pick<
  JobPosting,
  | 'id'
  | 'slug'
  | 'company_name'
  | 'company_logo_url'
  | 'position_name'
  | 'work_model'
  | 'description'
  | 'deadline_date'
  | 'application_link'
  | 'is_active'
  | 'created_at'
>

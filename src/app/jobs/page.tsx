import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

import JobListCard from '@/components/jobs/JobListCard'
import type { JobListItem } from '@/types/job'

export const metadata: Metadata = {
  title: 'Staj ve İş İlanları',
  description:
    'Sakarya Üniversitesi YBS öğrencileri için güncel staj, yarı zamanlı ve tam zamanlı iş fırsatları.',
  alternates: { canonical: '/jobs' },
}

/** Liste sayfasında kullanılan alanlar */
const JOB_LIST_SELECT =
  'id,slug,company_name,company_logo_url,position_name,work_model,description,deadline_date,application_link,is_active' as const

/** Sadece 'active' ve 'past' kabul edilen filtre değerleri */
const VALID_FILTERS = ['active', 'past'] as const

type SearchParams = Promise<{ filter?: string }>

export default async function PublicJobsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { filter: rawFilter } = await searchParams
  const currentFilter = VALID_FILTERS.includes(rawFilter as (typeof VALID_FILTERS)[number])
    ? rawFilter!
    : 'active'

  const supabase = await createClient()

  const { data: jobs, error } = await supabase
    .from('job_postings')
    .select(JOB_LIST_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Jobs:list]', error)
  }

  const typedJobs = (jobs ?? []) as unknown as JobListItem[]

  /* İlanları filtreleme: deadline geçmişse veya is_active=false ise inaktif */
  const filteredJobs = typedJobs.filter((job) => {
    const isExpired = job.deadline_date ? new Date(job.deadline_date) < new Date() : false
    const isCurrentlyActive = job.is_active && !isExpired
    return currentFilter === 'active' ? isCurrentlyActive : !isCurrentlyActive
  })

  return (
    <section aria-label="İş ve staj ilanları" className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <header className="text-center mb-12">
          <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">
            Kariyer Fırsatları
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
            Staj ve İş İlanları
          </h1>
          <p className="mt-4 max-w-2xl text-medium text-slate-600 mx-auto font-montserrat">
            YBS öğrencilerine özel derlenmiş staj, part-time ve tam zamanlı teknoloji/analiz
            rolleri. Kariyerine buradan başla!
          </p>

          {/* Filtre */}
          <nav aria-label="İlan filtresi" className="flex justify-center items-center gap-4 mt-8">
            <Link
              href="?filter=active"
              scroll={false}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                currentFilter === 'active'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Aktif İlanlar
            </Link>
            <Link
              href="?filter=past"
              scroll={false}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                currentFilter === 'past'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Süresi Dolanlar
            </Link>
          </nav>
        </header>

        {/* İlan Kartları */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.length === 0 ? (
            <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
              Şu an için bu kategoride listelenmiş bir iş/staj ilanı bulunmamaktadır.
            </p>
          ) : (
            filteredJobs.map((job) => <JobListCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </section>
  )
}
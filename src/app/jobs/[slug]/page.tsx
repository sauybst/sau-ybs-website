import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ExternalLink,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Metadata } from 'next'

import ShareButton from '@/components/ShareButton'
import JobJsonLd from '@/components/jobs/JobJsonLd'
import { sanitizeHtml } from '@/lib/sanitize'
import { workModelLabels, workModelIcons, stripHtmlToPlainText } from '@/data/job-types'
import type { JobDetail } from '@/types/job'

export const runtime = 'edge';
export const dynamic = 'force-dynamic'

/** Detay sayfasında kullanılan alanlar */
const JOB_DETAIL_SELECT =
  'id,slug,company_name,company_logo_url,position_name,work_model,description,deadline_date,application_link,is_active,created_at' as const

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('job_postings')
    .select('company_name, position_name, description, company_logo_url')
    .eq('slug', slug)
    .single()

  if (!job) return {}

  const cleanDescription =
    stripHtmlToPlainText(job.description).substring(0, 160) + '...'

  return {
    title: `${job.position_name} — ${job.company_name}`,
    description: cleanDescription,
    alternates: { canonical: `/jobs/${slug}` },
    openGraph: {
      title: `${job.position_name} — ${job.company_name}`,
      description: cleanDescription,
      images: [
        {
          url: job.company_logo_url || '/og-default.webp',
          width: 1200,
          height: 630,
          alt: `${job.position_name} — ${job.company_name}`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${job.position_name} — ${job.company_name}`,
      description: cleanDescription,
      images: [job.company_logo_url || '/og-default.webp'],
    },
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('job_postings')
    .select(JOB_DETAIL_SELECT)
    .eq('slug', slug)
    .single()

  /* Güvenlik: Hata detaylarını kullanıcıya gösterme */
  if (error || !job) {
    if (error) console.error('[Jobs:detail]', error)
    notFound()
  }

  const typedJob = job as unknown as JobDetail
  const isExpired = typedJob.deadline_date ? new Date(typedJob.deadline_date) < new Date() : false
  const isActiveStatus = typedJob.is_active && !isExpired
  const WorkModelIcon = workModelIcons[typedJob.work_model] ?? workModelIcons[3]

  /* XSS koruması */
  const safeDescription = sanitizeHtml(typedJob.description)

  return (
    <section aria-label="İlan detayı" className="bg-[#f8fafc] min-h-screen pt-24 pb-20">
      <JobJsonLd job={typedJob} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Geri Dön */}
        <Link
          href="/jobs"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          İlanlara Dön
        </Link>

        <article
          className={`bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-200/60 p-2 sm:p-3 transition-all ${
            !isActiveStatus ? 'opacity-90 grayscale-[15%]' : ''
          }`}
        >
          {/* Kapak Görseli */}
          <div className="h-64 sm:h-80 w-full rounded-[1.5rem] sm:rounded-[2.5rem] relative bg-slate-950 overflow-hidden flex items-center justify-center">
            {typedJob.company_logo_url ? (
              <>
                <div className="absolute inset-0 opacity-40" aria-hidden="true">
                  <Image
                    src={typedJob.company_logo_url}
                    alt=""
                    fill
                    className="object-cover blur-2xl scale-125"
                    sizes="100vw"
                    priority
                  />
                </div>
                <Image
                  src={typedJob.company_logo_url}
                  alt={typedJob.company_name}
                  fill
                  className="relative z-10 object-contain p-4 sm:p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center" aria-hidden="true">
                <Briefcase className="w-20 h-20 text-slate-700 opacity-50" />
              </div>
            )}

            {/* Aktiflik Rozeti */}
            <div className="absolute top-6 right-6 z-20">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                  isActiveStatus
                    ? 'bg-emerald-500/90 text-white border-emerald-400'
                    : 'bg-slate-800/90 text-slate-300 border-slate-600'
                }`}
              >
                {isActiveStatus ? 'Açık İlan' : 'Süresi Doldu'}
              </span>
            </div>
          </div>

          {/* İçerik */}
          <div className="px-5 sm:px-10 pt-8 pb-8 sm:pb-12 relative z-10">
            {/* Başlık */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
                  {typedJob.position_name}
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-brand-600 flex items-center">
                  <Briefcase className="w-6 h-6 mr-2.5 opacity-80" />
                  {typedJob.company_name}
                </p>
              </div>
              <div className="flex-shrink-0 mt-2 sm:mt-0">
                <ShareButton title={`${typedJob.company_name} - ${typedJob.position_name} İlanı`} />
              </div>
            </div>

            {/* Rozetler */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
              {isActiveStatus ? (
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Açık İlan
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20">
                  <XCircle className="w-4 h-4 mr-2" />
                  Başvurular Kapandı
                </span>
              )}

              <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                <WorkModelIcon className="w-4 h-4 mr-2" />
                {workModelLabels[typedJob.work_model]}
              </div>

              <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                <time dateTime={typedJob.deadline_date ?? undefined}>
                  {typedJob.deadline_date
                    ? new Date(typedJob.deadline_date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Belirtilmedi'}
                </time>
              </div>
            </div>

            <div className="w-full h-px border-t border-dashed border-slate-200 mb-10" aria-hidden="true" />

            {/* Açıklama — DOMPurify ile sanitize */}
            <div className="prose prose-slate md:prose-lg max-w-none font-montserrat prose-headings:font-heading prose-headings:font-bold prose-h2:text-2xl prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-li:marker:text-brand-500 prose-p:leading-relaxed prose-p:text-slate-600">
              <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
            </div>

            {/* Başvuru Kutusu */}
            <div className="mt-16 p-6 sm:p-8 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-slate-500 text-sm font-medium text-center sm:text-left">
                <div>Yayınlanma Tarihi</div>
                <time dateTime={typedJob.created_at} className="text-slate-700 font-bold mt-0.5 block">
                  {new Date(typedJob.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>

              {isActiveStatus ? (
                typedJob.application_link ? (
                  <a
                    href={typedJob.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto ring-4 ring-brand-500/10"
                  >
                    İlana Başvur <ExternalLink className="ml-2 w-5 h-5" />
                  </a>
                ) : (
                  <div className="px-6 py-4 text-brand-700 bg-brand-50 border border-brand-100 rounded-xl font-bold text-sm text-center w-full sm:w-auto">
                    Platform dışı başvuru linki bulunmuyor.
                  </div>
                )
              ) : (
                <div className="px-8 py-4 text-base font-bold rounded-xl text-slate-500 bg-slate-200 border border-slate-300 text-center w-full sm:w-auto cursor-not-allowed">
                  Başvurular Kapandı
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
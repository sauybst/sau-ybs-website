import Link from 'next/link'
import Image from 'next/image'
import { Briefcase, ExternalLink, Calendar } from 'lucide-react'
import type { JobListItem } from '@/types/job'
import { workModelLabels, workModelIcons, stripHtmlToPlainText } from '@/data/job-types'

type JobListCardProps = {
  job: JobListItem
}

export default function JobListCard({ job }: JobListCardProps) {
  const isExpired = job.deadline_date ? new Date(job.deadline_date) < new Date() : false
  const isActiveStatus = job.is_active && !isExpired
  const WorkModelIcon = workModelIcons[job.work_model] ?? workModelIcons[3]

  return (
    <div
      className={`relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group ${
        !isActiveStatus ? 'opacity-75 grayscale-[30%]' : ''
      }`}
    >
      {/* Durum Rozeti */}
      <div className="absolute top-4 right-4 z-20">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
            isActiveStatus
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {isActiveStatus ? 'Açık İlan' : 'Süresi Doldu'}
        </span>
      </div>

      {/* Şirket Logosu ve Adı */}
      <div className="p-6 pb-4 flex items-center gap-4 border-b border-slate-50 bg-slate-50/50">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          {job.company_logo_url ? (
            <Image
              src={job.company_logo_url}
              alt={job.company_name}
              fill
              className="object-contain p-2"
              sizes="64px"
            />
          ) : (
            <Briefcase className="w-8 h-8 text-brand-200" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-heading font-bold text-slate-900 leading-tight line-clamp-1" title={job.company_name}>
            {job.company_name}
          </h3>
          <div className="flex items-center text-sm text-slate-500 mt-1 font-medium">
            <WorkModelIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
            {workModelLabels[job.work_model]}
          </div>
        </div>
      </div>

      {/* Pozisyon ve Detaylar */}
      <div className="p-6 flex flex-col flex-1">
        <h4 className="text-2xl font-heading font-bold text-brand-600 mb-4 tracking-tight leading-tight line-clamp-2">
          <Link href={`/jobs/${job.slug}`}>
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            {job.position_name}
          </Link>
        </h4>

        <p className="text-slate-600 text-sm mb-6 line-clamp-3 font-montserrat">
          {stripHtmlToPlainText(job.description)}
        </p>

        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
          {/* Son Başvuru */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              Son Başvuru:
            </span>
            <time dateTime={job.deadline_date ?? undefined} className="font-bold text-slate-700">
              {job.deadline_date
                ? new Date(job.deadline_date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Belirtilmedi'}
            </time>
          </div>

          {/* Başvuru Butonu */}
          {job.application_link && isActiveStatus ? (
            <a
              href={job.application_link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all w-full group-hover:-translate-y-0.5"
            >
              Hemen Başvur <ExternalLink className="ml-2 -mr-1 h-4 w-4" />
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-400 bg-slate-100 cursor-not-allowed w-full"
            >
              {isActiveStatus ? 'Sistem İçi Başvuru Yok' : 'Başvurular Kapandı'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

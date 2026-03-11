import type { JobDetail } from '@/types/job'
import { workModelLabels, workModelSchemaMap, stripHtmlToPlainText } from '@/data/job-types'

/**
 * İş ilanı detay sayfası için JSON-LD yapılandırılmış verisi.
 * Google iş ilanı aramasında zengin snippet gösterilmesini sağlar.
 * @see https://schema.org/JobPosting
 */
export default function JobJsonLd({ job }: { job: JobDetail }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.position_name,
    description: stripHtmlToPlainText(job.description).substring(0, 500),
    datePosted: job.created_at,
    ...(job.deadline_date && { validThrough: job.deadline_date }),
    employmentType: workModelSchemaMap[job.work_model] || 'OTHER',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
      ...(job.company_logo_url && { logo: job.company_logo_url }),
    },
    jobLocationType: job.work_model === 1 ? 'TELECOMMUTE' : undefined,
    ...(job.application_link && { directApply: true }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

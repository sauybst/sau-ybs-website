import type { ProjectDetail } from '@/types/project'

/**
 * Proje detay sayfası için JSON-LD yapılandırılmış verisi.
 * @see https://schema.org/SoftwareSourceCode
 */
export default function ProjectJsonLd({ project }: { project: ProjectDetail }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.description?.replace(/<[^>]*>?/gm, '').substring(0, 300),
    image: project.image_url || 'https://www.sauybst.com/og-default.webp',
    dateCreated: project.created_at,
    ...(project.project_url && { codeRepository: project.project_url }),
    ...(project.developer_names && {
      author: {
        '@type': 'Person',
        name: project.developer_names,
      },
    }),
    maintainer: {
      '@type': 'Organization',
      name: 'SAÜ YBS Topluluğu',
      url: 'https://www.sauybst.com',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

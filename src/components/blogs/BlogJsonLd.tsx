import type { BlogDetail } from '@/types/blog'

type BlogJsonLdProps = {
  blog: BlogDetail
}

/**
 * Blog detay sayfası için JSON-LD yapılandırılmış verisi.
 * Google arama sonuçlarında zengin snippet (yazar, tarih, görsel) gösterilmesini sağlar.
 * @see https://schema.org/Article
 */
export default function BlogJsonLd({ blog }: BlogJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    datePublished: blog.published_at,
    image: blog.cover_image_url || 'https://www.sauybst.com/og-default.webp',
    author: {
      '@type': 'Person',
      name: blog.profiles
        ? `${blog.profiles.first_name || ''} ${blog.profiles.last_name || ''}`.trim()
        : 'SAU YBS Topluluğu',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SAÜ YBS Topluluğu',
      url: 'https://www.sauybst.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.sauybst.com/logo.webp',
      },
    },
    description: blog.content?.replace(/<[^>]*>?/gm, '').substring(0, 300),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.sauybst.com/blogs/${blog.slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

import type { BoardMemberDetail } from '@/types/board-member'

/**
 * Yönetim kurulu üye detay sayfası için JSON-LD yapılandırılmış verisi.
 * @see https://schema.org/Person
 */
export default function PersonJsonLd({ member }: { member: BoardMemberDetail }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.full_name,
    jobTitle: member.board_role,
    image: member.image_url || undefined,
    ...(member.linkedin_url && {
      sameAs: [member.linkedin_url],
    }),
    memberOf: {
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

/**
 * Ana sayfa için Organization + WebSite JSON-LD yapılandırılmış verisi.
 * Google ve diğer arama motorlarının zengin snippet göstermesine yardımcı olur.
 */
export default function HomeJsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SAÜ YBS Topluluğu',
    alternateName: 'Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu',
    url: 'https://www.sauybst.com',
    logo: 'https://www.sauybst.com/icon.png',
    description:
      'Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu resmi web sitesi. Etkinlikler, projeler, staj ilanları ve daha fazlası.',
    foundingDate: '2015',
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Sakarya Üniversitesi',
      url: 'https://www.sakarya.edu.tr',
    },
    sameAs: [
      'https://www.instagram.com/saborsa.ybs',
      'https://www.linkedin.com/company/sauybst',
    ],
  }

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SAÜ YBS',
    url: 'https://www.sauybst.com',
    inLanguage: 'tr',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  )
}

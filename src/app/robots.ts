import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.sauybst.com'

    return {
        rules: {
            userAgent: '*', // Tüm arama motorları için geçerli
            allow: '/', // Sitenin genelini taramaya izin ver
            disallow: ['/admin/', '/login', '/update-password'], // Yönetim paneli ve auth sayfalarını GİZLE
        },
        sitemap: `${baseUrl}/sitemap.xml`, // Botlara sitemap'in yerini göster
    }
}
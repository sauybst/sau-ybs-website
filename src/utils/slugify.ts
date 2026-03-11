// ============================================================
// Türkçe Karakter Destekli Slug Üretici
// Başlıktan SEO-uyumlu URL segmenti oluşturur.
// ============================================================

const TURKISH_CHAR_MAP: Record<string, string> = {
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S',
    'ı': 'i', 'I': 'I',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
}

/**
 * Verilen başlığı SEO-uyumlu slug formatına çevirir.
 * Türkçe karakterleri ASCII karşılıklarına dönüştürür.
 * 
 * @example generateSlug("Yapay Zekâ ve Geleceği") → "yapay-zeka-ve-gelecegi"
 */
export function generateSlug(text: string): string {
    if (!text) return ''

    let slug = text.toLowerCase().trim()

    // Türkçe karakterleri değiştir
    for (const [Turkish, ascii] of Object.entries(TURKISH_CHAR_MAP)) {
        slug = slug.replaceAll(Turkish.toLowerCase(), ascii.toLowerCase())
    }

    return slug
        .replace(/[^a-z0-9 -]/g, '')  // Harf, rakam, boşluk ve tire dışını sil
        .replace(/\s+/g, '-')          // Boşlukları tireye çevir
        .replace(/-+/g, '-')           // Yan yana tireleri tek tireye indir
        .replace(/^-|-$/g, '')         // Baştaki ve sondaki tireleri sil
}

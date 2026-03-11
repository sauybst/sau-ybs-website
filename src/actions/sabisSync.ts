'use server'

import * as cheerio from 'cheerio'
import { createClient } from '@/utils/supabase/server'
import { generateSlug } from '@/utils/slugify'
import { requireAuth } from '@/utils/auth-guard'
import { USER_ROLES } from '@/utils/constants'

// SABIS'teki karmaşık tarihleri standart ISO formatına çeviren yardımcı fonksiyon
function parseSabisDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString()

    try {
        const cleanDate = dateStr.replace('Başlangıç:', '').trim()
        const parts = cleanDate.split(' ')

        if (parts.length >= 2) {
            const datePart = parts[0]
            const timePart = parts[1]
            let day: string | undefined
            let month: string | undefined
            let year: string | undefined

            if (datePart.includes('.')) {
                [day, month, year] = datePart.split('.')
            } else if (datePart.includes('/')) {
                [month, day, year] = datePart.split('/')
            }

            if (year && month && day) {
                return new Date(`${year}-${month}-${day}T${timePart}:00+03:00`).toISOString()
            }
        }

        return new Date(cleanDate).toISOString()
    } catch {
        return new Date().toISOString()
    }
}

// HTML etiketlerini temizleyen yardımcı fonksiyon (XSS koruması)
function stripHtml(text: string): string {
    if (!text) return ''
    return text.replace(/<[^>]*>/g, '').trim()
}

interface SabisActivity {
    title: string
    event_date: string
    location: string
    description: string
    image_url: string
}

export async function syncSabisData() {
    const supabase = await createClient()

    // — Yetki kontrolü: Sadece super_admin
    const auth = await requireAuth(supabase, {
        allowedRoles: [USER_ROLES.SUPER_ADMIN],
    })
    if (!auth.authorized) return { success: false, error: auth.error }

    const urlAnaSayfa = 'https://topluluk.sabis.sakarya.edu.tr/sau-yonetim-bilisim-sistemleri-ogrenci-toplulugu'
    const urlToplulukListesi = 'https://topluluk.sabis.sakarya.edu.tr/Topluluk/ToplulukListesi?ToplulukKategori=Teknoloji'

    try {
        // — Ana sayfa verileri
        const response1 = await fetch(urlAnaSayfa, { cache: 'no-store' })
        if (!response1.ok) {
            return { success: false, error: `SABIS ana sayfa yanıt vermedi: HTTP ${response1.status}` }
        }

        const html1 = await response1.text()
        const $1 = cheerio.load(html1)

        const memberText = $1('h6:contains("ÜYE SAYISI")').next('p').text().trim()
        const memberCount = parseInt(memberText.replace(/[^0-9]/g, '')) || 0

        const activities: SabisActivity[] = []

        $1('#faaliyetContainer .col').each((index, element) => {
            if (activities.length >= 5) return false

            const title = stripHtml($1(element).find('.card-title').text().trim())
            const description = stripHtml($1(element).find('.card-text').first().text().trim())
            const startDateText = $1(element).find('.badge:contains("Başlangıç")').text().trim()
            const locationText = stripHtml(
                $1(element).find('strong:contains("Yer:")').parent().text().replace('Yer:', '').trim()
            )
            const imageUrl = $1(element).find('img').attr('src')

            if (title && imageUrl) {
                activities.push({
                    title,
                    event_date: parseSabisDate(startDateText),
                    location: locationText || 'Belirtilmedi',
                    description,
                    image_url: imageUrl,
                })
            }
        })

        // — Etkinlikleri veritabanına kaydet
        for (const activity of activities) {
            const slug = generateSlug(activity.title) + '-sabis'

            await supabase.from('events').upsert({
                title: activity.title,
                slug,
                event_date: activity.event_date,
                location: activity.location,
                description: activity.description,
                image_url: activity.image_url,
            }, { onConflict: 'slug' })
        }

        // — Toplam etkinlik sayısı
        let totalEventCount = '50+'

        try {
            const response2 = await fetch(urlToplulukListesi, { cache: 'no-store' })
            if (response2.ok) {
                const html2 = await response2.text()
                const $2 = cheerio.load(html2)

                const communityTitle = $2('h2:contains("YÖNETİM BİLİŞİM SİSTEMLERİ ÖĞRENCİ TOPLULUĞU")')

                if (communityTitle.length > 0) {
                    const countText = communityTitle
                        .closest('div.card-body, div.card, div')
                        .find('span:contains("Etkinlik Sayısı:")')
                        .next('span')
                        .text()
                        .trim()

                    if (countText && !isNaN(parseInt(countText))) {
                        totalEventCount = countText + '+'
                    }
                }
            }
        } catch (err) {
            console.error('Toplam etkinlik sayısı çekilemedi, varsayılan değer kullanılıyor.', err)
        }

        return {
            success: true,
            memberCount,
            activitiesFetched: activities.length,
            totalEventCount,
        }
    } catch (error) {
        console.error('SABIS Senkronizasyon Hatası:', error)
        return { success: false, error: 'Veri çekilemedi.' }
    }
}
import { createClient } from '@/utils/supabase/server'
import { unstable_cache } from 'next/cache'
import * as cheerio from 'cheerio'

export type UpcomingEvent = {
  id: string | number
  slug: string
  title: string
  event_date: string
  location: string | null
  image_url: string | null
}

export type HomeMetrics = {
  memberCount: number
  totalEvents: string
  projectsCount: number
}

const FALLBACK_MEMBER_COUNT = 650
const FALLBACK_TOTAL_EVENTS = '50+'
const FALLBACK_PROJECTS_COUNT = 1

function logErrorIfPresent(scope: string, error: unknown) {
  if (!error) return
  console.error(`[Home:${scope}]`, error)
}

/**
 * SABIS'ten sadece üye sayısı ve toplam etkinlik sayısını çeker.
 * Veritabanına yazma işlemi yapmaz — sadece okuma amaçlıdır.
 * Next.js unstable_cache ile 6 saatte bir yenilenir.
 */
const getSabisStats = unstable_cache(
  async (): Promise<{ memberCount: number | null; totalEventCount: string | null }> => {
    try {
      const [res1, res2] = await Promise.all([
        fetch('https://topluluk.sabis.sakarya.edu.tr/sau-yonetim-bilisim-sistemleri-ogrenci-toplulugu', {
          next: { revalidate: 21600 },
        }),
        fetch('https://topluluk.sabis.sakarya.edu.tr/Topluluk/ToplulukListesi?ToplulukKategori=Teknoloji', {
          next: { revalidate: 21600 },
        }),
      ])

      let memberCount: number | null = null
      let totalEventCount: string | null = null

      if (res1.ok) {
        const $1 = cheerio.load(await res1.text())
        const memberText = $1('h6:contains("ÜYE SAYISI")').next('p').text().trim()
        const parsed = parseInt(memberText.replace(/[^0-9]/g, ''))
        if (!isNaN(parsed)) memberCount = parsed
      }

      if (res2.ok) {
        const $2 = cheerio.load(await res2.text())
        const title = $2('h2:contains("YÖNETİM BİLİŞİM SİSTEMLERİ ÖĞRENCİ TOPLULUĞU")')
        if (title.length > 0) {
          const countText = title
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

      return { memberCount, totalEventCount }
    } catch (error) {
      console.error('[Home:sabis-stats]', error)
      return { memberCount: null, totalEventCount: null }
    }
  },
  ['sabis-stats'],
  { revalidate: 21600 } // 6 saat
)

/**
 * Anasayfa için gerekli verilerin tamamını çeker.
 * Üye sayısı ve etkinlik sayısı SABIS'ten (cache'li),
 * diğer veriler Supabase'den gelir.
 */
export async function getHomeData(): Promise<{
  upcomingEvents: UpcomingEvent[]
  metrics: HomeMetrics
}> {
  const supabase = await createClient()

  const [eventsResult, membersResult, eventsCountResult, projectsResult, sabisStats] =
    await Promise.all([
      supabase
        .from('events')
        .select('id,slug,title,event_date,location,image_url')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      getSabisStats(),
    ])

  logErrorIfPresent('upcoming-events', eventsResult.error)
  logErrorIfPresent('members-count', membersResult.error)
  logErrorIfPresent('events-count', eventsCountResult.error)
  logErrorIfPresent('projects-count', projectsResult.error)

  const upcomingEvents = (eventsResult.data ?? []) as UpcomingEvent[]

  // SABIS verisi varsa onu kullan, yoksa Supabase'e, o da yoksa fallback'e düş
  const memberCount =
    sabisStats.memberCount ?? membersResult.count ?? FALLBACK_MEMBER_COUNT

  const totalEvents =
    sabisStats.totalEventCount ??
    (eventsCountResult.count ? `${eventsCountResult.count}+` : FALLBACK_TOTAL_EVENTS)

  const projectsCount = projectsResult.count ?? FALLBACK_PROJECTS_COUNT

  const metrics: HomeMetrics = { memberCount, totalEvents, projectsCount }

  return { upcomingEvents, metrics }
}


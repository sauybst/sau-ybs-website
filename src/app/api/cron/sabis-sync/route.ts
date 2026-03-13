import { NextRequest, NextResponse } from 'next/server'
import { syncSabisData } from '@/actions/sabisSync'

/**
 * SABIS verilerini senkronize eden cron/API endpoint'i.
 * Anasayfa her yüklendiğinde harici scraping yapmak yerine,
 * bu endpoint belirli aralıklarla (cron) veya manuel olarak tetiklenir.
 *
 * Güvenlik: CRON_SECRET header kontrolü ile yetkisiz erişim engellenir.
 * Kullanım: GET /api/cron/sabis-sync (Header: Authorization: Bearer <CRON_SECRET>)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim.' },
      { status: 401 }
    )
  }

  try {
    const result = await syncSabisData()
    return NextResponse.json(result)
  } catch (error) {
    console.error('[SABIS Cron] Senkronizasyon hatası:', error)
    return NextResponse.json(
      { error: 'Senkronizasyon başarısız.' },
      { status: 500 }
    )
  }
}

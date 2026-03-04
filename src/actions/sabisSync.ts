'use server'

import * as cheerio from 'cheerio'
import { createClient } from '@/utils/supabase/server'

// SABIS'teki karmaşık tarihleri (22.12.2025 veya 11/28/2025) standart formata çeviren yardımcı fonksiyon
function parseSabisDate(dateStr: string) {
  if (!dateStr) return new Date().toISOString();
  try {
    const cleanDate = dateStr.replace('Başlangıç:', '').trim();
    const parts = cleanDate.split(' ');
    
    if (parts.length >= 2) {
      const datePart = parts[0];
      const timePart = parts[1];
      let day, month, year;

      if (datePart.includes('.')) {
        [day, month, year] = datePart.split('.');
      } else if (datePart.includes('/')) {
        [month, day, year] = datePart.split('/');
      }
      
      if (year && month && day) {
        return new Date(`${year}-${month}-${day}T${timePart}:00+03:00`).toISOString();
      }
    }
    return new Date(cleanDate).toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

export async function syncSabisData() {
  const supabase = await createClient()
  const url = 'https://topluluk.sabis.sakarya.edu.tr/sau-yonetim-bilisim-sistemleri-ogrenci-toplulugu'

  try {
    const response = await fetch(url, { cache: 'no-store' })
    const html = await response.text()
    
    const $ = cheerio.load(html)

    const memberText = $('h6:contains("ÜYE SAYISI")').next('p').text().trim() 
    const memberCount = parseInt(memberText.replace(/[^0-9]/g, '')) || 0

    const activities: any[] = []
    
    $('#faaliyetContainer .col').each((index, element) => {
      if (activities.length >= 5) return false;

      const title = $(element).find('.card-title').text().trim()
      const description = $(element).find('.card-text').first().text().trim()
      const startDateText = $(element).find('.badge:contains("Başlangıç")').text().trim()
      const locationText = $(element).find('strong:contains("Yer:")').parent().text().replace('Yer:', '').trim()
      const imageUrl = $(element).find('img').attr('src')
      
      if (title && imageUrl) {
        activities.push({
          title: title,
          event_date: parseSabisDate(startDateText),
          location: locationText || 'Belirtilmedi',
          description: description,
          image_url: imageUrl
        })
      }
    })

    // 3. Veritabanına Kaydetme İşlemleri (Supabase)
    // Etkinlikleri Supabase'e kaydet (Varsa güncelle, yoksa ekle mantığı - title'a göre)
    for (const activity of activities) {
      // Slug oluştur (URL dostu başlık - Örn: "Mezunlar söyleşisi" -> "mezunlar-soylesisi-sabis")
      const slug = activity.title.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-') + '-sabis'
      
      await supabase.from('events').upsert({
        title: activity.title,
        slug: slug,
        event_date: activity.event_date,
        location: activity.location,
        description: activity.description,
        image_url: activity.image_url
      }, { onConflict: 'slug' })
    }

    return { success: true, memberCount, activitiesFetched: activities.length }
  } catch (error) {
    console.error('SABIS Senkronizasyon Hatası:', error)
    return { success: false, error: 'Veri çekilemedi' }
  }
}
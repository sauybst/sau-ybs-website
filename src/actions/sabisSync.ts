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
  
  // İki farklı hedef URL'miz
  const urlAnaSayfa = 'https://topluluk.sabis.sakarya.edu.tr/sau-yonetim-bilisim-sistemleri-ogrenci-toplulugu'
  const urlToplulukListesi = 'https://topluluk.sabis.sakarya.edu.tr/Topluluk/ToplulukListesi?ToplulukKategori=Teknoloji'

  try {
    const response1 = await fetch(urlAnaSayfa, { cache: 'no-store' })
    const html1 = await response1.text()
    const $1 = cheerio.load(html1)

    const memberText = $1('h6:contains("ÜYE SAYISI")').next('p').text().trim() 
    const memberCount = parseInt(memberText.replace(/[^0-9]/g, '')) || 0

    const activities: any[] = []
    
    $1('#faaliyetContainer .col').each((index, element) => {
      if (activities.length >= 5) return false;

      const title = $1(element).find('.card-title').text().trim()
      const description = $1(element).find('.card-text').first().text().trim()
      const startDateText = $1(element).find('.badge:contains("Başlangıç")').text().trim()
      const locationText = $1(element).find('strong:contains("Yer:")').parent().text().replace('Yer:', '').trim()
      const imageUrl = $1(element).find('img').attr('src')
      
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

    for (const activity of activities) {
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

    let totalEventCount = '50+' 

    try {
      const response2 = await fetch(urlToplulukListesi, { cache: 'no-store' })
      const html2 = await response2.text()
      const $2 = cheerio.load(html2)

      // Önce YBS başlığını buluyoruz
      const communityTitle = $2('h2:contains("YÖNETİM BİLİŞİM SİSTEMLERİ ÖĞRENCİ TOPLULUĞU")')
      
      if (communityTitle.length > 0) {
        const countText = communityTitle.closest('div.card-body, div.card, div').find('span:contains("Etkinlik Sayısı:")').next('span').text().trim()

        if (countText && !isNaN(parseInt(countText))) {
          totalEventCount = countText + '+' // Bulunan sayının yanına + ekliyoruz (Örn: 52+)
        }
      }
    } catch (err) {
      console.error('Toplam etkinlik sayısı çekilemedi, mock değer (50+) kullanılıyor.', err)
    }

    // Tüm verileri dışarı aktarıyoruz
    return { 
      success: true, 
      memberCount, 
      activitiesFetched: activities.length,
      totalEventCount // Yeni eklenen verimiz!
    }
  } catch (error) {
    console.error('SABIS Senkronizasyon Hatası:', error)
    return { success: false, error: 'Veri çekilemedi' }
  }
}
'use server'

import { createClient } from '@/utils/supabase/server'

export async function verifyCertificate(hash: string) {
    const supabase = await createClient()

    // Kullanıcının girdiği kodu temizle (boşlukları al, büyük harf yap)
    const cleanHash = hash.trim().toUpperCase()

    // Supabase'den sertifikayı ve bağlı olduğu pasaporttaki anonim ismi çek
    const { data, error } = await supabase
        .from('certificates')
        .select(`
            hash,
            event_count,
            created_at,
            passports ( name_mask )
        `)
        .eq('hash', cleanHash)
        .single()

    if (error || !data) {
        return { error: 'Geçersiz doğrulama kodu. Sistemde böyle bir sertifika kaydı bulunamadı.' }
    }

    // Güvenli veriyi Frontend'e gönder
    return {
        success: true,
        certificate: {
            hash: data.hash,
            event_count: data.event_count,
            created_at: data.created_at,
            masked_name: (data.passports as any)?.name_mask
        }
    }
}
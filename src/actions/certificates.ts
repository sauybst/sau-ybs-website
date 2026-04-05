'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { checkRateLimit } from '@/utils/rate-limit' 

// --- TİP TANIMLAMALARI (Type Safety) ---
type CertificateRecord = {
    hash: string;
    event_count: number;
    created_at: string;
    passports: { name_mask: string } | null;
}

// --- GİRDİ DOĞRULAMA ŞEMASI ---
const HashSchema = z.string()
    .min(8, 'Sertifika kodu çok kısa.')
    .max(64, 'Sertifika kodu çok uzun.')
    .regex(/^[A-Za-z0-9-]+$/, 'Sertifika kodu geçersiz karakterler içeriyor.')

export async function verifyCertificate(hash: string) {

    const rateLimit = await checkRateLimit('verify_certificate', { maxAttempts: 5, windowMs: 15 * 60 * 1000 })
    if (!rateLimit.allowed) {
        return { error: 'Çok fazla istekte bulundunuz. Lütfen daha sonra tekrar deneyin.' }
    }


    // 2. Girdi Doğrulama (Zod ile güvenlik filtresi)
    const validation = HashSchema.safeParse(hash.trim())
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    const cleanHash = validation.data.toUpperCase()
    const supabase = await createClient()

    // 3. Veritabanı Sorgusu ve Tip Ataması
    const { data, error } = await supabase
        .from('certificates')
        .select(`
            hash,
            event_count,
            created_at,
            passports ( name_mask )
        `)
        .eq('hash', cleanHash)
        .single<CertificateRecord>() // Generic type ile 'any' kullanımından kurtulduk

    // 4. Güvenli Hata Yönetimi
    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('[Certificate Verification Error]:', error.message)
        }
        return { error: 'Geçersiz doğrulama kodu. Sistemde böyle bir sertifika kaydı bulunamadı.' }
    }

    if (!data) {
        return { error: 'Sertifika kaydı bulunamadı.' }
    }

    // 5. Güvenli veriyi Frontend'e gönder
    return {
        success: true,
        certificate: {
            hash: data.hash,
            event_count: data.event_count,
            created_at: data.created_at,
            masked_name: data.passports?.name_mask || 'İsimsiz Katılımcı'
        }
    }
}
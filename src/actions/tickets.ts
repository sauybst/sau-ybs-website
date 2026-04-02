'use server'

import { supabaseAdmin } from '@/utils/supabase/admin';
import { hashData, generateTicketPin, verifyData } from '@/utils/crypto';
import crypto from 'crypto';

// 1. Google Form Yönlendirmesi Öncesi Geçici Bilet Seansı Oluştur (Admin tetikler veya Buton tetikler)
export async function createTicketSession(eventId: string) {
    // Etkinliğin kapasitesini kontrol et
    const { data: event } = await supabaseAdmin.from('events').select('capacity').eq('id', eventId).single();
    const { count } = await supabaseAdmin.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', eventId);
    
    if (event?.capacity && count && count >= event.capacity) {
        return { error: 'Bu etkinlik için kapasite dolmuştur.' };
    }

    const creationToken = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 Dakika

    const { error } = await supabaseAdmin.from('ticket_sessions').insert({
        event_id: eventId,
        creation_token: creationToken,
        expires_at: expiresAt
    });

    if (error) return { error: 'Bilet oluşturma seansı başlatılamadı.' };

    return { success: true, token: creationToken };
}

// 2. Token ve Anahtar Kelime ile Nihai Bileti Üret (Öğrenci tetikler)
export async function generateTicket(creationToken: string, keyword: string) {
    // 1. Token geçerliliğini kontrol et
    const { data: session } = await supabaseAdmin
        .from('ticket_sessions')
        .select('*')
        .eq('creation_token', creationToken)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

    if (!session) return { error: 'Bilet oluşturma bağlantısı geçersiz veya süresi dolmuş. Lütfen formu tekrar doldurun.' };

    // 2. Token'ı kullanıldı olarak işaretle (Race Condition / Çift tıklama engellemesi)
    await supabaseAdmin.from('ticket_sessions').update({ is_used: true }).eq('id', session.id);

    // 3. Bileti Üret
    const pinCode = generateTicketPin();
    const qrHashRaw = crypto.randomUUID(); // Ekrana çizilecek karekod metni
    const qrHashEncrypted = await hashData(qrHashRaw); // Veritabanında (Opsiyonel) veya direkt hashli tutulabilir.
    const keywordHash = await hashData(keyword);

    const { error } = await supabaseAdmin.from('tickets').insert({
        event_id: session.event_id,
        pin_code: pinCode,
        qr_hash: qrHashRaw, // Eşleşme kolaylığı için hash metnini direkt tutuyoruz
        keyword_hash: keywordHash,
        status: 'GENERATED'
    });

    if (error) return { error: 'Bilet üretilirken bir hata oluştu.' };

    return { success: true, ticket: { pinCode } };
}

// 3. Bileti Getir (Sadece Parası Ödenmişse QR Kodu Dön)
export async function fetchTicketForDisplay(pinCode: string, keyword: string) {
    const { data: ticket } = await supabaseAdmin
        .from('tickets')
        .select('*')
        .eq('pin_code', pinCode.toUpperCase())
        .single();

    if (!ticket) return { error: 'Bilet bulunamadı veya bilgiler hatalı.' };

    const isKeywordValid = await verifyData(keyword, ticket.keyword_hash);
    if (!isKeywordValid) return { error: 'Bilet bulunamadı veya bilgiler hatalı.' };

    if (ticket.status === 'GENERATED') return { error: 'Bu bilet için ödeme henüz onaylanmamıştır.' };
    if (ticket.status === 'REVOKED') return { error: 'Bu bilet iptal edilmiştir.' };

    // Eğer PAID veya USED ise QR kodunu göster
    return { 
        success: true, 
        ticket: {
            pinCode: ticket.pin_code,
            status: ticket.status,
            qrHash: ticket.qr_hash // Sadece başarılıysa Frontend'e döner ve qrcode.react çizer.
        } 
    };
}
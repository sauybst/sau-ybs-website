'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { TICKET_STATUS } from '@/types/tickets';

// 1. BİLET ÜRET (Öğrenci "Bilet Al" dediğinde tetiklenir)
export async function acquireTicket(eventId: string, pinCode: string, keywordHash: string) {
    const supabase = await createClient();

    // Benzersiz QR Şifresi (Karekodun içine gizlenecek data)
    const qrHashRaw = crypto.randomUUID();

    // Veritabanındaki "Race Condition" korumalı fonksiyona işi yıkıyoruz
    const { data, error } = await supabase.rpc('purchase_ticket', {
        p_event_id: eventId,
        p_pin_code: pinCode,
        p_keyword_hash: keywordHash,
        p_qr_hash: qrHashRaw
    });

    // Durum A: Supabase bağlantı hatası (Database kapalı, tablo yok vb.)
    if (error) {
        console.error('Supabase RPC Hatası:', error);
        return { error: 'Veritabanı bağlantısında bir sorun oluştu.' };
    }

    // Durum B: RPC çalıştı ama mantıksal bir itiraz döndü (Zaten bilet var, kontenjan dolu vb.)
    // data.success burada false ise, RPC içindeki mesajı (data.message) döndürüyoruz.
    if (data && data.success === false) {
        return { error: data.message }; // İşte o "Zaten bu bilet..." mesajı burası
    }

    // Durum C: Her şey yolunda
    revalidatePath(`/events/${eventId}`);
    revalidatePath('/portal');
    
    return { success: true, message: data?.message || 'Bilet başarıyla oluşturuldu.' };
}

// 2. CÜZDAN: ÖĞRENCİNİN BİLETLERİNİ GETİR
export async function getUserTickets(pinCode: string, keywordHash: string) {
    const supabase = await createClient();

    // Öğrenciye ait tüm biletleri, etkinlik bilgileriyle (JOIN) birlikte getiriyoruz
    const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
            *,
            events ( title, slug, event_date, location, image_url )
        `)
        .eq('pin_code', pinCode)
        .eq('keyword_hash', keywordHash)
        .order('created_at', { ascending: false });

    if (error) return { error: 'Biletleriniz yüklenirken bir hata oluştu.' };

    return { success: true, tickets };
}

// 3. CANLI BİLET DETAYI VE QR KOD (Sadece geçerliyse QR kod döner)
export async function getTicketForDisplay(ticketId: string, pinCode: string, keywordHash: string) {
    const supabase = await createClient();

    const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
            *,
            events ( title, event_date, location, image_url )
        `)
        .eq('id', ticketId)
        .eq('pin_code', pinCode)
        .eq('keyword_hash', keywordHash)
        .single();

    if (error || !ticket) return { error: 'Bilet bulunamadı veya yetkisiz erişim.' };

    if (ticket.status === TICKET_STATUS.CANCELLED) {
        return { error: 'Bu bilet iptal edilmiştir.', ticket };
    }

    return { success: true, ticket };
}

// 4. BİLETİ İPTAL ET (Kontenjanı geri verir)
export async function cancelMyTicket(ticketId: string, pinCode: string) {
    const supabase = await createClient();

    // Veritabanındaki iptal robotunu çağırıyoruz
    const { data, error } = await supabase.rpc('cancel_ticket', {
        p_ticket_id: ticketId,
        p_pin_code: pinCode
    });

    if (error) {
        console.error('İptal RPC Hatası:', error);
        return { error: 'İptal işlemi sırasında bir hata oluştu.' };
    }

    if (!data.success) {
        return { error: data.message };
    }

    // Cüzdanı ve etkinlik sayfasını güncelle (kontenjan 1 arttı çünkü)
    revalidatePath('/portal/wallet');
    revalidatePath(`/portal/ticket/${ticketId}`);
    
    return { success: true, message: data.message };
}
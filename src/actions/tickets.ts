'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { z } from 'zod';
import { TICKET_STATUS } from '@/types/tickets';
import { UUIDSchema } from '@/utils/schemas';
import { getCurrentPassport } from '@/actions/passports';

// --- GİRDİ DOĞRULAMA ŞEMALARI ---
const PinCodeSchema = z.string().length(12, 'PIN kodu 12 haneli olmalıdır.');
const HashSchema = z.string().min(10, 'Geçersiz Hash formatı.');

// 1. BİLET ÜRET (Öğrenci "Bilet Al" dediğinde tetiklenir)
export async function acquireTicket(eventIdRaw: string, pinCodeRaw: string) {
    // 1. Girdi Doğrulama
    const eventIdCheck = UUIDSchema.safeParse(eventIdRaw);
    const pinCheck = PinCodeSchema.safeParse(pinCodeRaw);

    if (!eventIdCheck.success || !pinCheck.success) {
        return { error: 'Geçersiz veri formatı.' };
    }

    const { data: eventId } = eventIdCheck;
    const { data: pinCode } = pinCheck;

    // Sadece giriş yapmış kullanıcı kendi PIN koduyla bilet alabilir!
    const currentUser = await getCurrentPassport();
    if (!currentUser || currentUser.pin_code !== pinCode) {
        return { error: 'Yetkisiz işlem: Sadece kendi adınıza bilet alabilirsiniz.' };
    }

    const supabase = await createClient();
    const qrHashRaw = crypto.randomUUID();

    const { data, error } = await supabase.rpc('purchase_ticket', {
        p_event_id: eventId,
        p_pin_code: pinCode,
        p_keyword_hash: currentUser.keyword_hash,
        p_qr_hash: qrHashRaw
    });

    if (error) {
        console.error('[Ticket Action Error] Bilet Alım RPC Hatası:', error.message);
        return { error: 'Veritabanı bağlantısında bir sorun oluştu.' };
    }

    if (data && data.success === false) {
        return { error: data.message };
    }

    revalidatePath(`/events/${eventId}`);
    revalidatePath('/portal');
    
    return { success: true, message: data?.message || 'Bilet başarıyla oluşturuldu.' };
}
// 2. CÜZDAN: ÖĞRENCİNİN BİLETLERİNİ GETİR
export async function getUserTickets(pinCodeRaw: string) {
    const pinCheck = PinCodeSchema.safeParse(pinCodeRaw);
    if (!pinCheck.success) return { error: 'Geçersiz PIN formatı.' };
    
    const pinCode = pinCheck.data;

    const currentUser = await getCurrentPassport();
    if (!currentUser || currentUser.pin_code !== pinCode) {
        return { error: 'Yetkisiz işlem: Başkasının cüzdanına erişemezsiniz.' };
    }

    const supabase = await createClient();

    // RLS'yi atlayan özel RPC fonksiyonumuzu çağırıyoruz
    const { data: tickets, error } = await supabase
        .rpc('get_user_tickets', {
            p_pin_code: pinCode,
            p_keyword_hash: currentUser.keyword_hash
        })
        .select(`
            *,
            events ( title, slug, event_date, location, image_url )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Ticket Action Error] Cüzdan Çekme Hatası:', error.message);
        return { error: 'Biletleriniz yüklenirken bir hata oluştu.' };
    }

    return { success: true, tickets };
}

// 3. CANLI BİLET DETAYI VE QR KOD (Sadece geçerliyse QR kod döner)
export async function getTicketForDisplay(ticketIdRaw: string, pinCodeRaw: string) {
    const ticketIdCheck = UUIDSchema.safeParse(ticketIdRaw);
    const pinCheck = PinCodeSchema.safeParse(pinCodeRaw);

    if (!ticketIdCheck.success || !pinCheck.success) {
        return { error: 'Geçersiz bilet bilgileri.' };
    }

    const ticketId = ticketIdCheck.data;
    const pinCode = pinCheck.data;

    const currentUser = await getCurrentPassport();
    if (!currentUser || currentUser.pin_code !== pinCode) {
        return { error: 'Yetkisiz işlem.' };
    }

    const supabase = await createClient();

    // Değişken adını ticketData yaptık ki karışmasın
    const { data: ticketData, error } = await supabase
        .rpc('get_user_tickets', {
            p_pin_code: pinCode,
            p_keyword_hash: currentUser.keyword_hash
        })
        .select(`
            *,
            events ( title, event_date, location, image_url )
        `)
        .eq('id', ticketId); 

    if (error || !ticketData) return { error: 'Bilet bulunamadı veya yetkisiz erişim.' };

    const ticket = Array.isArray(ticketData) ? ticketData[0] : ticketData;

    if (!ticket) return { error: 'Bilet verisi işlenemedi.' };

    if (ticket.status === TICKET_STATUS.CANCELLED) {
        return { error: 'Bu bilet iptal edilmiştir.', ticket };
    }

    return { success: true, ticket };
}

// 4. BİLETİ İPTAL ET (Kontenjanı geri verir)
export async function cancelMyTicket(ticketIdRaw: string, pinCodeRaw: string) {
    const ticketIdCheck = UUIDSchema.safeParse(ticketIdRaw);
    const pinCheck = PinCodeSchema.safeParse(pinCodeRaw);

    if (!ticketIdCheck.success || !pinCheck.success) {
        return { error: 'Geçersiz parametre formatı.' };
    }

    const ticketId = ticketIdCheck.data;
    const pinCode = pinCheck.data;

    const currentUser = await getCurrentPassport();
    if (!currentUser || currentUser.pin_code !== pinCode) {
        return { error: 'Yetkisiz işlem: Sadece kendi biletinizi iptal edebilirsiniz.' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc('cancel_ticket', {
        p_ticket_id: ticketId,
        p_pin_code: pinCode
    });

    if (error) {
        console.error('[Ticket Action Error] İptal RPC Hatası:', error.message);
        return { error: 'İptal işlemi sırasında bir hata oluştu.' };
    }

    if (!data.success) {
        return { error: data.message };
    }

    revalidatePath('/portal');
    revalidatePath(`/portal/ticket/${ticketId}`);
    
    return { success: true, message: data.message };
}
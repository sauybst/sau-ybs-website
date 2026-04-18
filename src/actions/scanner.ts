'use server'

import { createClient } from '@/utils/supabase/server'
import { requireAuth } from '@/utils/auth-guard'
import { USER_ROLES } from '@/utils/constants'
import { TICKET_STATUS } from '@/types/tickets'
import { TICKETING_MODE } from '@/types/event'
import { z } from 'zod'
import { UUIDSchema } from '@/utils/schemas'

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.EDITOR] as const
const MODULE_NAME = 'events'

// --- TİP TANIMLAMALARI ---
type TicketData = {
    id: string;
    status: number;
    pin_code: string;
    events: { ticketing_mode: number } | null;
}

// --- GİRDİ DOĞRULAMA ŞEMALARI ---
const SessionNameSchema = z.string().min(1, 'Oturum adı boş olamaz.').max(50, 'Oturum adı çok uzun.');
const QrHashSchema = z.string().min(10, 'Geçersiz QR kodu formatı.');
const PinCodeSchema = z.string().length(12, 'PIN kodu 12 haneli olmalıdır.');

// --- ÇEKİRDEK İŞ MANTIĞI  ---
async function processAttendance(
    supabase: any, 
    eventId: string, 
    ticket: TicketData, 
    sessionName: string
) {
    if (ticket.status === TICKET_STATUS.CANCELLED) {
        return { error: 'DİKKAT: Bu bilet iptal edilmiş! İşlem yapılamaz.' }
    }

    // Tip güvenli erişim
    const tMode = ticket.events?.ticketing_mode ?? TICKETING_MODE.STANDARD_QR;

    if (tMode === TICKETING_MODE.BUS_QR) {
        const { data: existingAtt } = await supabase
            .from('attendances')
            .select('id')
            .eq('event_id', eventId)
            .eq('passport_pin', ticket.pin_code)
            .eq('session_name', sessionName)
            .maybeSingle()

        if (existingAtt) {
            return { error: `DİKKAT: Bu bilet "${sessionName}" oturumu için zaten okutulmuş!` }
        }
    } else {
        if (ticket.status === TICKET_STATUS.SCANNED) {
            return { error: 'DİKKAT: Bu bilet daha önce OKUTULMUŞ! (Çift giriş denemesi)' }
        }
    }

    const { error: insertError } = await supabase.from('attendances').insert({
        event_id: eventId,
        passport_pin: ticket.pin_code,
        session_name: sessionName
    })

    if (insertError) {
        console.error('[Scanner Error] Yoklama kaydı hatası:', insertError.message);
        return { error: 'Yoklama alınırken sistemsel bir hata oluştu. Lütfen tekrar deneyin.' };
    }

    if (ticket.status !== TICKET_STATUS.SCANNED) {
        const { error: updateError } = await supabase
            .from('tickets')
            .update({ status: TICKET_STATUS.SCANNED, updated_at: new Date().toISOString() })
            .eq('id', ticket.id)

        // Veritabanı yönetim sistemlerindeki "Transaction" eksikliğinden dolayı bir fallback logu
        if (updateError) {
            console.error('[Scanner CRITICAL Error] Bilet güncellenemedi ancak yoklama alındı:', updateError.message);
        }
    }

    return { 
        success: true, 
        message: `${sessionName} Onaylandı!`, 
        pinCode: ticket.pin_code 
    }
}

export async function scanTicket(eventIdRaw: string, qrHashRaw: string, sessionNameRaw: string = 'Giriş') {
    // 1. Girdi Doğrulama
    const eventIdCheck = UUIDSchema.safeParse(eventIdRaw);
    const qrCheck = QrHashSchema.safeParse(qrHashRaw);
    const sessionCheck = SessionNameSchema.safeParse(sessionNameRaw);

    if (!eventIdCheck.success || !qrCheck.success || !sessionCheck.success) {
        return { error: 'Geçersiz parametre formatı.' }
    }

    const { data: eventId } = eventIdCheck;
    const { data: qrHash } = qrCheck;
    const { data: sessionName } = sessionCheck;

    const supabase = await createClient()

    // 2. Yetki Kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: 'Bu işlemi yapmak için yetkiniz bulunmuyor.' }

    // 3. Veri Çekme
    const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select(`
            id, 
            status, 
            pin_code,
            events ( ticketing_mode )
        `)
        .eq('qr_hash', qrHash)
        .eq('event_id', eventId)
        .single<TicketData>() // Tip ataması yapıldı

    if (fetchError || !ticket) {
        return { error: 'Geçersiz QR Kod! Bu bilet sistemde yok veya başka bir etkinliğe ait.' }
    }

    // 4. Çekirdek İş Mantığına Devret
    return processAttendance(supabase, eventId, ticket, sessionName)
}

export async function scanTicketByPin(eventIdRaw: string, pinCodeRaw: string, sessionNameRaw: string = 'Giriş (Manuel)') {
    // 1. Girdi Doğrulama
    const eventIdCheck = UUIDSchema.safeParse(eventIdRaw);
    const pinCheck = PinCodeSchema.safeParse(pinCodeRaw);
    const sessionCheck = SessionNameSchema.safeParse(sessionNameRaw);

    if (!eventIdCheck.success || !pinCheck.success || !sessionCheck.success) {
        return { error: 'Geçersiz parametre formatı.' }
    }

    const { data: eventId } = eventIdCheck;
    const { data: pinCode } = pinCheck;
    const { data: sessionName } = sessionCheck;

    const supabase = await createClient()

    // 2. Yetki Kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: 'Yetkisiz işlem.' }

    // 3. Veri Çekme
    const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select(`
            id, 
            status, 
            pin_code,
            events ( ticketing_mode )
        `)
        .eq('pin_code', pinCode.toUpperCase()) 
        .eq('event_id', eventId)
        .single<TicketData>()

    if (fetchError || !ticket) return { error: 'Bilet bulunamadı! Bu PIN bu etkinliğe ait değil.' }

    return processAttendance(supabase, eventId, ticket, sessionName)
}
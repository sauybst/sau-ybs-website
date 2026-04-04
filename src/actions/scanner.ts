'use server'

import { createClient } from '@/utils/supabase/server'
import { requireAuth } from '@/utils/auth-guard'
import { USER_ROLES } from '@/utils/constants'
import { TICKET_STATUS } from '@/types/tickets'
import { TICKETING_MODE } from '@/types/event'

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.EDITOR] as const
const MODULE_NAME = 'events'

// SİSTEM DÜZELTMESİ: Oturum (sessionName) desteği eklendi. Varsayılan: 'Giriş'
export async function scanTicket(eventId: string, qrHash: string, sessionName: string = 'Giriş') {
    const supabase = await createClient()

    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    
    if (!auth.authorized) {
        return { error: 'Bu işlemi yapmak için yetkiniz bulunmuyor.' }
    }

    // SİSTEM DÜZELTMESİ: ticketing_mode değerini JOIN ile çekiyoruz
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
        .single()

    if (fetchError || !ticket) {
        return { error: 'Geçersiz QR Kod! Bu bilet sistemde yok veya başka bir etkinliğe ait.' }
    }

    if (ticket.status === TICKET_STATUS.CANCELLED) {
        return { error: 'DİKKAT: Bu bilet iptal edilmiş! İşlem yapılamaz.' }
    }

    // Gelen verinin güvenliğini sağlıyoruz (events verisi obje olarak gelir)
    const tMode = (ticket.events as any)?.ticketing_mode ?? TICKETING_MODE.STANDARD_QR;

    // --- MANTIK DEĞİŞİMİ BURADA BAŞLIYOR ---
    if (tMode === TICKETING_MODE.BUS_QR) {
        // OTOBÜS MODU: Bu oturum (sessionName) için daha önce yoklama alınmış mı?
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
        // STANDART MOD: Tek girişlik sistem. Bilet daha önce kullanılmış mı?
        if (ticket.status === TICKET_STATUS.SCANNED) {
            return { error: 'DİKKAT: Bu bilet daha önce OKUTULMUŞ! (Çift giriş denemesi)' }
        }
    }

    // Bileti "Okutuldu" durumuna al (Eğer zaten okutulduysa otobüs modu için tekrar güncellemeye gerek yok ama zarar da vermez)
    if (ticket.status !== TICKET_STATUS.SCANNED) {
        await supabase
            .from('tickets')
            .update({ status: TICKET_STATUS.SCANNED, updated_at: new Date().toISOString() })
            .eq('id', ticket.id)
    }

    // Yoklama (Attendances) tablosuna kayıt atıyoruz
    await supabase.from('attendances').insert({
        event_id: eventId,
        passport_pin: ticket.pin_code,
        session_name: sessionName // 'Giriş', 'Gidiş', 'Dönüş' vb.
    })

    return { 
        success: true, 
        message: `${sessionName} Onaylandı!`, 
        pinCode: ticket.pin_code 
    }
}

// MANUEL PIN OKUMA İÇİN AYNI MANTIK
export async function scanTicketByPin(eventId: string, pinCode: string, sessionName: string = 'Giriş (Manuel)') {
    const supabase = await createClient()

    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    
    if (!auth.authorized) return { error: 'Yetkisiz işlem.' }

    const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select(`
            id, 
            status, 
            pin_code,
            events ( ticketing_mode )
        `)
        .eq('pin_code', pinCode)
        .eq('event_id', eventId)
        .single()

    if (fetchError || !ticket) return { error: 'Bilet bulunamadı! Bu PIN bu etkinliğe ait değil.' }
    if (ticket.status === TICKET_STATUS.CANCELLED) return { error: 'DİKKAT: Bu bilet iptal edilmiş!' }

    const tMode = (ticket.events as any)?.ticketing_mode ?? TICKETING_MODE.STANDARD_QR;

    if (tMode === TICKETING_MODE.BUS_QR) {
        const { data: existingAtt } = await supabase
            .from('attendances')
            .select('id')
            .eq('event_id', eventId)
            .eq('passport_pin', ticket.pin_code)
            .eq('session_name', sessionName)
            .maybeSingle()

        if (existingAtt) return { error: `DİKKAT: Bu PIN "${sessionName}" için zaten kullanılmış!` }
    } else {
        if (ticket.status === TICKET_STATUS.SCANNED) return { error: 'DİKKAT: Bu bilet daha önce OKUTULMUŞ!' }
    }

    if (ticket.status !== TICKET_STATUS.SCANNED) {
        await supabase
            .from('tickets')
            .update({ status: TICKET_STATUS.SCANNED, updated_at: new Date().toISOString() })
            .eq('id', ticket.id)
    }

    await supabase.from('attendances').insert({
        event_id: eventId,
        passport_pin: ticket.pin_code,
        session_name: sessionName
    })

    return { success: true, message: `${sessionName} Onaylandı!`, pinCode: ticket.pin_code }
}
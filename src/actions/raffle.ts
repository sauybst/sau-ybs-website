'use server'

import { createClient } from '@/utils/supabase/server'
import { TICKET_STATUS } from '@/types/tickets'
import { requireAuth } from '@/utils/auth-guard'
import { UUIDSchema } from '@/utils/schemas'
import { USER_ROLES } from '@/utils/constants'

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.EDITOR] as const
const MODULE_NAME = 'events'

export async function getRafflePool(eventId: string) {
    // 1. Girdi Doğrulama 
    const idCheck = UUIDSchema.safeParse(eventId)
    if (!idCheck.success) return { error: 'Geçersiz etkinlik kimliği.' }

    const supabase = await createClient()

    // 2. Yetki Kontrolü 
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    
    if (!auth.authorized) {
        return { error: 'Çekiliş havuzunu görüntülemek için yetkiniz bulunmuyor.' }
    }

    // 3. Veritabanı Sorgusu
    const { data: attendees, error } = await supabase
        .from('tickets')
        .select('pin_code')
        .eq('event_id', eventId)
        .eq('status', TICKET_STATUS.SCANNED)

    // 4. Güvenli Hata Yönetimi
    if (error) {
        console.error('[Raffle Error]: Havuz oluşturulurken veritabanı hatası:', error.message)
        return { error: 'Havuz oluşturulamadı.' }
    }

    return { 
        success: true, 
        pool: attendees.map(a => a.pin_code) 
    }
}
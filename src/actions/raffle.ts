'use server'

import { createClient } from '@/utils/supabase/server'
import { TICKET_STATUS } from '@/types/tickets'

export async function getRafflePool(eventId: string) {
    const supabase = await createClient()

    // Sadece içeri girenleri çekiyoruz
    const { data: attendees, error } = await supabase
        .from('tickets')
        .select('pin_code')
        .eq('event_id', eventId)
        .eq('status', TICKET_STATUS.SCANNED)

    if (error) return { error: 'Havuz oluşturulamadı.' }
    return { success: true, pool: attendees.map(a => a.pin_code) }
}
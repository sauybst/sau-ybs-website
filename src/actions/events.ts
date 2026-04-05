'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/utils/auth-guard'
import { uploadImage, deleteStorageFile, handleImageUpdate } from '@/utils/storage'
import { EventSchema, UUIDSchema } from '@/utils/schemas'
import { STORAGE_BUCKETS, STORAGE_FOLDERS, USER_ROLES } from '@/utils/constants'
import { TICKETING_MODE } from '@/types/event' 
import { TICKET_STATUS } from '@/types/tickets'
import { supabaseAdmin } from '@/utils/supabase/admin'

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.EDITOR] as const
const MODULE_NAME = 'events'

/**
 * FormData içerisindeki veriyi alır, doğrular ve iş mantığına uygun tiplere dönüştürür.
 */

function extractAndValidateEventData(formData: FormData) {
    const raw = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        event_date: formData.get('event_date') as string,
        location: formData.get('location') as string,
        description: formData.get('description') as string,
        registration_url: formData.get('registration_url') as string,
    }

    const validated = EventSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message, data: null }
    }

    const ticketingModeRaw = formData.get('ticketing_mode')
    const ticketing_mode = ticketingModeRaw !== null 
        ? parseInt(ticketingModeRaw as string, 10) 
        : TICKETING_MODE.FREE

    const capacityRaw = formData.get('capacity')
    let capacity: number | null = null
    
    if (ticketing_mode !== TICKETING_MODE.FREE && capacityRaw) {
        const parsed = parseInt(capacityRaw as string, 10)
        if (!isNaN(parsed)) capacity = parsed
    }

    return { 
        error: null, 
        data: { ...validated.data, ticketing_mode, capacity } 
    }
}

type AttendanceRecord = {
    id: string;
    passport_pin: string;
    session_name: string;
    scanned_at?: string;
    created_at?: string;
}


export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    // 1. Yetki Kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    // 2. Girdi Doğrulama ve Normalizasyon
    const { error: validationError, data: eventData } = extractAndValidateEventData(formData)
    if (validationError || !eventData) return { error: validationError }

    // 3. Görsel Yükleme
    const imageFile = formData.get('image') as File | null
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        const result = await uploadImage(
            supabase, STORAGE_BUCKETS.EVENTS, STORAGE_FOLDERS.EVENT_POSTERS, imageFile, eventData.slug,
        )
        if (result.error) return { error: result.error }
        image_url = result.url
    }

    // 4. Veritabanı İşlemi
    const { error } = await supabase.from('events').insert({
        ...eventData,
        event_date: new Date(eventData.event_date).toISOString(),
        registration_url: eventData.registration_url || null,
        image_url,
        created_by: auth.userId,      
    })

    if (error) {
        console.error('Etkinlik oluşturma hatası:', error.message)
        return { error: 'Etkinlik oluşturulurken bir hata oluştu.' }
    }

    revalidatePath('/admin/events')
    redirect('/admin/events')
}

export async function deleteEvent(id: string) {
    const idCheck = UUIDSchema.safeParse(id)
    if (!idCheck.success) return { error: 'Geçersiz kayıt kimliği.' }

    const supabase = await createClient()

    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    const { data: event } = await supabase
        .from('events')
        .select('image_url')
        .eq('id', id)
        .single()

    if (event?.image_url) {
        await deleteStorageFile(supabase, STORAGE_BUCKETS.EVENTS, event.image_url)
    }

    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
        console.error('Etkinlik silme hatası:', error.message)
        return { error: 'Etkinlik silinirken bir hata oluştu.' }
    }

    revalidatePath('/admin/events')
}

export async function updateEvent(formData: FormData) {
    const supabase = await createClient()

    // 1. Yetki ve ID Kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    const id = formData.get('id') as string
    const idCheck = UUIDSchema.safeParse(id)
    if (!idCheck.success) return { error: 'Geçersiz kayıt kimliği.' }

    // 2. Girdi Doğrulama ve Normalizasyon
    const { error: validationError, data: eventData } = extractAndValidateEventData(formData)
    if (validationError || !eventData) return { error: validationError }

    // 3. Görsel Güncelleme
    const imageResult = await handleImageUpdate(supabase, STORAGE_BUCKETS.EVENTS, STORAGE_FOLDERS.EVENT_POSTERS, {
        newFile: formData.get('image_file') as File | null,
        removeImage: formData.get('remove_image') === 'true',
        oldImageUrl: formData.get('old_image_url') as string,
        fileNameSlug: eventData.slug,
    })
    if (imageResult.error) return { error: imageResult.error }

    // 4. Veritabanı İşlemi
    const { error } = await supabase
        .from('events')
        .update({
            ...eventData,
            event_date: new Date(eventData.event_date).toISOString(),
            registration_url: eventData.registration_url || null,
            image_url: imageResult.url,
        })
        .eq('id', id)

    if (error) {
        console.error('Etkinlik güncelleme hatası:', error.message)
        return { error: 'Etkinlik güncellenirken bir hata oluştu.' }
    }

    // Etkinlik tipi ücretsiz yapıldıysa, eski biletleri temizleme mantığı
    if (eventData.ticketing_mode === TICKETING_MODE.FREE) {
        const { error: deleteTicketsError } = await supabase
            .from('tickets')
            .delete()
            .eq('event_id', id)

        if (deleteTicketsError) {
            console.error('Yetim biletleri temizleme hatası:', deleteTicketsError.message)
        }
    }

    revalidatePath('/admin/events')
    revalidatePath(`/events/${eventData.slug}`)
    redirect('/admin/events')
}

export async function getEventDashboardData(eventId: string) {
    const idCheck = UUIDSchema.safeParse(eventId)
    if (!idCheck.success) return { error: 'Geçersiz etkinlik kimliği.' }

    const supabase = await createClient()

    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: 'Bu paneli görüntülemek için yetkiniz bulunmuyor.' }

    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

    if (eventError || !event) return { error: 'Etkinlik bulunamadı veya silinmiş.' }

    const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('updated_at', { ascending: false })

    if (ticketsError) return { error: 'Bilet verileri çekilirken bir hata oluştu.' }

    let attendances: AttendanceRecord[] = []

    const attendancePrimary = await supabaseAdmin
        .from('attendances')
        .select('id, passport_pin, session_name, scanned_at')
        .eq('event_id', eventId)
        .order('scanned_at', { ascending: true })

    if (attendancePrimary.error) {
        const attendanceFallback = await supabaseAdmin
            .from('attendances')
            .select('id, passport_pin, session_name, created_at')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true })

        if (attendanceFallback.error) {
            console.error('Yoklama verisi çekme hatası:', {
                primary: attendancePrimary.error.message,
                fallback: attendanceFallback.error.message,
            })
            return { error: 'Yoklama verileri çekilirken bir hata oluştu.' }
        }

        attendances = attendanceFallback.data || []
    } else {
        attendances = attendancePrimary.data || []
    }

    const stats = {
        capacity: event.capacity || 0,
        active: 0,      
        scanned: 0,     
        cancelled: 0,   
        totalValid: 0   
    }

    tickets?.forEach(ticket => {
        if (ticket.status === TICKET_STATUS.ACTIVE) stats.active++
        else if (ticket.status === TICKET_STATUS.SCANNED) stats.scanned++
        else if (ticket.status === TICKET_STATUS.CANCELLED) stats.cancelled++
    })

    stats.totalValid = stats.active + stats.scanned

    return {
        success: true,
        event,
        tickets: tickets || [],
        attendances,
        stats
    }
}

export async function updateTicketStatus(ticketId: string, newStatus: number) {
    const idCheck = UUIDSchema.safeParse(ticketId)
    if (!idCheck.success) return { error: 'Geçersiz bilet kimliği.' }

    const supabase = await createClient()
    
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: 'Bu işlemi gerçekleştirmek için yetkiniz yok.' }

    const { error } = await supabase
        .from('tickets')
        .update({ 
            status: newStatus,
            updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId)

    if (error) {
        console.error('Bilet güncelleme hatası:', error.message)
        return { error: 'Güncelleme başarısız oldu.' }
    }
    
    return { success: true }
}
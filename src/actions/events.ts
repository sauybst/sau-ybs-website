'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/utils/auth-guard'
import { uploadImage, deleteStorageFile, handleImageUpdate } from '@/utils/storage'
import { EventSchema, UUIDSchema } from '@/utils/schemas'
import { STORAGE_BUCKETS, STORAGE_FOLDERS, USER_ROLES } from '@/utils/constants'
import { TICKETING_MODE } from '@/types/event' 

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.EDITOR] as const
const MODULE_NAME = 'events'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    // — Girdi doğrulama
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
        return { error: validated.error.issues[0].message }
    }
    const { title, slug, event_date, location, description, registration_url } = validated.data

    // — Yeni Biletleme Alanlarının İşlenmesi (Normalizasyon - Integer Mapping)
    const ticketingModeRaw = formData.get('ticketing_mode')
    // FormData'dan gelen metinsel '0', '1', '2' değerini matematiksel sayıya çeviriyoruz. Boşsa FREE (0) yapıyoruz.
    const ticketing_mode = ticketingModeRaw !== null 
        ? parseInt(ticketingModeRaw as string, 10) 
        : TICKETING_MODE.FREE

    const capacityRaw = formData.get('capacity')
    let capacity = null
    
    // Eğer mod FREE (0) değilse ve kapasite girildiyse sayıya çevir
    if (ticketing_mode !== TICKETING_MODE.FREE && capacityRaw) {
        const parsed = parseInt(capacityRaw as string, 10)
        if (!isNaN(parsed)) capacity = parsed
    }

    // — Görsel yükleme
    const imageFile = formData.get('image') as File | null
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        const result = await uploadImage(
            supabase, STORAGE_BUCKETS.EVENTS, STORAGE_FOLDERS.EVENT_POSTERS, imageFile, slug,
        )
        if (result.error) return { error: result.error }
        image_url = result.url
    }

    // — Veritabanına kayıt
    const { error } = await supabase.from('events').insert({
        title,
        slug,
        event_date: new Date(event_date).toISOString(),
        location,
        description,
        registration_url: registration_url || null,
        image_url,
        created_by: auth.userId,
        ticketing_mode, // Artık 0, 1 veya 2 olarak gidiyor
        capacity,       
    })

    if (error) {
        console.error('Etkinlik oluşturma hatası:', error)
        return { error: 'Etkinlik oluşturulurken bir hata oluştu.' }
    }

    revalidatePath('/admin/events')
    redirect('/admin/events')
}

export async function deleteEvent(id: string) {
    const idCheck = UUIDSchema.safeParse(id)
    if (!idCheck.success) return { error: 'Geçersiz kayıt kimliği.' }

    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    // — Görseli Storage'dan sil
    const { data: event } = await supabase
        .from('events')
        .select('image_url')
        .eq('id', id)
        .single()

    if (event?.image_url) {
        await deleteStorageFile(supabase, STORAGE_BUCKETS.EVENTS, event.image_url)
    }

    // — Veritabanından sil
    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
        console.error('Etkinlik silme hatası:', error)
        return { error: 'Etkinlik silinirken bir hata oluştu.' }
    }

    revalidatePath('/admin/events')
}

export async function updateEvent(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    const id = formData.get('id') as string
    const idCheck = UUIDSchema.safeParse(id)
    if (!idCheck.success) return { error: 'Geçersiz kayıt kimliği.' }

    // — Girdi doğrulama
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
        return { error: validated.error.issues[0].message }
    }
    const { title, slug, event_date, location, description, registration_url } = validated.data

    // — Yeni Biletleme Alanlarının İşlenmesi (Normalizasyon - Integer Mapping)
    const ticketingModeRaw = formData.get('ticketing_mode')
    const ticketing_mode = ticketingModeRaw !== null 
        ? parseInt(ticketingModeRaw as string, 10) 
        : TICKETING_MODE.FREE

    const capacityRaw = formData.get('capacity')
    let capacity = null
    
    if (ticketing_mode !== TICKETING_MODE.FREE && capacityRaw) {
        const parsed = parseInt(capacityRaw as string, 10)
        if (!isNaN(parsed)) capacity = parsed
    }

    // — Görsel güncelleme
    const imageResult = await handleImageUpdate(supabase, STORAGE_BUCKETS.EVENTS, STORAGE_FOLDERS.EVENT_POSTERS, {
        newFile: formData.get('image_file') as File | null,
        removeImage: formData.get('remove_image') === 'true',
        oldImageUrl: formData.get('old_image_url') as string,
        fileNameSlug: slug,
    })
    if (imageResult.error) return { error: imageResult.error }

    // — Veritabanını güncelle
    const { error } = await supabase
        .from('events')
        .update({
            title,
            slug,
            event_date: new Date(event_date).toISOString(),
            location,
            registration_url: registration_url || null,
            description,
            image_url: imageResult.url,
            ticketing_mode, // Artık 0, 1 veya 2 olarak gidiyor
            capacity,       
        })
        .eq('id', id)

    if (error) {
        console.error('Etkinlik güncelleme hatası:', error)
        return { error: 'Etkinlik güncellenirken bir hata oluştu.' }
    }

    revalidatePath('/admin/events')
    revalidatePath(`/events/${slug}`)
    redirect('/admin/events')
}
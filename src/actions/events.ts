'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const event_date = formData.get('event_date') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string
    const registration_url = formData.get('registration_url') as string
    const imageFile = formData.get('image') as File | null  // 'image_url' değil 'image'!

    if (!title || !slug || !event_date || !location) {
        return { error: 'Gerekli alanları doldurunuz.' }
    }

    const { data: { user } } = await supabase.auth.getUser()

    // --- STORAGE UPLOAD ---
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        // Benzersiz dosya adı: timestamp + slug + .webp
        const fileName = `${Date.now()}-${slug}.webp`
        const filePath = `event-posters/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('events')           // ← Supabase'deki bucket adın neyse onu yaz
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Afiş yüklenirken hata oluştu: ' + uploadError.message }
        }

        // Public URL al
        const { data: urlData } = supabase.storage
            .from('events')           // ← aynı bucket adı
            .getPublicUrl(filePath)

        image_url = urlData.publicUrl
    }
    // --- STORAGE UPLOAD SON ---

    const { error } = await supabase.from('events').insert({
        title,
        slug,
        event_date: new Date(event_date).toISOString(),
        location,
        description,
        registration_url: registration_url || null,
        image_url,                    // Artık gerçek URL geliyor
        created_by: user?.id,
    })

    if (error) {
        console.error('DB insert hatası:', error)
        return { error: 'Etkinlik oluşturulurken hata oluştu: ' + error.message }
    }

    revalidatePath('/admin/events')
    redirect('/admin/events')
}

export async function deleteEvent(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
        console.error('Error deleting event:', error)
        throw new Error('Etkinlik silinirken hata oluştu.')
    }

    revalidatePath('/admin/events')
}

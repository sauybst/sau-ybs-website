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
    const image_url = formData.get('image_url') as string

    if (!title || !slug || !event_date || !location) {
        throw new Error('Gerekli alanları doldurunuz.')
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('events').insert({
        title,
        slug,
        event_date: new Date(event_date).toISOString(),
        location,
        description,
        registration_url,
        image_url,
        created_by: user?.id,
    })

    if (error) {
        console.error('Error creating event:', error)
        throw new Error('Etkinlik oluşturulurken hata oluştu.')
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

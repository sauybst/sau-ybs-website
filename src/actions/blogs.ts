'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBlog(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const content = formData.get('content') as string
    const cover_image_url = formData.get('cover_image_url') as string

    if (!title || !slug || !content) {
        throw new Error('Gerekli alanları doldurunuz.')
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('blogs').insert({
        title,
        slug,
        content,
        cover_image_url,
        published_at: new Date().toISOString(),
        author_id: user?.id,
    })

    if (error) {
        console.error('Error creating blog:', error)
        throw new Error('Yazı oluşturulurken hata oluştu.')
    }

    revalidatePath('/admin/blogs')
    redirect('/admin/blogs')
}

export async function deleteBlog(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('blogs').delete().eq('id', id)

    if (error) {
        console.error('Error deleting blog:', error)
        throw new Error('Yazı silinirken hata oluştu.')
    }

    revalidatePath('/admin/blogs')
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/utils/auth-guard'
import { generateSlug } from '@/utils/slugify'
import { uploadImage, deleteStorageFile, handleImageUpdate } from '@/utils/storage'
import { BlogSchema } from '@/utils/schemas'
import { STORAGE_BUCKETS, STORAGE_FOLDERS, USER_ROLES } from '@/utils/constants'

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.EDITOR] as const
const MODULE_NAME = 'blogs'

export async function createBlog(formData: FormData) {
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
        content: formData.get('content') as string,
        type: parseInt(formData.get('type') as string, 10),
    }
    const validated = BlogSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { title, content, type } = validated.data

    const slug = generateSlug(title)
    if (!slug) return { error: 'Başlıktan geçerli bir slug üretilemedi.' }

    // — Görsel yükleme
    const imageFile = formData.get('image_file') as File | null
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        const result = await uploadImage(
            supabase, STORAGE_BUCKETS.BLOGS, STORAGE_FOLDERS.BLOG_COVERS, imageFile, slug,
        )
        if (result.error) return { error: result.error }
        image_url = result.url
    }

    // — Veritabanına kayıt
    const { error } = await supabase.from('blogs').insert({
        title,
        slug,
        content,
        type,
        cover_image_url: image_url,
        author_id: auth.userId,
        published_at: new Date().toISOString(),
    })

    if (error) {
        console.error('Blog oluşturma hatası:', error)
        return { error: 'Yazı oluşturulurken bir hata oluştu.' }
    }

    revalidatePath('/admin/blogs')
    redirect('/admin/blogs')
}

export async function deleteBlog(id: string) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    // — Kapak görseli varsa Storage'dan sil
    const { data: blog } = await supabase
        .from('blogs')
        .select('cover_image_url')
        .eq('id', id)
        .single()

    if (blog?.cover_image_url) {
        await deleteStorageFile(supabase, STORAGE_BUCKETS.BLOGS, blog.cover_image_url)
    }

    // — Veritabanından sil
    const { error } = await supabase.from('blogs').delete().eq('id', id)

    if (error) {
        console.error('Blog silme hatası:', error)
        return { error: 'Yazı silinirken bir hata oluştu.' }
    }

    revalidatePath('/admin/blogs')
}

export async function updateBlog(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    const id = formData.get('id') as string

    // — Girdi doğrulama
    const raw = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        type: parseInt(formData.get('type') as string, 10),
    }
    const validated = BlogSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { title, content, type } = validated.data

    const slug = generateSlug(title)
    if (!slug) return { error: 'Başlıktan geçerli bir slug üretilemedi.' }

    // — Görsel güncelleme
    const imageResult = await handleImageUpdate(supabase, STORAGE_BUCKETS.BLOGS, STORAGE_FOLDERS.BLOG_COVERS, {
        newFile: formData.get('image_file') as File | null,
        removeImage: formData.get('remove_image') === 'true',
        oldImageUrl: formData.get('old_image_url') as string,
        fileNameSlug: slug,
    })
    if (imageResult.error) return { error: imageResult.error }

    // — Veritabanını güncelle
    const { error } = await supabase
        .from('blogs')
        .update({
            title,
            slug,
            content,
            type,
            cover_image_url: imageResult.url,
        })
        .eq('id', id)

    if (error) {
        console.error('Blog güncelleme hatası:', error)
        return { error: 'Yazı güncellenirken bir hata oluştu.' }
    }

    revalidatePath('/admin/blogs')
    revalidatePath(`/blogs/${slug}`)
    redirect('/admin/blogs')
}
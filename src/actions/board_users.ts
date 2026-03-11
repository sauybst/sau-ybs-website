'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/utils/auth-guard'
import { uploadImage, deleteStorageFile, handleImageUpdate } from '@/utils/storage'
import { BoardMemberSchema, UUIDSchema } from '@/utils/schemas'
import { STORAGE_BUCKETS, STORAGE_FOLDERS, USER_ROLES } from '@/utils/constants'

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN] as const

export async function createBoardMember(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, { allowedRoles: [...ALLOWED_ROLES] })
    if (!auth.authorized) return { error: auth.error }

    // — Girdi doğrulama
    const raw = {
        full_name: formData.get('full_name') as string,
        slug: formData.get('slug') as string,
        board_role: formData.get('board_role') as string,
        board_level: formData.get('board_level') as string,
        term_year: formData.get('term_year') as string,
        is_active: formData.get('is_active') === 'true',
        linkedin_url: formData.get('linkedin_url') as string,
        description: formData.get('description') as string,
    }
    const validated = BoardMemberSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { full_name, slug, board_role, board_level, term_year, is_active, linkedin_url, description } = validated.data

    // — Fotoğraf yükleme
    const imageFile = formData.get('image') as File | null
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        const safeName = full_name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
        const result = await uploadImage(
            supabase, STORAGE_BUCKETS.BOARD, STORAGE_FOLDERS.MEMBERS, imageFile, safeName,
        )
        if (result.error) return { error: result.error }
        image_url = result.url
    }

    // — Veritabanına kayıt
    const { error } = await supabase.from('board_members').insert({
        full_name,
        slug,
        board_role,
        board_level,
        term_year,
        is_active,
        linkedin_url: linkedin_url || null,
        description,
        image_url,
    })

    if (error) {
        console.error('Üye ekleme hatası:', error)
        return { error: 'Üye eklenirken bir hata oluştu.' }
    }

    revalidatePath('/admin/board')
    revalidatePath('/about')
    redirect('/admin/board')
}

export async function deleteBoardMember(id: string) {
    const idCheck = UUIDSchema.safeParse(id)
    if (!idCheck.success) return { error: 'Geçersiz kayıt kimliği.' }

    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, { allowedRoles: [...ALLOWED_ROLES] })
    if (!auth.authorized) return { error: auth.error }

    // — Fotoğrafı Storage'dan sil
    const { data: member } = await supabase
        .from('board_members')
        .select('image_url')
        .eq('id', id)
        .single()

    if (member?.image_url) {
        await deleteStorageFile(supabase, STORAGE_BUCKETS.BOARD, member.image_url)
    }

    // — Veritabanından sil
    const { error } = await supabase.from('board_members').delete().eq('id', id)

    if (error) {
        console.error('Üye silme hatası:', error)
        return { error: 'Üye silinirken bir hata oluştu.' }
    }

    revalidatePath('/admin/board')
    revalidatePath('/about')
}

export async function updateBoardMember(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, { allowedRoles: [...ALLOWED_ROLES] })
    if (!auth.authorized) return { error: auth.error }

    const id = formData.get('id') as string
    const idCheck = UUIDSchema.safeParse(id)
    if (!idCheck.success) return { error: 'Geçersiz kayıt kimliği.' }

    // — Girdi doğrulama
    const raw = {
        full_name: formData.get('full_name') as string,
        slug: formData.get('slug') as string,
        board_role: formData.get('board_role') as string,
        board_level: formData.get('board_level') as string,
        term_year: formData.get('term_year') as string,
        is_active: formData.get('is_active') === 'true',
        linkedin_url: formData.get('linkedin_url') as string,
        description: formData.get('description') as string,
    }
    const validated = BoardMemberSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { full_name, slug, board_role, board_level, term_year, is_active, linkedin_url, description } = validated.data

    // — Fotoğraf güncelleme
    const safeName = full_name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
    const imageResult = await handleImageUpdate(supabase, STORAGE_BUCKETS.BOARD, STORAGE_FOLDERS.MEMBERS, {
        newFile: formData.get('image_file') as File | null,
        removeImage: formData.get('remove_image') === 'true',
        oldImageUrl: formData.get('old_image_url') as string,
        fileNameSlug: safeName,
    })
    if (imageResult.error) return { error: imageResult.error }

    // — Veritabanını güncelle
    const { error } = await supabase
        .from('board_members')
        .update({
            full_name,
            slug,
            board_role,
            board_level,
            term_year,
            is_active,
            linkedin_url: linkedin_url || null,
            description,
            image_url: imageResult.url,
        })
        .eq('id', id)

    if (error) {
        console.error('Üye güncelleme hatası:', error)
        return { error: 'Güncelleme sırasında bir hata oluştu.' }
    }

    revalidatePath('/admin/board')
    revalidatePath('/about')
    redirect('/admin/board')
}
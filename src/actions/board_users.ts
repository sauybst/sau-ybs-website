'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBoardMember(formData: FormData) {
    const supabase = await createClient()

    // Formdan gelen verileri çekiyoruz (slug ve description EKLENDİ)
    const full_name = formData.get('full_name') as string
    const slug = formData.get('slug') as string
    const board_role = formData.get('board_role') as string
    const board_level = formData.get('board_level') as string
    const term_year = formData.get('term_year') as string
    const is_active = formData.get('is_active') === 'true'
    const linkedin_url = formData.get('linkedin_url') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File | null

    if (!full_name || !board_role || !term_year || !board_level) {
        return { error: 'Gerekli alanları doldurunuz.' }
    }

    // --- STORAGE UPLOAD ---
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        // Dosya adı: timestamp-isim-soyisim.webp
        const safeName = full_name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
        const fileName = `${Date.now()}-${safeName}.webp`
        const filePath = `members/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('board') 
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Profil fotoğrafı yüklenirken hata oluştu: ' + uploadError.message }
        }

        const { data: urlData } = supabase.storage
            .from('board')
            .getPublicUrl(filePath)

        image_url = urlData.publicUrl
    }

    // Veritabanına Yazma (slug ve description EKLENDİ)
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
        console.error('DB insert hatası:', error)
        return { error: 'Üye eklenirken hata oluştu: ' + error.message }
    }

    revalidatePath('/admin/board')
    revalidatePath('/about')
    redirect('/admin/board')
}

export async function deleteBoardMember(id: string) {
    const supabase = await createClient()

    // 1. Önce resmi bul
    const { data: member } = await supabase
        .from('board_members')
        .select('image_url')
        .eq('id', id)
        .single()

    // 2. Storage'dan sil
    if (member?.image_url) {
        const filePath = member.image_url.split('/storage/v1/object/public/board/')[1]
        if (filePath) {
            await supabase.storage.from('board').remove([filePath])
        }
    }

    // 3. DB'den sil
    const { error } = await supabase.from('board_members').delete().eq('id', id)

    if (error) {
        console.error('Error deleting member:', error)
        throw new Error('Üye silinirken hata oluştu.')
    }

    revalidatePath('/admin/board')
    revalidatePath('/about')
}

export async function updateBoardMember(formData: FormData) {
    const supabase = await createClient()

    // Verileri Yakalama (slug ve description EKLENDİ)
    const id = formData.get('id') as string
    const full_name = formData.get('full_name') as string
    const slug = formData.get('slug') as string
    const board_role = formData.get('board_role') as string
    const board_level = formData.get('board_level') as string
    const term_year = formData.get('term_year') as string
    const is_active = formData.get('is_active') === 'true'
    const linkedin_url = formData.get('linkedin_url') as string
    const description = formData.get('description') as string

    const imageFile = formData.get('image_file') as File | null
    const removeImage = formData.get('remove_image') === 'true'
    const oldImageUrl = formData.get('old_image_url') as string

    let finalImageUrl = oldImageUrl

    const extractPathFromUrl = (url: string) => {
        if (!url) return null
        const parts = url.split('/storage/v1/object/public/board/')
        return parts.length > 1 ? parts[1] : null
    }

    // Eski resmi temizleme
    if ((removeImage || (imageFile && imageFile.size > 0)) && oldImageUrl) {
        const pathToDelete = extractPathFromUrl(oldImageUrl)
        if (pathToDelete) {
            await supabase.storage.from('board').remove([pathToDelete])
        }
        if (removeImage) finalImageUrl = ''
    }

    // Yeni resim yükleme
    if (imageFile && imageFile.size > 0) {
        const safeName = full_name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
        const fileName = `${Date.now()}-${safeName}.webp`
        const filePath = `members/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('board')
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (!uploadError) {
            const { data: urlData } = supabase.storage.from('board').getPublicUrl(filePath)
            finalImageUrl = urlData.publicUrl
        }
    }

    // Veritabanını Güncelleme (slug ve description EKLENDİ)
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
            image_url: finalImageUrl || null,
        })
        .eq('id', id)

    if (error) {
        return { error: 'Güncelleme hatası: ' + error.message }
    }

    revalidatePath('/admin/board')
    revalidatePath('/about')
    redirect('/admin/board')
}
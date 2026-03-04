'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBoardMember(formData: FormData) {
    const supabase = await createClient()

    const full_name = formData.get('full_name') as string
    const board_role = formData.get('board_role') as string
    const term_year = formData.get('term_year') as string
    const is_active = formData.get('is_active') === 'on'
    const image_url = formData.get('image_url') as string
    const linkedin_url = formData.get('linkedin_url') as string

    if (!full_name || !board_role || !term_year) {
        throw new Error('Gerekli alanları doldurunuz.')
    }

    const { error } = await supabase.from('board_members').insert({
        full_name,
        board_role,
        term_year,
        is_active,
        image_url,
        linkedin_url
    })

    if (error) {
        console.error('Error creating board member:', error)
        throw new Error('Yönetim kurulu üyesi eklenirken hata oluştu.')
    }

    revalidatePath('/admin/board')
    redirect('/admin/board')
}

export async function deleteBoardMember(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('board_members').delete().eq('id', id)

    if (error) {
        console.error('Error deleting board member:', error)
        throw new Error('Yönetim kurulu üyesi silinirken hata oluştu.')
    }

    revalidatePath('/admin/board')
}

// Admins only action: Creating a new user
export async function createUser(formData: FormData) {
    const supabase = await createClient()

    // Sadece admin yetkisi olan kişilerin buraya erişimini garanti altına alıyoruz
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()

    if (adminProfile?.role !== 'admin') {
        throw new Error('Erişim Reddedildi. Yalnızca adminler kullanıcı ekleyebilir.')
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const role = formData.get('role') as string

    if (!email || !password || !first_name || !last_name) {
        throw new Error('Tüm alanları doldurunuz.')
    }

    // Supabase Auth üzerinde kullanıcı oluşturma
    const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (authError) {
        console.error('Kullanıcı oluşturma hatası:', authError)
        throw new Error('Kullanıcı hesabı oluşturulamadı.')
    }

    // Auth u id ile profiles tablosuna bilgilerini kaydetme
    if (newAuthUser?.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            id: newAuthUser.user.id,
            first_name,
            last_name,
            role
        })

        if (profileError) {
            console.error('Profil oluşturma hatası:', profileError)
            // Bu seviyede kullanıcı eklendi ancak profili eklenmediyse rollback yapılamayabilir
            // bu yüzden try-catch ile dikkatli kullanılmalıdır.
            throw new Error('Kullanıcı profili oluşturulamadı.')
        }
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}

export async function deleteUser(userId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()

    if (adminProfile?.role !== 'admin') {
        throw new Error('Erişim Reddedildi.')
    }

    // Öncelikle auth tablosundan sileriz, trigger veya Cascade ayarlandıysa profile da silinir.
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Kullanıcı silme hatası:', error)
        throw new Error('Kullanıcı silinirken bir hata oluştu.')
    }

    revalidatePath('/admin/users')
}

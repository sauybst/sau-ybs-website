'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createUserByAdmin(formData: FormData) {
    const supabase = await createClient() // Normal oturum kontrolü için

    // 1. İşlemi yapan kişinin 'super_admin' olduğunu doğrula
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Oturum bulunamadı.' }

    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'super_admin') {
        return { error: 'Yeni kullanıcı eklemek için Super Admin yetkisi gerekmektedir.' }
    }

    // Form verilerini al
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const role = formData.get('role') as string
    
    // Checkbox'lardan gelen dizi verilerini topla
    const accessibleModules = formData.getAll('modules') as string[]

    if (!email || !password || !firstName || !lastName) {
        return { error: 'Lütfen tüm zorunlu alanları doldurun.' }
    }

    // 2. SUPABASE ADMIN CLIENT OLUŞTUR (Sessizce kullanıcı açmak için)
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 3. Auth tablosunda kullanıcıyı oluştur (email_confirm: true ile onaysız direkt girebilsin)
    const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true 
    })

    if (createError) {
        console.error('Kullanıcı oluşturma hatası:', createError)
        return { error: 'Kullanıcı oluşturulamadı: ' + createError.message }
    }

    // 4. Veritabanındaki Trigger, auth'a kayıt atılınca 'profiles' tablosuna varsayılan 
    // ('Yeni Kullanıcı' ve 'viewer' olarak) kayıt attı. Şimdi biz o kaydı asıl verilerle ezeceğiz.
    if (newAuthUser.user) {
            const { error: upsertError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: newAuthUser.user.id, // En kritik nokta: Auth tablosundaki ID'yi profiles tablosuna biz zorla yazıyoruz!
                    first_name: firstName,
                    last_name: lastName,
                    role: role,
                    accessible_modules: role === 'editor' ? accessibleModules : []
                })

            if (upsertError) {
                console.error('Profil oluşturma/güncelleme hatası:', upsertError)
                return { error: 'Kullanıcı açıldı ancak profil verileri yazılamadı: ' + upsertError.message }
            }
        }

    revalidatePath('/admin/users')
    return { success: true }
}


export async function updateUserPermissions(userId: string, role: string, modules: string[]) {
    const supabase = await createClient() // Normal oturum ve yetki kontrolü için

    // 1. İşlemi yapan kişinin kimliğini al
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Oturum bulunamadı.' }

    // 2. İşlemi yapan kişinin gerçekten 'super_admin' olup olmadığını kontrol et
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'super_admin') {
        return { error: 'Bu işlem için Super Admin yetkisi gerekmektedir.' }
    }

    // 3. Adminin kendini yanlışlıkla yetkisiz bırakmasını engelle
    if (user.id === userId && role !== 'super_admin') {
        return { error: 'Kendi Super Admin yetkinizi kaldıramazsınız!' }
    }

    // 4. SUPABASE ADMIN CLIENT OLUŞTUR (RLS Güvenlik Duvarını Aşmak İçin)
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 5. Veritabanını Admin Client (supabaseAdmin) ile güncelle
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
            role: role, 
            accessible_modules: role === 'editor' ? modules : [] 
        })
        .eq('id', userId)

    if (error) {
        console.error('Yetki güncelleme hatası:', error)
        return { error: 'Yetkiler güncellenirken bir hata oluştu: ' + error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
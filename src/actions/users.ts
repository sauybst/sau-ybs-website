'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { requireAuth } from '@/utils/auth-guard'
import { CreateUserSchema, UpdateUserPermissionsSchema } from '@/utils/schemas'
import { USER_ROLES } from '@/utils/constants'

/**
 * Supabase Admin Client oluşturur.
 * Service Role Key ile RLS bypass'ı yapar.
 */
function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

export async function createUserByAdmin(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü: Sadece super_admin
    const auth = await requireAuth(supabase, {
        allowedRoles: [USER_ROLES.SUPER_ADMIN],
    })
    if (!auth.authorized) return { error: auth.error }

    // — Girdi doğrulama
    const raw = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        role: formData.get('role') as string,
    }
    const validated = CreateUserSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { email, password, first_name, last_name, role } = validated.data

    const accessibleModules = formData.getAll('modules') as string[]

    // — Admin client ile kullanıcı oluştur
    const supabaseAdmin = createAdminClient()

    const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (createError) {
        console.error('Kullanıcı oluşturma hatası:', createError)
        return { error: 'Kullanıcı oluşturulamadı. Lütfen bilgileri kontrol edin.' }
    }

    // — Profil güncelle
    if (newAuthUser.user) {
        const { error: upsertError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newAuthUser.user.id,
                first_name,
                last_name,
                role,
                accessible_modules: role === USER_ROLES.EDITOR ? accessibleModules : [],
            })

        if (upsertError) {
            console.error('Profil oluşturma hatası:', upsertError)
            return { error: 'Kullanıcı açıldı ancak profil verileri yazılamadı.' }
        }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function updateUserPermissions(userId: string, role: string, modules: string[]) {
    const supabase = await createClient()

    // — Girdi doğrulama
    const validated = UpdateUserPermissionsSchema.safeParse({ userId, role, modules })
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // — Yetki kontrolü: Sadece super_admin
    const auth = await requireAuth(supabase, {
        allowedRoles: [USER_ROLES.SUPER_ADMIN],
    })
    if (!auth.authorized) return { error: auth.error }

    // — Adminin kendini yetkisiz bırakmasını engelle
    if (auth.userId === userId && role !== USER_ROLES.SUPER_ADMIN) {
        return { error: 'Kendi Super Admin yetkinizi kaldıramazsınız!' }
    }

    // — Admin client ile güncelle (RLS bypass)
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            role: validated.data.role,
            accessible_modules: validated.data.role === USER_ROLES.EDITOR ? validated.data.modules : [],
        })
        .eq('id', validated.data.userId)

    if (error) {
        console.error('Yetki güncelleme hatası:', error)
        return { error: 'Yetkiler güncellenirken bir hata oluştu.' }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
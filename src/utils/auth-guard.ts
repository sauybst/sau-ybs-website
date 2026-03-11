// ============================================================
// Server Action Yetki Kontrolü (Authorization Guard)
// Middleware'deki RBAC'ı tamamlayıcı "defence in depth" katmanı.
// ============================================================

import { type SupabaseClient } from '@supabase/supabase-js'
import { USER_ROLES, type UserRole } from './constants'

type AuthSuccess = {
    authorized: true
    userId: string
    role: UserRole
}

type AuthFailure = {
    authorized: false
    error: string
}

export type AuthResult = AuthSuccess | AuthFailure

interface AuthOptions {
    /** Bu action'a erişebilecek roller. Boş bırakılırsa sadece oturum kontrolü yapılır. */
    allowedRoles?: UserRole[]
    /** Editör rolü için zorunlu modül adı (blogs, events, jobs, projects). */
    requiredModule?: string
}

/**
 * Server action'ın başında çağrılarak kullanıcının oturum açmış olduğunu
 * ve gerekli role/modül erişimine sahip olduğunu doğrular.
 *
 * @example
 * const auth = await requireAuth(supabase, {
 *     allowedRoles: ['super_admin', 'admin', 'editor'],
 *     requiredModule: 'blogs',
 * })
 * if (!auth.authorized) return { error: auth.error }
 */
export async function requireAuth(
    supabase: SupabaseClient,
    options: AuthOptions = {},
): Promise<AuthResult> {
    const { allowedRoles, requiredModule } = options

    // 1. Oturum kontrolü
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { authorized: false, error: 'Bu işlem için oturum açmanız gerekiyor.' }
    }

    // 2. Profil ve rol çek
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, accessible_modules')
        .eq('id', user.id)
        .single()

    if (!profile) {
        return { authorized: false, error: 'Kullanıcı profili bulunamadı.' }
    }

    const role = profile.role as UserRole

    // 3. Rol kontrolü (eğer belirtilmişse)
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(role)) {
            return { authorized: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' }
        }
    }

    // 4. Editör modül kontrolü
    if (role === USER_ROLES.EDITOR && requiredModule) {
        const modules: string[] = profile.accessible_modules || []
        if (!modules.includes(requiredModule)) {
            return { authorized: false, error: 'Bu modüle erişim yetkiniz bulunmamaktadır.' }
        }
    }

    return { authorized: true, userId: user.id, role }
}

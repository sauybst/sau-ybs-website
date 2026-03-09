import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 1. Kullanıcının oturum açıp açmadığını kontrol et
    const { data: { user } } = await supabase.auth.getUser()

    // Geçerli URL yolunu al
    const path = request.nextUrl.pathname

    // GÜVENLİK DUVARI: Sadece "/admin" ile başlayan sayfalara müdahale ediyoruz.
    if (path.startsWith('/admin')) {
        
        // A) Eğer kişi giriş yapmamışsa, anında kapı dışarı et ve Login'e yolla
        if (!user) {
            const url = request.nextUrl.clone()
            // NOT: Projendeki login sayfasının URL'si /login ise böyle kalsın. Farklıysa düzelt.
            url.pathname = '/login' 
            return NextResponse.redirect(url)
        }

        // B) Eğer giriş yapmışsa, Veritabanından (profiles tablosundan) Rolünü Çek
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, accessible_modules')
            .eq('id', user.id)
            .single()

        if (!profile) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        const role = profile.role
        const modules = profile.accessible_modules || []

        // --- RBAC (ROL BAZLI ERİŞİM KONTROLÜ) KURALLARI ---

        // KURAL 1: Kullanıcı Yönetimi (/admin/users) -> SADECE "super_admin"
        if (path.startsWith('/admin/users') && role !== 'super_admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            url.searchParams.set('error', 'unauthorized')
            return NextResponse.redirect(url)
        }

        // KURAL 2: Editör Kısıtlamaları (Sadece yetkili olduğu modüle girebilir)
        if (role === 'editor') {
            const checkModules = ['events', 'jobs', 'blogs', 'projects']
            
            for (const mod of checkModules) {
                if (path.startsWith(`/admin/${mod}`) && !modules.includes(mod)) {
                    const url = request.nextUrl.clone()
                    url.pathname = '/admin'
                    url.searchParams.set('error', 'unauthorized')
                    return NextResponse.redirect(url)
                }
            }
        }

        // KURAL 3: İzleyici (Viewer) Kısıtlamaları (Create ve Edit yapılamaz)
        if (role === 'viewer') {
            if (path.includes('/create') || path.includes('/edit')) {
                const url = request.nextUrl.clone()
                url.pathname = '/admin'
                url.searchParams.set('error', 'unauthorized')
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. KATMAN: Supabase'in varsayılan oturum (auth) ve çerez güncellemelerini çalıştırıyoruz.
    // Bu işlem bize header'ları ayarlanmış hazır bir response nesnesi döndürür.
    const supabaseResponse = await updateSession(request)

    // 2. KATMAN: zaferOPS Özel Pasaport (Portal) Kontrolleri
    const path = request.nextUrl.pathname
    const isProtectedRoute = path.startsWith('/portal')
    const isAuthRoute = path === '/pasaport'
    
    // Bizim kendi ürettiğimiz anonim bilet çerezi
    const zaferOpsSession = request.cookies.get('zaferops_session')?.value

    // Senaryo A: Çerezi olmayan biri zorla portala girmeye çalışırsa pasaporta yönlendir
    if (isProtectedRoute && !zaferOpsSession) {
        return NextResponse.redirect(new URL('/pasaport', request.url))
    }

    // Senaryo B: Zaten pasaportu (çerezi) olan biri giriş/kayıt ekranına gelirse direkt portala al
    if (isAuthRoute && zaferOpsSession) {
        return NextResponse.redirect(new URL('/portal', request.url))
    }

    // Hiçbir engele takılmadıysa, Supabase'in hazırladığı response ile yola devam et
    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Sayfa geçişlerinde performansı düşürmemek için statik dosyaları es geçiyoruz.
         */
        '/((?!_next/static|_next/image|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
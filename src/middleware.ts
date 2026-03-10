import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Tüm yükü utils altındaki updateSession fonksiyonuna devrediyoruz
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Sayfa geçişlerinde performansı düşürmemek için statik dosyaları es geçiyoruz.
         */
        '/((?!_next/static|_next/image|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
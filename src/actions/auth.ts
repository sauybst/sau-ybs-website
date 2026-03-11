'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/utils/schemas'
import { checkRateLimit } from '@/utils/rate-limit'

type LoginState = {
    error: string | null
}

// Rate limit ayarları: 15 dakikada en fazla 5 deneme
const LOGIN_RATE_LIMIT = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 dakika
}

export async function login(prevState: LoginState, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'E-posta ve şifre alanları zorunludur.' }
    }

    // — Rate limit kontrolü (e-posta bazlı)
    const rateLimitKey = `login:${email.toLowerCase().trim()}`
    const rateCheck = checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT)
    if (!rateCheck.allowed) {
        const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000)
        return { error: `Çok fazla başarısız deneme. Lütfen ${retryMinutes} dakika sonra tekrar deneyin.` }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // Güvenlik: Hata detaylarını kullanıcıya sızdırmıyoruz
        console.error('Login hatası:', error.message)
        return { error: 'Kullanıcı adı veya şifre yanlış.' }
    }

    redirect('/admin')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}


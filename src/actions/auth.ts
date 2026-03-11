'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/utils/schemas'
import { checkRateLimit } from '@/utils/rate-limit'

type LoginState = {
    error: string | null
}

type ResetPasswordState = ActionState

// Rate limit ayarları: 15 dakikada en fazla 5 deneme
const LOGIN_RATE_LIMIT = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 dakika
}

// Rate limit ayarları: 15 dakikada en fazla 3 şifre sıfırlama denemesi
const RESET_PASSWORD_RATE_LIMIT = {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 dakika
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getPasswordResetRedirectUrl(): string | null {
    const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
        return process.env.NODE_ENV === 'development' ? 'http://localhost:3000/update-password' : null
    }

    try {
        const baseUrl = new URL(siteUrl)

        if (process.env.NODE_ENV === 'production' && baseUrl.protocol !== 'https:') {
            console.error('SITE_URL üretimde HTTPS olmalıdır.')
            return null
        }

        return new URL('/updatePassword', baseUrl).toString()
    } catch {
        console.error('Geçersiz SITE_URL/NEXT_PUBLIC_SITE_URL yapılandırması.')
        return process.env.NODE_ENV === 'development' ? 'http://localhost:3000/update-password' : null
    }
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

export async function resetPassword(_prevState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
    const emailValue = formData.get('email')
    const email = typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : ''

    if (!email) {
        return { error: 'Lütfen e-posta adresinizi girin.', success: false }
    }

    if (!isValidEmail(email)) {
        return { error: 'Lütfen geçerli bir e-posta adresi girin.', success: false }
    }

    const rateLimitKey = `reset-password:${email}`
    const rateCheck = checkRateLimit(rateLimitKey, RESET_PASSWORD_RATE_LIMIT)
    if (!rateCheck.allowed) {
        const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000)
        return { error: `Çok fazla deneme yaptınız. Lütfen ${retryMinutes} dakika sonra tekrar deneyin.`, success: false }
    }

    const redirectTo = getPasswordResetRedirectUrl()
    if (!redirectTo) {
        console.error('Şifre sıfırlama yönlendirme URL yapılandırması eksik/geçersiz.')
        return { error: 'İşlem şu anda gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.', success: false }
    }

    const supabase = await createClient()

    // Supabase'den şifre sıfırlama maili göndermesini istiyoruz
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    })

    if (error) {
        console.error('Şifre sıfırlama hatası:', error.message)
        return { error: 'Mail gönderilirken bir hata oluştu. Lütfen tekrar deneyin.', success: false }
    }

    return { success: true }
}
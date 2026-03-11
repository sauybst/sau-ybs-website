'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/utils/schemas'

type LoginState = {
    error: string | null
}

export async function login(prevState: LoginState, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'E-posta ve şifre alanları zorunludur.' }
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

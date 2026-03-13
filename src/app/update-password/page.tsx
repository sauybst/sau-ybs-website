"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { ShieldCheck } from 'lucide-react'


const MIN_PASSWORD_LENGTH = 10

function validatePassword(password: string): string | null {
    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.`
    }

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
        return 'Şifre en az 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.'
    }

    return null
}

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSaving) return

        const passwordValidationError = validatePassword(password)
        if (passwordValidationError) {
            showToast(passwordValidationError, 'error')
            return
        }

        if (password !== confirmPassword) {
            showToast('Şifre tekrarı eşleşmiyor.', 'error')
            return
        }

        setIsSaving(true)

        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) {
                showToast('Şifre güncellenemedi. Lütfen tekrar deneyin.', 'error')
                return
            }

            showToast('Şifreniz başarıyla ve güvenle güncellendi!', 'success')
            router.push('/admin')
        } catch {
            showToast('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-brand-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-heading font-extrabold text-slate-900">
                    Yeni Şifre Belirle
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Lütfen hesabınız için yeni ve güçlü bir şifre girin.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleUpdatePassword}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Yeni Şifreniz
                            </label>
                            <input
                                type="password"
                                required
                                minLength={MIN_PASSWORD_LENGTH}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border-slate-200 py-3 px-4 focus:border-brand-500 focus:ring-brand-500"
                                placeholder={`En az ${MIN_PASSWORD_LENGTH} karakter, büyük-küçük harf, sayı ve özel karakter`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Yeni Şifre (Tekrar)
                            </label>
                            <input
                                type="password"
                                required
                                minLength={MIN_PASSWORD_LENGTH}
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-xl border-slate-200 py-3 px-4 focus:border-brand-500 focus:ring-brand-500"
                                placeholder="Şifrenizi tekrar girin"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Güncelleniyor...' : 'Şifremi Güvenle Değiştir'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
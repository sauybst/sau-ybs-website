"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { ShieldCheck } from 'lucide-react'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        // Supabase ile kullanıcının şifresini güncelliyoruz
        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            showToast('Şifre güncellenirken hata oluştu: ' + error.message, 'error')
            setIsSaving(false)
        } else {
            showToast('Şifreniz başarıyla ve güvenle güncellendi!', 'success')
            router.push('/admin') // Başarılı olunca admin paneline yolla
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
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border-slate-200 py-3 px-4 focus:border-brand-500 focus:ring-brand-500"
                                placeholder="En az 6 karakter"
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
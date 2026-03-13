'use client'

import { login } from '@/actions/auth'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'


const initialState = {
    error: null as string | null,
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-3 px-4 text-sm font-semibold text-white rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: pending ? 'none' : '0 4px 20px rgba(37,99,235,0.4)',
            }}
        >
            {pending ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Giriş Yapılıyor...
                </>
            ) : 'Giriş Yap'}
        </button>
    )
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, initialState)

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* SOL PANEL */}
            <div
                className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between items-center p-10 relative overflow-hidden shrink-0"
                style={{ background: 'linear-gradient(160deg, #0f1623 0%, #151d2e 60%, #1a2540 100%)' }}
            >
                {/* Arka plan desen */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
                {/* Glow */}
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }}
                />

                {/* Logo — üstte */}
                <div className="relative z-10 flex items-center gap-3 self-start">
                    <Image
                        src="/logotip.webp"
                        alt="SAÜ YBS Logo"
                        width={400}
                        height={400}
                    />
                </div>

                {/* Orta metin — dikeyde ve yatayda ortalı */}
                <div className="relative z-10 space-y-4 text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        SİSTEM AKTİF
                    </div>
                    <h2 className="text-3xl font-bold text-white leading-tight">
                        Yönetim Paneline<br />Hoş Geldiniz
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        SAÜ YBS ekosistemindeki tüm etkinlikleri, blogları ve öğrenci projelerini tek bir merkezden yönetin.
                    </p>
                </div>

                {/* Alt bilgi */}
                <div className="relative z-10">
                    <p className="text-slate-600 text-xs">
                        © {new Date().getFullYear()} SAÜ YBS Topluluğu · Tüm hakları saklıdır
                    </p>
                </div>
            </div>

            {/* SAĞ PANEL — Form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

                {/* Mobilde logo — ortalı */}
                <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
                    <Image
                        src="/logotip.webp"
                        alt="SAÜ YBS Logo"
                        width={400}
                        height={400}
                    />
                </div>

                <div className="w-full max-w-sm">

                    {/* Başlık */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Giriş Yap</h1>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Yalnızca yetkili hesaplar erişebilir
                        </p>
                    </div>

                    {/* Hata */}
                    {state?.error && (
                        <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" clipRule="evenodd" />
                            </svg>
                            {state.error}
                        </div>
                    )}

                    {/* Form */}
                    <form action={formAction} className="space-y-5">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1.5">
                                E-Posta Adresi
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                placeholder="ornek@sauybs.com"
                                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white border border-slate-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Şifre
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white border border-slate-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div className="flex justify-end items-center mb-1.5">
                            <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                                Şifremi Unuttum
                            </Link>
                        </div>
                        
                        <div className="pt-1">
                            <SubmitButton />
                        </div>
                    </form>

                    {/* Güvenlik notu */}
                    <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1l9 4v6c0 5.25-3.75 10.15-9 11.25C6.75 21.15 3 16.25 3 11V5l9-4zm0 10.99h6.75C18.25 15.54 15.5 18.74 12 19.93V12H5.25V6.69L12 3.83v8.16z" clipRule="evenodd" />
                        </svg>
                        Güvenli bağlantı ile korunmaktadır
                    </div>
                </div>
            </div>
        </div>
    )
}
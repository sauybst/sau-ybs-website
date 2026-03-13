'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/actions/auth'
import type { ActionState } from '@/utils/schemas'
import Link from 'next/link'
import { ArrowLeft, KeyRound } from 'lucide-react'
export const runtime = 'edge';

type ForgotPasswordState = ActionState

const initialState: ForgotPasswordState = {
    success: false
}

const GENERIC_ERROR_MESSAGE = 'İşlem şu anda tamamlanamıyor. Lütfen daha sonra tekrar deneyin.'

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(resetPassword, initialState)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <KeyRound className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-heading font-extrabold text-slate-900">
                    Şifrenizi mi Unuttunuz?
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-100">
                    
                    {state.success ? (
                        <div className="text-center">
                            <div className="mb-4 text-sm text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
                                Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir. Lütfen gelen kutunuzu kontrol edin.
                            </div>
                            <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                                Giriş sayfasına dön
                            </Link>
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-6">
                            {state.error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200" role="alert" aria-live="polite">
                                    {GENERIC_ERROR_MESSAGE}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                    E-Posta Adresiniz
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    inputMode="email"
                                    maxLength={254}
                                    required
                                    className="block w-full rounded-xl border-slate-200 py-3 px-4 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="ornek@sauybs.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                            >
                                {isPending ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
                            </button>
                        </form>
                    )}

                    {!state.success && (
                        <div className="mt-6 text-center">
                            <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Giriş sayfasına geri dön
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
'use client'

import { login } from '@/actions/auth'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

const initialState = {
    error: null as string | null,
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button type="submit" disabled={pending} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400">
            {pending ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
    )
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 flex-col py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                        SAU YBS Yönetim
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Lütfen yetkili hesabınızla giriş yapın
                    </p>
                </div>
                <form className="mt-8 space-y-6" action={formAction}>
                    {state?.error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 text-center">
                            {state.error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm flex flex-col gap-4">
                        <div>
                            <label htmlFor="email-address" className="text-sm font-medium text-gray-700">Email Adresi</label>
                            <input id="email-address" name="email" type="email" required className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="ornek@sauybs.com" />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Şifre</label>
                            <input id="password" name="password" type="password" required className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="••••••••" />
                        </div>
                    </div>
                    <div>
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    )
}

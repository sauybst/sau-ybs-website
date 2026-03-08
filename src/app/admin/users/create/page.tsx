import { createBoardMember } from '@/actions/board_users'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function CreateUserPage() {
    const supabase = await createClient()

    // Checking admin rights
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()

    if (adminProfile?.role !== 'admin') {
        return (
            <div className="p-8 text-center mt-10">
                <ShieldAlert className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Yetkiniz Yok</h2>
                <p className="mt-2 text-gray-600">Bu sayfaya yalnızca sistem yöneticileri erişebilir.</p>
                <Link href="/admin" className="mt-6 inline-block text-indigo-600 hover:text-indigo-800">
                    Panoya Dön
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Yeni Kullanıcı (Editör/Admin) Ekle
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        İptal
                    </Link>
                </div>
            </div>

            <form action={async (formData) => { await createBoardMember(formData); }} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <div className="sm:col-span-3">
                            <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-gray-900">
                                Adı
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="first_name"
                                    id="first_name"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-gray-900">
                                Soyadı
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="last_name"
                                    id="last_name"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                E-posta Adresi (Giriş için kullanılacak)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Geçici Şifre (En az 6 karakter)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    required
                                    minLength={6}
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                                Kullanıcı Rolü / Yetkisi
                            </label>
                            <div className="mt-2">
                                <select
                                    id="role"
                                    name="role"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="editor">Editör (Sadece İçerik Ekleyip Silebilir)</option>
                                    <option value="admin">Admin (Tüm Sisteme ve Başka Kullanıcı Eklemeye Erişebilir)</option>
                                </select>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50">
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Kullanıcıyı Kaydet
                    </button>
                </div>
            </form>
        </div>
    )
}

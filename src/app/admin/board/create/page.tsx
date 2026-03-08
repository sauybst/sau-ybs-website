import { createBoardMember } from '@/actions/board_users'
import Link from 'next/link'

export default function CreateBoardMemberPage() {
    const handleSubmit = async (formData: FormData) => {
        await createBoardMember(formData)
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Yönetim Kurulu Üyesi Ekle
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/admin/board"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        İptal
                    </Link>
                </div>
            </div>

            <form action={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <div className="sm:col-span-3">
                            <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-gray-900">
                                Ad Soyad
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="full_name"
                                    id="full_name"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="board_role" className="block text-sm font-medium leading-6 text-gray-900">
                                Görevi (Örn: Başkan, Kurul Üyesi)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="board_role"
                                    id="board_role"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3 relative flex items-start">
                            <div className="flex h-6 items-center">
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label htmlFor="is_active" className="font-medium text-gray-900">
                                    Şu anki Aktif Yönetim Kurulu'nda mı?
                                </label>
                                <p className="text-gray-500">İşareti kaldırırsanız bu kişi geçmiş dönem arşivine eklenir.</p>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="term_year" className="block text-sm font-medium leading-6 text-gray-900">
                                Dönem Yılı
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="term_year"
                                    id="term_year"
                                    placeholder="2024-2025 Dönemi"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="image_url" className="block text-sm font-medium leading-6 text-gray-900">
                                Fotoğraf URL
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="image_url"
                                    id="image_url"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="linkedin_url" className="block text-sm font-medium leading-6 text-gray-900">
                                LinkedIn Profil URL
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="linkedin_url"
                                    id="linkedin_url"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                    </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Kaydet
                    </button>
                </div>
            </form>
        </div>
    )
}

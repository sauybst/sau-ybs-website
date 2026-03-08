import { createJobPosting } from '@/actions/projects'
import Link from 'next/link'

export default function CreateJobPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Yeni İlan Ekle
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/admin/jobs"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        İptal
                    </Link>
                </div>
            </div>

            <form action={createJobPosting} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <div className="sm:col-span-3">
                            <label htmlFor="company_name" className="block text-sm font-medium leading-6 text-gray-900">
                                Şirket Adı
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="company_name"
                                    id="company_name"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="position_name" className="block text-sm font-medium leading-6 text-gray-900">
                                Pozisyon Adı
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="position_name"
                                    id="position_name"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="work_model" className="block text-sm font-medium leading-6 text-gray-900">
                                Çalışma Modeli (Uzaktan, Hibrit vs.)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="work_model"
                                    id="work_model"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="deadline_date" className="block text-sm font-medium leading-6 text-gray-900">
                                Son Başvuru Tarihi
                            </label>
                            <div className="mt-2">
                                <input
                                    type="date"
                                    name="deadline_date"
                                    id="deadline_date"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="application_link" className="block text-sm font-medium leading-6 text-gray-900">
                                Başvuru Linki / E-posta
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="application_link"
                                    id="application_link"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                                İlan Detayları
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    required
                                    className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    defaultValue={''}
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

import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Trash2, Building2, Briefcase } from 'lucide-react'
import { deleteProject } from '@/actions/projects'

export default async function JobsPage() {
    const supabase = await createClient()

    const { data: jobs, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    İş ve Staj İlanları
                </h2>
                <Link href="/admin/jobs/create" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    İlan Ekle
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                    {jobs?.map((job) => (
                        <li key={job.id}>
                            <div className="px-4 py-4 flex items-center sm:px-6">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="truncate">
                                        <div className="flex text-sm">
                                            <Briefcase className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <p className="font-medium text-indigo-600 truncate">{job.position_name}</p>
                                            <span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                {job.work_model}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Building2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                                                <span className="font-medium">{job.company_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {job.is_active ? 'Aktif' : 'Pasif'}
                                    </span>
                                    <form action={async () => {
                                        'use server'
                                        await deleteProject(job.id)
                                    }}>
                                        <button type="submit" className="text-red-500 hover:text-red-700" title="Sil">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </li>
                    ))}
                    {!jobs?.length && (
                        <li className="px-4 py-8 text-center text-sm text-gray-500">
                            Henüz bir ilan bulunmuyor. Yeni bir iş veya staj ilanı ekleyerek başlayabilirsiniz.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

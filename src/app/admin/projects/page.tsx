import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Trash2, FolderGit2 } from 'lucide-react'
import { deleteProject } from '@/actions/projects_jobs'

export default async function ProjectsPage() {
    const supabase = await createClient()

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching projects:', error)
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Öğrenci Projeleri
                </h2>
                <Link href="/admin/projects/create" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Proje Ekle
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                    {projects?.map((project) => (
                        <li key={project.id}>
                            <div className="px-4 py-4 flex items-center sm:px-6">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="truncate">
                                        <div className="flex text-sm">
                                            <FolderGit2 className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <p className="font-medium text-indigo-600 truncate">{project.title}</p>
                                            <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {project.category}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex">
                                            <div className="flex items-center text-sm text-gray-500">
                                                Geliştiren(ler): <span className="ml-1 font-medium">{project.developer_names}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                                    <form action={async () => {
                                        'use server'
                                        await deleteProject(project.id)
                                    }}>
                                        <button type="submit" className="text-red-500 hover:text-red-700" title="Sil">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </li>
                    ))}
                    {!projects?.length && (
                        <li className="px-4 py-8 text-center text-sm text-gray-500">
                            Henüz bir proje bulunmuyor. Yeni bir proje ekleyerek başlayabilirsiniz.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

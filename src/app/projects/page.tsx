import { createClient } from '@/utils/supabase/server'
import { FolderGit2, ExternalLink } from 'lucide-react'

export const metadata = {
    title: 'Öğrenci Projeleri - YBS Topluluğu',
    description: 'Sakarya Üniversitesi YBS öğrencilerinin geliştirdiği projeler.',
}

export default async function PublicProjectsPage() {
    const supabase = await createClient()

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Öğrenci Projeleri</h1>
                    <p className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto">
                        Öğrencilerimizin geliştirdiği akademik ödevler, kişisel girişimler ve açık kaynak sistem analizi portfolyosu.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {(!projects || projects.length === 0) ? (
                        <p className="text-slate-500 col-span-3 text-center py-10 bg-white rounded-xl shadow-sm border border-slate-200">
                            Henüz sergilenen bir proje bulunmamaktadır.
                        </p>
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group">
                                <div className="h-48 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                                    {project.image_url ? (
                                        <img src={project.image_url} alt={project.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center">
                                            <FolderGit2 className="h-16 w-16 text-indigo-300 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-indigo-700 shadow-sm">
                                            {project.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{project.title}</h3>
                                    <p className="text-sm font-medium text-indigo-600 mb-4">
                                        Geliştiren(ler): <span className="text-slate-600">{project.developer_names}</span>
                                    </p>

                                    <p className="text-slate-600 text-sm flex-1 leading-relaxed line-clamp-4 mb-6">
                                        {project.description}
                                    </p>

                                    {project.project_url && (
                                        <div className="mt-auto pt-4 border-t border-slate-100">
                                            <a
                                                href={project.project_url.startsWith('http') ? project.project_url : `https://${project.project_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group-hover:underline"
                                            >
                                                Projeyi İncele <ExternalLink className="ml-1 h-4 w-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

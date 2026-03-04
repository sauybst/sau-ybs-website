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
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Açık Kaynak</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Öğrenci Projeleri</h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-light">
                        Öğrencilerimizin geliştirdiği akademik araştırmalar, kişisel girişimler ve açık kaynak sistem analizi portfolyosu.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {(!projects || projects.length === 0) ? (
                        <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                            Henüz sergilenen bir proje bulunmamaktadır.
                        </p>
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group block">
                                <div className="h-56 bg-slate-100 w-full relative overflow-hidden border-b border-slate-100">
                                    {project.image_url ? (
                                        <img src={project.image_url} alt={project.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center">
                                            <FolderGit2 className="h-20 w-20 text-brand-300 opacity-40" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-brand-700 border border-white/50 shadow-md">
                                            {project.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">{project.title}</h3>

                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1">Geliştiren(ler)</p>
                                        <p className="text-sm font-medium text-slate-700">{project.developer_names}</p>
                                    </div>

                                    <p className="text-slate-600 text-sm flex-1 leading-relaxed line-clamp-4 mb-6">
                                        {project.description}
                                    </p>

                                    {project.project_url && (
                                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-end">
                                            <a
                                                href={project.project_url.startsWith('http') ? project.project_url : `https://${project.project_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-4 py-2 border border-brand-200 text-sm font-semibold rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-600 hover:text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all group-hover:-translate-y-0.5 w-full"
                                            >
                                                Projeyi İncele <ExternalLink className="ml-2 -mr-1 h-4 w-4" />
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

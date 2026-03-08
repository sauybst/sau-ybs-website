import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Eye, Edit, Code, User, Calendar, ExternalLink } from 'lucide-react'
import { deleteProject } from '@/actions/projects' 
import DeleteConfirmButton from '@/components/DeleteConfirmButton'

export default async function ProjectsPage() {
    const supabase = await createClient()

    // Projeleri eklenme tarihine göre en yeniden en eskiye sıralayarak çekiyoruz
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching projects:', error)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            
            {/* Üst Header ve Aksiyon Bölümü */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                        Proje Yönetimi
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Topluluğa ait açık kaynak projeleri görüntüleyin, düzenleyin veya silin.</p>
                </div>
                <Link 
                    href="/admin/projects/create" 
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Yeni Proje Ekle
                </Link>
            </div>

            {/* Proje Kartları Listesi */}
            <div className="flex flex-col gap-4">
                {projects?.map((project) => {
                    return (
                        <div key={project.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 sm:items-center justify-between group">
                            
                            {/* SOL KISIM: Görsel ve Bilgiler */}
                            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                {/* Thumbnail (Küçük Görsel) */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                    {project.image_url ? (
                                        <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Code className="w-8 h-8 text-brand-200" />
                                    )}
                                </div>

                                {/* Metin İçeriği */}
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        {/* Dinamik Kategori Rozeti */}
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                                            {project.category}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900 truncate">
                                            {project.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium mt-1">
                                        <div className="flex items-center" title="Geliştiriciler">
                                            <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
                                            <span className="truncate max-w-[150px] sm:max-w-xs">{project.developer_names}</span>
                                        </div>
                                        <div className="flex items-center" title="Eklenme Tarihi">
                                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
                                            <time dateTime={project.created_at}>
                                                {new Date(project.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SAĞ KISIM: Aksiyon Butonları */}
                            <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                
                                {/* Kaynak Kod / Canlı Link Butonu (Eğer URL varsa) */}
                                {project.project_url && (
                                    <a 
                                        href={project.project_url} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 text-slate-400 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors tooltip-trigger"
                                        title="Projeye Git (GitHub / Canlı)"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}

                                {/* Sitede Görüntüle Butonu */}
                                <Link 
                                    href="/projects" 
                                    target="_blank"
                                    className="p-2.5 text-slate-400 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-colors tooltip-trigger"
                                    title="Sitede Görüntüle"
                                >
                                    <Eye className="w-5 h-5" />
                                </Link>

                                {/* Düzenle Butonu */}
                                <Link 
                                    href={`/admin/projects/edit/${project.id}`} 
                                    className="p-2.5 text-slate-400 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>

                                {/* Akıllı Silme Onay Butonu */}
                                <DeleteConfirmButton 
                                    id={project.id} 
                                    onDelete={deleteProject} 
                                    itemName={project.title} 
                                />
                            </div>

                        </div>
                    )
                })}

                {/* Boş Durum (Empty State) Görünümü */}
                {(!projects || projects.length === 0) && (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Code className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz Proje Yok</h3>
                        <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
                            Sistemde kayıtlı herhangi bir açık kaynak proje bulunamadı. Yeni bir proje ekleyerek topluluğun gücünü sergileyin.
                        </p>
                        <Link 
                            href="/admin/projects/create" 
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            İlk Projeyi Ekle
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
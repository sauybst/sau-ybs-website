import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FolderOpen, ExternalLink, User, Code } from 'lucide-react'

export const metadata = {
    title: 'Açık Kaynak Projeler - YBS Topluluğu',
    description: 'Sakarya Üniversitesi YBS Topluluğu üyeleri tarafından geliştirilen açık kaynak ve teknoloji projeleri.',
}

export default async function PublicProjectsPage(props: any) {
    const searchParams = await props.searchParams;
    const currentFilter = searchParams?.category || 'all';

    const supabase = await createClient()

    // Tüm projeleri en yeniden eskiye çekiyoruz
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    // Veritabanındaki projelerden benzersiz kategorileri (filtre butonları için) çıkarıyoruz
    const uniqueCategories = Array.from(new Set(projects?.map(p => p.category) || []));

    // Seçili kategoriye göre projeleri filtreliyoruz
    const filteredProjects = projects?.filter((project) => {
        if (currentFilter === 'all') return true;
        return project.category === currentFilter;
    });

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Üst Başlık ve Filtreleme Bölümü */}
                <div className="text-center mb-12">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Açık Kaynak</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Projelerimiz</h1>
                    <p className="mt-4 max-w-2xl text-medium text-slate-600 mx-auto font-montserrat">
                        Topluluk üyelerimizin geliştirdiği yenilikçi yazılımlar, yapay zeka modelleri ve otomasyon sistemleri.
                    </p>

                    {/* Dinamik Kategori Filtre Butonları */}
                    <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
                        <Link 
                            href="?category=all" 
                            scroll={false}
                            className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${currentFilter === 'all' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            Tümü
                        </Link>
                        {uniqueCategories.map((category) => (
                            <Link 
                                key={category}
                                href={`?category=${encodeURIComponent(category)}`} 
                                scroll={false}
                                className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${currentFilter === category ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Proje Kartları Grid Alanı */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {(!filteredProjects || filteredProjects.length === 0) ? (
                        <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                            Bu kategoride henüz listelenmiş bir proje bulunmamaktadır.
                        </p>
                    ) : (
                        filteredProjects.map((project) => {
                            return (
                                <div key={project.id} className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group">
                                    
                                    {/* Kategori Rozeti (Etkinliklerdeki Yaklaşan/Geçmiş yerine) */}
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md bg-slate-900/90 text-white">
                                            {project.category}
                                        </span>
                                    </div>

                                    {/* Görsel Alanı (Sinematik Efekt) */}
                                    <div className="h-64 bg-slate-950 w-full relative overflow-hidden flex items-center justify-center">
                                        {project.image_url ? (
                                            <>
                                                <div className="absolute inset-0 opacity-40">
                                                    <img src={project.image_url} alt="" className="object-cover w-full h-full blur-xl scale-110" />
                                                </div>
                                                <img src={project.image_url} alt={project.title} className="relative z-10 object-contain w-full h-full p-6 group-hover:scale-105 transition-transform duration-700 ease-in-out drop-shadow-2xl" />
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center text-slate-300">
                                                <Code className="h-20 w-20 opacity-50" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Metin İçeriği */}
                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center space-x-2 text-sm text-brand-500 font-semibold mb-3">
                                            <FolderOpen className="h-4 w-4" />
                                            <span>Açık Kaynak</span>
                                        </div>

                                        <h3 className="text-2xl font-heading font-bold text-slate-900 mb-4 tracking-tight leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
                                            <Link href={`/projects/${project.slug}`}>
                                                <span className="absolute inset-0 z-10" aria-hidden="true"></span>
                                                {project.title}
                                            </Link>
                                        </h3>

                                        <div className="flex items-start text-slate-500 text-sm mb-6">
                                            <User className="h-5 w-5 mr-2 flex-shrink-0 text-brand-400 mt-0.5" />
                                            <span className="line-clamp-1" title={project.developer_names}>{project.developer_names}</span>
                                        </div>

                                        {/* Alt Kısım: Butonlar */}
                                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between relative z-20">
                                            <Link 
                                                href={`/projects/${project.slug}`}
                                                className="text-brand-600 font-bold text-sm hover:text-brand-700 transition-colors"
                                            >
                                                Detayları İncele &rarr;
                                            </Link>

                                            {project.project_url && (
                                                <a 
                                                    href={project.project_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all"
                                                    title="Projeye / GitHub'a Git"
                                                >
                                                    <ExternalLink className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
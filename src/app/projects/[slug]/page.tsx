import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FolderOpen, User, CalendarIcon, ArrowLeft, ExternalLink } from 'lucide-react'
import ShareButton from '@/components/ShareButton'

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !project) {
        notFound();
    }

    const createdDate = new Date(project.created_at);

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Geri Dön Butonu */}
                <Link 
                    href="/projects" 
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Projelere Dön
                </Link>

                {/* Ana İçerik Kartı */}
                <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    
                    <div className="h-[28rem] sm:h-[36rem] w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
                        {project.image_url ? (
                            <>
                                <div className="absolute inset-0 opacity-40">
                                    <img 
                                        src={project.image_url} 
                                        alt="" 
                                        className="object-cover w-full h-full blur-2xl scale-125" 
                                    />
                                </div>
                                <img 
                                    src={project.image_url} 
                                    alt={project.title} 
                                    className="relative z-10 object-contain w-full h-full p-4 sm:p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                                />
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-brand-300">
                                <FolderOpen className="h-32 w-32 opacity-20" />
                            </div>
                        )}
                        
                        {/* Kategori Rozeti */}
                        <div className="absolute top-6 right-6 z-10">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md bg-slate-900/90 text-white">
                                {project.category}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        {/* Başlık ve Paylaş Butonu */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight flex-1">
                                {project.title}
                            </h1>
                            
                            <div className="flex-shrink-0 mt-1 sm:mt-0">
                                <ShareButton title={project.title} />
                            </div>
                        </div>

                        {/* Alt Bilgi Barı (Geliştiriciler, Tarih, Kategori) */}
                        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                            <div className="flex items-center text-slate-600">
                                <User className="w-5 h-5 mr-2 text-brand-500" />
                                <span className="font-medium">{project.developer_names}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <FolderOpen className="w-5 h-5 mr-2 text-brand-500" />
                                <span className="font-medium">{project.category}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <CalendarIcon className="w-5 h-5 mr-2 text-brand-500" />
                                <span className="font-medium">{createdDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* Zengin Metin Açıklaması (React Quill Çıktısı) */}
                        <div className="prose prose-slate prose-lg max-w-none font-montserrat prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-img:rounded-xl prose-img:shadow-sm">
                            <div dangerouslySetInnerHTML={{ __html: project.description || '<p>Bu proje için henüz bir açıklama girilmemiş.</p>' }} />
                        </div>

                        {/* Proje / GitHub Link Butonu */}
                        {project.project_url && (
                            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                                <a 
                                    href={project.project_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-brand-600 hover:bg-brand-500 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto group"
                                >
                                    Projeyi İncele <ExternalLink className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </a>
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </div>
    )
}
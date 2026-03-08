import { createClient } from '@/utils/supabase/server'
import { BookOpen, User, FileText, Megaphone, Calendar } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Blog ve Duyurular - YBS Topluluğu',
    description: 'Makaleler, teknoloji haberleri ve topluluk duyuruları',
}

// React Quill'den gelen HTML etiketlerini temizleyip sadece düz metni gösteren yardımcı fonksiyon
const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
};

// Kategori (type) değerine göre renk ve ikon döndüren yardımcı fonksiyon
const getTypeConfig = (typeNum: number) => {
    if (typeNum === 1) return { name: 'Makale', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <BookOpen className="w-3.5 h-3.5 mr-1.5" /> };
    if (typeNum === 2) return { name: 'Duyuru', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Megaphone className="w-3.5 h-3.5 mr-1.5" /> };
    return { name: 'Blog', color: 'bg-brand-50 text-brand-700 border-brand-200', icon: <FileText className="w-3.5 h-3.5 mr-1.5" /> };
};

// Next.js 15: Filtreleme işlemini URL üzerinden (searchParams) yapıyoruz ki SEO'ya uyumlu olsun
export default async function PublicBlogsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const supabase = await createClient()
    const { type: typeFilter } = await searchParams;

    // Veritabanı Sorgusu
    let query = supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false });

    // Eğer URL'de bir type filtresi varsa (Örn: ?type=1) ve "all" değilse sorguyu filtrele
    if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', parseInt(typeFilter, 10));
    }

    const { data: blogs, error } = await query;

    if (error) {
        console.error('Blogs fetch error:', error)
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* BAŞLIK */}
                <div className="text-center mb-12">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">İçeriklerimiz</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Blog ve Duyurular</h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-montserrat leading-relaxed">
                        Topluluğumuzdan haberdar olun, bilim, teknoloji ve yönetim dünyasından yazılarımızı okuyun.
                    </p>
                </div>

                {/* FİLTRELEME BUTONLARI (URL tabanlı çalışır) */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    <Link 
                        href="/blogs?type=all" 
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${!typeFilter || typeFilter === 'all' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-brand-600'}`}
                    >
                        Tümü
                    </Link>
                    <Link 
                        href="/blogs?type=0" 
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center ${typeFilter === '0' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-brand-600'}`}
                    >
                        Blog Yazıları
                    </Link>
                    <Link 
                        href="/blogs?type=1" 
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center ${typeFilter === '1' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-purple-600'}`}
                    >
                        Akademik Makaleler
                    </Link>
                    <Link 
                        href="/blogs?type=2" 
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center ${typeFilter === '2' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-amber-600'}`}
                    >
                        Duyurular
                    </Link>
                </div>

                {/* BLOG KARTLARI GRİDİ */}
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {(!blogs || blogs.length === 0) ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-slate-300">
                            <FileText className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Bu Kategoride Yazı Yok</h3>
                            <p className="text-slate-500 max-w-sm">Şu anda bu kriterlere uygun yayınlanmış bir içerik bulunmuyor. Lütfen daha sonra tekrar kontrol edin.</p>
                        </div>
                    ) : (
                        blogs.map((blog) => {
                            const typeConfig = getTypeConfig(blog.type);

                            return (
                                <article key={blog.id} className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group block">
                                    
                                    {/* SİNEMATİK GÖRSEL ALANI (Blur Arka Plan + Tam Boy Afiş) */}
                                    <div className="h-64 sm:h-72 w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
                                        {blog.cover_image_url ? (
                                            <>
                                                {/* Bulanık Arka Plan */}
                                                <div className="absolute inset-0 opacity-50">
                                                    <img src={blog.cover_image_url} alt="" className="object-cover w-full h-full blur-xl scale-125 group-hover:scale-150 transition-transform duration-700" />
                                                </div>
                                                {/* Kırpılmayan Ana Görsel */}
                                                <img src={blog.cover_image_url} alt={blog.title} className="relative z-10 object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl" />
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                                                <BookOpen className="h-20 w-20 opacity-40" />
                                            </div>
                                        )}
                                        
                                        {/* Dinamik Kategori Rozeti */}
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md border ${typeConfig.color}`}>
                                                {typeConfig.icon}
                                                {typeConfig.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* METİN İÇERİĞİ */}
                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium mb-3">
                                            <Calendar className="w-4 h-4 text-brand-400" />
                                            <time dateTime={blog.published_at}>
                                                {new Date(blog.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </time>
                                        </div>

                                        <h3 className="text-2xl font-heading font-bold text-slate-900 mb-4 tracking-tight leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
                                            {/* SLUG URL YÖNLENDİRMESİ BURADA */}
                                            <Link href={`/blogs/${blog.slug}`} className="before:absolute before:inset-0 before:z-20">
                                                {blog.title}
                                            </Link>
                                        </h3>

                                        {/* React Quill HTML kodlarını gizleyip sadece düz metin (özet) gösteriyoruz */}
                                        <p className="text-slate-600 text-sm flex-1 leading-relaxed line-clamp-3 mb-6 font-montserrat">
                                            {stripHtml(blog.content)}
                                        </p>

                                        {/* Yazar Bilgisi */}
                                        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center relative z-30">
                                            <div className="flex items-center gap-x-3">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-full flex items-center justify-center text-brand-600 border border-brand-200/50 shadow-inner">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="text-sm leading-tight">
                                                    <p className="font-bold text-slate-900">
                                                        {/*@ts-ignore*/}
                                                        {blog.profiles?.first_name || 'SAU YBS'} {/*@ts-ignore*/}{blog.profiles?.last_name || 'Topluluğu'}
                                                    </p>
                                                    <p className="text-brand-500 font-medium tracking-wide text-[10px] uppercase mt-0.5">Yazar</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
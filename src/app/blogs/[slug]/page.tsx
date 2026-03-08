import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, BookOpen, Megaphone, FileText, Share2 } from 'lucide-react'
export const dynamic = 'force-dynamic';
import ShareButton from '@/components/ShareButton'

// Kategori (type) değerine göre renk ve ikon döndüren yardımcı fonksiyon
const getTypeConfig = (typeNum: number) => {
    if (typeNum === 1) return { name: 'Makale', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <BookOpen className="w-4 h-4 mr-1.5" /> };
    if (typeNum === 2) return { name: 'Duyuru', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Megaphone className="w-4 h-4 mr-1.5" /> };
    return { name: 'Blog', color: 'bg-brand-50 text-brand-700 border-brand-200', icon: <FileText className="w-4 h-4 mr-1.5" /> };
};

// Next.js 15: params artık bir Promise olarak geliyor
export default async function BlogReadingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    // URL'deki slug ile veritabanındaki blog yazısını çekiyoruz
    const { data: blog, error } = await supabase
        .from('blogs')
        .select('*, profiles(first_name, last_name)') // Yazar ismini de çekmek için (Tablo yapına göre ayarlayabilirsin)
        .eq('slug', slug)
        .single(); 

    // Eğer hata varsa 404 yerine ekrana hatanın ne olduğunu basıyoruz
    if (error || !blog) {
        return (
            <div className="max-w-3xl mx-auto mt-32 p-8 bg-red-50 border border-red-200 rounded-2xl text-red-900 shadow-sm">
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
                    <span className="text-3xl">⚠️</span> Blog Yükleme Hatası
                </h2>
                <div className="space-y-3 bg-white p-6 rounded-xl border border-red-100 font-mono text-sm break-all">
                    <p><strong className="text-red-700">Aranan Slug:</strong> {slug}</p>
                    <p><strong className="text-red-700">Hata Mesajı:</strong> {error?.message || 'Veri bulunamadı (Büyük ihtimalle bu Slug ile eşleşen bir kayıt yok).'}</p>
                    <p><strong className="text-red-700">Hata Detayı:</strong> {error?.details || 'Detay yok'}</p>
                    <p><strong className="text-red-700">Hata İpucu:</strong> {error?.hint || 'İpucu yok'}</p>
                </div>
            </div>
        )
    }

    const typeConfig = getTypeConfig(blog.type);

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Geri Dön Butonu */}
                <Link 
                    href="/blogs" 
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Tüm Yazılara Dön
                </Link>

                {/* Ana İçerik Kartı */}
                <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    
                    {/* SİNEMATİK KAPAK GÖRSELİ */}
                    <div className="h-[24rem] sm:h-[32rem] w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
                        {blog.cover_image_url ? (
                            <>
                                {/* Arka plan bulanık efekti */}
                                <div className="absolute inset-0 opacity-40">
                                    <img 
                                        src={blog.cover_image_url} 
                                        alt="" 
                                        className="object-cover w-full h-full blur-2xl scale-125" 
                                    />
                                </div>
                                {/* Ana afiş (Kırpılmadan tam boy) */}
                                <img 
                                    src={blog.cover_image_url} 
                                    alt={blog.title} 
                                    className="relative z-10 object-contain w-full h-full p-4 sm:p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                                />
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                                <BookOpen className="h-32 w-32 opacity-20" />
                            </div>
                        )}
                        
                        {/* Kategori Rozeti */}
                        <div className="absolute top-6 left-6 z-20">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${typeConfig.color}`}>
                                {typeConfig.icon}
                                {typeConfig.name}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12 sm:pt-10">
                        {/* BAŞLIK VE METADATA */}
                        <div className="mb-10 pb-10 border-b border-slate-100">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.15]">
                                {blog.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-between gap-6">
                                {/* Yazar ve Tarih Bilgisi */}
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-full flex items-center justify-center text-brand-600 border border-brand-200/50 shadow-inner">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div className="text-sm leading-tight">
                                            <p className="font-bold text-slate-900 text-base">
                                                {/*@ts-ignore*/}
                                                {blog.profiles?.first_name || 'SAU YBS'} {/*@ts-ignore*/}{blog.profiles?.last_name || 'Topluluğu'}
                                            </p>
                                            <p className="text-brand-500 font-medium tracking-wide text-xs uppercase mt-0.5">Yazar</p>
                                        </div>
                                    </div>

                                    <div className="hidden sm:block h-8 w-px bg-slate-200"></div>

                                    <div className="flex items-center text-slate-500">
                                        <Calendar className="w-5 h-5 mr-2 text-slate-400" />
                                        <time dateTime={blog.published_at} className="font-medium">
                                            {new Date(blog.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </time>
                                    </div>
                                </div>

                                {/* Şık Bir Paylaş Butonu (Bonus) */}
                                <ShareButton title={blog.title} />
                            </div>
                        </div>

                        {/* ZENGİN METİN İÇERİĞİ (React Quill HTML'i Buraya Basılır) */}
                        <div className="prose prose-slate prose-lg md:prose-xl max-w-none font-montserrat prose-headings:font-heading prose-headings:font-bold prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-img:rounded-2xl prose-img:shadow-md">
                            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </div>

                    </div>
                </article>
            </div>
        </div>
    )
}
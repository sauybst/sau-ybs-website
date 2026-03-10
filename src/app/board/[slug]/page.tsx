import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Shield, Calendar, Linkedin, Info } from 'lucide-react'
import ShareButton from '@/components/ShareButton'
import { Metadata, ResolvingMetadata } from 'next'

// Sayfanın aldığı parametreler (Örn: slug veya id)
type Props = {
    params: { slug: string }
}

// NEXT.JS DİNAMİK META OLUŞTURUCU (Sayfa yüklenmeden önce çalışır)
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const supabase = await createClient()
    
    // Veritabanından sadece SEO için gerekli kısımları çek
    const { data: event } = await supabase
        .from('board_members')
        .select('title, description, image_url') // image_url sende cover_image falan olabilir, kendi sütun adını yaz
        .eq('slug', params.slug)
        .single()

    // Eğer etkinlik bulunamazsa varsayılan layout.tsx'teki metalara geri dön (Fallback)
    if (!event) return {} 

    // Zengin metinden (Rich Text) HTML etiketlerini temizleyip 160 karaktere kırpıyoruz (SEO için ideal uzunluk)
    const cleanDescription = event.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'

    return {
        title: event.title,
        description: cleanDescription,
        openGraph: {
            title: event.title,
            description: cleanDescription,
            images: [
                {
                    // Etkinliğin kendi fotoğrafı varsa onu, yoksa sitenin varsayılan logosunu koy
                    url: event.image_url || 'https://sauybst.com/og-default.jpg',
                    width: 1200,
                    height: 630,
                    alt: event.title,
                }
            ],
            type: 'article', // Bu bir yazı/etkinlik olduğu için website yerine article diyoruz
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description: cleanDescription,
            images: [event.image_url || 'https://sauybst.com/og-default.jpg'],
        }
    }
}

export const dynamic = 'force-dynamic';

export default async function BoardMemberDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    // URL'deki slug ile veritabanındaki yönetim kurulu üyesini çekiyoruz
    const { data: member, error } = await supabase
        .from('board_members')
        .select('*')
        .eq('slug', slug)
        .single(); 

    // Eğer hata varsa veya üye bulunamazsa 404 yerine özel hata mesajı
    if (error || !member) {
        return (
            <div className="max-w-3xl mx-auto mt-32 p-8 bg-red-50 border border-red-200 rounded-2xl text-red-900 shadow-sm">
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
                    <span className="text-3xl">⚠️</span> Profil Yükleme Hatası
                </h2>
                <div className="space-y-3 bg-white p-6 rounded-xl border border-red-100 font-mono text-sm break-all">
                    <p><strong className="text-red-700">Aranan Slug:</strong> {slug}</p>
                    <p><strong className="text-red-700">Hata Mesajı:</strong> {error?.message || 'Veri bulunamadı (Bu profile ait bir kayıt yok).'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Geri Dön Butonu */}
                <Link 
                    href="/board" 
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Yönetim Kuruluna Dön
                </Link>

                {/* Ana Profil Kartı */}
                <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    
                    {/* SİNEMATİK PROFİL GÖRSELİ */}
                    <div className="h-[24rem] sm:h-[32rem] w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
                        {member.image_url ? (
                            <>
                                {/* Arka plan bulanık efekti */}
                                <div className="absolute inset-0 opacity-40">
                                    <img 
                                        src={member.image_url} 
                                        alt="" 
                                        className="object-cover w-full h-full blur-2xl scale-125" 
                                    />
                                </div>
                                {/* Yuvarlak Çerçeveli Profil Fotoğrafı (Blogdan farklı olarak yuvarlak tasarım) */}
                                <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-slate-100">
                                    <img 
                                        src={member.image_url} 
                                        alt={member.full_name} 
                                        className="object-cover w-full h-full" 
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-brand-300">
                                <User className="h-32 w-32 opacity-20" />
                            </div>
                        )}
                        
                        {/* Aktiflik Rozeti */}
                        <div className="absolute top-6 left-6 z-20">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${member.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-800/90 text-white border-slate-700'}`}>
                                {member.is_active ? 'Aktif Üye' : 'Geçmiş Dönem'}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12 sm:pt-10">
                        {/* BAŞLIK VE METADATA */}
                        <div className="mb-10 pb-10 border-b border-slate-100">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.15] flex-1">
                                    {member.full_name}
                                </h1>
                                
                                {/* Şık Paylaş Butonu */}
                                <div className="flex-shrink-0">
                                    <ShareButton title={`${member.full_name} - ${member.board_role}`} />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-6">
                                {/* Profil Detayları */}
                                <div className="flex flex-wrap items-center gap-6">
                                    {/* Görev */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-full flex items-center justify-center text-brand-600 border border-brand-200/50 shadow-inner">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div className="text-sm leading-tight">
                                            <p className="font-bold text-slate-900 text-base">
                                                {member.board_role}
                                            </p>
                                            <p className="text-brand-500 font-medium tracking-wide text-xs uppercase mt-0.5">Görev</p>
                                        </div>
                                    </div>

                                    <div className="hidden sm:block h-8 w-px bg-slate-200"></div>

                                    {/* Dönem */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 flex-shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 shadow-inner">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="text-sm leading-tight">
                                            <p className="font-bold text-slate-900 text-base">
                                                {member.term_year}
                                            </p>
                                            <p className="text-slate-500 font-medium tracking-wide text-xs uppercase mt-0.5">Dönemi</p>
                                        </div>
                                    </div>
                                </div>

                                {/* LinkedIn Butonu (Eğer Varsa) */}
                                {member.linkedin_url && (
                                    <a 
                                        href={member.linkedin_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                                    >
                                        <Linkedin className="w-4 h-4 mr-2" /> LinkedIn'de Gör
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* ZENGİN METİN İÇERİĞİ (Notlar / Açıklama) */}
                        <div className="prose prose-slate prose-lg max-w-none font-montserrat prose-headings:font-heading prose-headings:font-bold prose-a:text-brand-600 hover:prose-a:text-brand-700">
                            {member.description ? (
                                <div dangerouslySetInnerHTML={{ __html: member.description }} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Info className="h-10 w-10 text-slate-400 mb-3" />
                                    <p className="text-slate-500 font-medium">Bu üye için henüz bir açıklama veya not eklenmemiş.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </article>
            </div>
        </div>
    )
}
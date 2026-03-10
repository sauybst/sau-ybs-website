import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ArrowLeft, ExternalLink, Briefcase, Building2, Calendar, Laptop, CheckCircle2, XCircle } from 'lucide-react'
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
        .from('job_posting')
        .select('company_name, description, company_logo_url') // image_url sende cover_image falan olabilir, kendi sütun adını yaz
        .eq('slug', params.slug)
        .single()

    // Eğer etkinlik bulunamazsa varsayılan layout.tsx'teki metalara geri dön (Fallback)
    if (!event) return {} 

    // Zengin metinden (Rich Text) HTML etiketlerini temizleyip 160 karaktere kırpıyoruz (SEO için ideal uzunluk)
    const cleanDescription = event.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'

    return {
        title: event.company_name,
        description: cleanDescription,
        openGraph: {
            title: event.company_name,
            description: cleanDescription,
            images: [
                {
                    // Etkinliğin kendi fotoğrafı varsa onu, yoksa sitenin varsayılan logosunu koy
                    url: event.company_logo_url || 'https://sauybst.com/og-default.jpg',
                    width: 1200,
                    height: 630,
                    alt: event.company_name,
                }
            ],
            type: 'article', // Bu bir yazı/etkinlik olduğu için website yerine article diyoruz
        },
        twitter: {
            card: 'summary_large_image',
            title: event.company_name,
            description: cleanDescription,
            images: [event.company_logo_url || 'https://sauybst.com/og-default.jpg'],
        }
    }
}

export const dynamic = 'force-dynamic';

const workModelMap: Record<number, string> = {
    0: 'Yüzyüze',
    1: 'Uzaktan',
    2: 'Hibrit',
    3: 'Belirtilmemiş'
};

const getWorkModelIcon = (modelId: number) => {
    if (modelId === 1) return <Laptop className="w-4 h-4 mr-2" />;
    if (modelId === 2) return <MapPin className="w-4 h-4 mr-2" />;
    return <Building2 className="w-4 h-4 mr-2" />;
};

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: job, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !job) {
        notFound();
    }

    const isExpired = job.deadline_date ? new Date(job.deadline_date) < new Date() : false;
    const isActiveStatus = job.is_active && !isExpired;

    return (
        <div className="bg-[#f8fafc] min-h-screen pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Geri Dön Butonu */}
                <Link 
                    href="/jobs" 
                    className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    İlanlara Dön
                </Link>

                <article className={`bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-200/60 p-2 sm:p-3 transition-all ${!isActiveStatus ? 'opacity-90 grayscale-[15%]' : ''}`}>
                    
                    {/* SİNEMATİK KAPAK GÖRSELİ (Mor alan yerine sisteme yüklenen görsel geldi) */}
                    <div className="h-64 sm:h-80 w-full rounded-[1.5rem] sm:rounded-[2.5rem] relative bg-slate-950 overflow-hidden flex items-center justify-center">
                        {job.company_logo_url ? (
                            <>
                                {/* Arka plan bulanık efekti */}
                                <div className="absolute inset-0 opacity-40">
                                    <img 
                                        src={job.company_logo_url} 
                                        alt="" 
                                        className="object-cover w-full h-full blur-2xl scale-125" 
                                    />
                                </div>
                                {/* Ana Afiş (Kırpılmadan ortada durur) */}
                                <img 
                                    src={job.company_logo_url} 
                                    alt={job.company_name} 
                                    className="relative z-10 object-contain w-full h-full p-4 sm:p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                                />
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                <Briefcase className="w-20 h-20 text-slate-700 opacity-50" />
                            </div>
                        )}
                        
                        {/* Aktiflik Rozeti */}
                        <div className="absolute top-6 right-6 z-20">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${isActiveStatus ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-slate-800/90 text-slate-300 border-slate-600'}`}>
                                {isActiveStatus ? 'Açık İlan' : 'Süresi Doldu'}
                            </span>
                        </div>
                    </div>

                    <div className="px-5 sm:px-10 pt-8 pb-8 sm:pb-12 relative z-10">
                        
                        {/* Başlık, Şirket Adı ve Paylaş Butonu */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
                                    {job.position_name}
                                </h1>
                                <h2 className="text-xl sm:text-2xl font-bold text-brand-600 flex items-center">
                                    <Briefcase className="w-6 h-6 mr-2.5 opacity-80" />
                                    {job.company_name}
                                </h2>
                            </div>
                            
                            <div className="flex-shrink-0 mt-2 sm:mt-0">
                                <ShareButton title={`${job.company_name} - ${job.position_name} İlanı`} />
                            </div>
                        </div>

                        {/* Rozetler (Tags) */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
                            {isActiveStatus ? (
                                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Açık İlan
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Başvurular Kapandı
                                </span>
                            )}

                            <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                                {getWorkModelIcon(job.work_model)}
                                {workModelMap[job.work_model]}
                            </div>

                            <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                {job.deadline_date ? new Date(job.deadline_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belirtilmedi'}
                            </div>
                        </div>

                        <div className="w-full h-px border-t border-dashed border-slate-200 mb-10"></div>

                        {/* İlan Detayları */}
                        <div className="prose prose-slate md:prose-lg max-w-none font-montserrat prose-headings:font-heading prose-headings:font-bold prose-h2:text-2xl prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-li:marker:text-brand-500 prose-p:leading-relaxed prose-p:text-slate-600">
                            <div dangerouslySetInnerHTML={{ __html: job.description || '<p>Bu ilan için detaylı bir açıklama girilmemiş.</p>' }} />
                        </div>

                        {/* Başvuru ve Tarih Kutusu */}
                        <div className="mt-16 p-6 sm:p-8 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            
                            <div className="text-slate-500 text-sm font-medium text-center sm:text-left">
                                <div>Yayınlanma Tarihi</div>
                                <div className="text-slate-700 font-bold mt-0.5">
                                    {new Date(job.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>

                            {isActiveStatus ? (
                                job.application_link ? (
                                    <a 
                                        href={job.application_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto ring-4 ring-brand-500/10"
                                    >
                                        İlana Başvur <ExternalLink className="ml-2 w-5 h-5" />
                                    </a>
                                ) : (
                                    <div className="px-6 py-4 text-brand-700 bg-brand-50 border border-brand-100 rounded-xl font-bold text-sm text-center w-full sm:w-auto">
                                        Platform dışı başvuru linki bulunmuyor.
                                    </div>
                                )
                            ) : (
                                <div className="px-8 py-4 text-base font-bold rounded-xl text-slate-500 bg-slate-200 border border-slate-300 text-center w-full sm:w-auto cursor-not-allowed">
                                    Başvurular Kapandı
                                </div>
                            )}
                        </div>

                    </div>
                </article>
            </div>
        </div>
    )
}
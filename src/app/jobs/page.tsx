import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Briefcase, Building2, MapPin, ExternalLink, Calendar, Clock, Laptop } from 'lucide-react'

export const metadata = {
    title: 'Staj ve İş İlanları - YBS Topluluğu',
    description: 'Sakarya Üniversitesi YBS öğrencileri için güncel staj, yarı zamanlı ve tam zamanlı iş fırsatları.',
}

const workModelMap: Record<number, string> = {
    0: 'Yüzyüze',
    1: 'Uzaktan',
    2: 'Hibrit',
    3: 'Belirtilmemiş'
};

export default async function PublicJobsPage(props: any) {
    const searchParams = await props.searchParams;
    const currentFilter = searchParams?.filter || 'active';

    const supabase = await createClient()

    // Veritabanından ilanları en yeniden eskiye doğru çekiyoruz
    const { data: jobs, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

    // İlanları filtreleme (Aktif / Süresi Dolmuş)
    const filteredJobs = jobs?.filter((job) => {
        // Eğer deadline (son tarih) varsa ve o tarih geçmişse inaktiftir, yoksa aktiftir.
        // Veya manuel olarak is_active false yapılmışsa inaktiftir.
        const isExpired = job.deadline_date ? new Date(job.deadline_date) < new Date() : false;
        const isCurrentlyActive = job.is_active && !isExpired;

        return currentFilter === 'active' ? isCurrentlyActive : !isCurrentlyActive;
    });

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Üst Başlık Bölümü */}
                <div className="text-center mb-12">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Kariyer Fırsatları</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Staj ve İş İlanları</h1>
                    <p className="mt-4 max-w-2xl text-medium text-slate-600 mx-auto font-montserrat">
                        YBS öğrencilerine özel derlenmiş staj, part-time ve tam zamanlı teknoloji/analiz rolleri. Kariyerine buradan başla!
                    </p>

                    {/* Filtreleme Butonları */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <Link 
                            href="?filter=active" 
                            scroll={false}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${currentFilter === 'active' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            Aktif İlanlar
                        </Link>
                        <Link 
                            href="?filter=past" 
                            scroll={false}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${currentFilter === 'past' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            Süresi Dolanlar
                        </Link>
                    </div>
                </div>

                {/* İlan Kartları Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {(!filteredJobs || filteredJobs.length === 0) ? (
                        <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                            Şu an için bu kategoride listelenmiş bir iş/staj ilanı bulunmamaktadır.
                        </p>
                    ) : (
                        filteredJobs.map((job) => {
                            const isExpired = job.deadline_date ? new Date(job.deadline_date) < new Date() : false;
                            const isActiveStatus = job.is_active && !isExpired;

                            // Çalışma modeline göre ikon belirleme
                            const getWorkModelIcon = (modelId: number) => {
                                if (modelId === 1) return <Laptop className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />; // Uzaktan
                                if (modelId === 2) return <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />; // Hibrit
                                return <Building2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />; // Yüzyüze veya Belirtilmemiş
                            };

                            return (
                                <div key={job.id} className={`relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group ${!isActiveStatus ? 'opacity-75 grayscale-[30%]' : ''}`}>
                                    
                                    {/* Durum Rozeti */}
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${isActiveStatus ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                            {isActiveStatus ? 'Açık İlan' : 'Süresi Doldu'}
                                        </span>
                                    </div>

                                    {/* Üst Kısım: Şirket Logosu ve Adı */}
                                    <div className="p-6 pb-4 flex items-center gap-4 border-b border-slate-50 bg-slate-50/50">
                                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {job.company_logo_url ? (
                                                <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Briefcase className="w-8 h-8 text-brand-200" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-heading font-bold text-slate-900 leading-tight line-clamp-1" title={job.company_name}>
                                                {job.company_name}
                                            </h3>
                                            <div className="flex items-center text-sm text-slate-500 mt-1 font-medium">
                                                {getWorkModelIcon(job.work_model)}
                                                {workModelMap[job.work_model]}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alt Kısım: Pozisyon ve Detaylar */}
                                    <div className="p-6 flex flex-col flex-1">
                                        
                                        <h4 className="text-2xl font-heading font-bold text-brand-600 mb-4 tracking-tight leading-tight line-clamp-2">
                                            {/* Not: Henüz [id]/page.tsx detay sayfasını yapmadığımız için href'i '#' olarak bıraktım, yapınca güncelleyeceğiz */}
                                            <Link href={`/jobs/${job.slug}`}>
                                                <span className="absolute inset-0 z-10" aria-hidden="true"></span>
                                                {job.position_name}
                                            </Link>
                                        </h4>

                                        <p className="text-slate-600 text-sm mb-6 line-clamp-3 font-montserrat">
                                            {/* Zengin metinden HTML etiketlerini temizleyerek özet gösterme */}
                                            {job.description
                                                .replace(/<[^>]*>?/gm, '') 
                                                .replace(/&nbsp;/g, ' ')   
                                                .replace(/&amp;/g, '&')    
                                                .replace(/&quot;/g, '"')   
                                                .replace(/&#39;/g, "'")    
                                                .replace(/&lt;/g, '<')     
                                                .replace(/&gt;/g, '>')     
                                            }
                                        </p>

                                        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
                                            
                                            {/* Son Başvuru Tarihi */}
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                    Son Başvuru:
                                                </span>
                                                <span className="font-bold text-slate-700">
                                                    {job.deadline_date ? new Date(job.deadline_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belirtilmedi'}
                                                </span>
                                            </div>

                                            {/* Başvuru Butonu */}
                                            {job.application_link && isActiveStatus ? (
                                                <a 
                                                    href={job.application_link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="relative z-20 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all w-full group-hover:-translate-y-0.5"
                                                >
                                                    Hemen Başvur <ExternalLink className="ml-2 -mr-1 h-4 w-4" />
                                                </a>
                                            ) : (
                                                <button disabled className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-400 bg-slate-100 cursor-not-allowed w-full">
                                                    {isActiveStatus ? 'Sistem İçi Başvuru Yok' : 'Başvurular Kapandı'}
                                                </button>
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
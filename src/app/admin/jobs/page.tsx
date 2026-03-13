import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Eye, Edit, Briefcase, Calendar } from 'lucide-react'
import { deleteJobPosting } from '@/actions/jobs'
import DeleteConfirmButton from '@/components/DeleteConfirmButton'
import { workModelLabels, workModelIcons } from '@/data/job-types'
export const runtime = 'edge';

export default async function JobsAdminPage() {
    const supabase = await createClient()

    // İlanları en yeniden eskiye sıralayarak çekiyoruz
    const { data: jobs, error } = await supabase
        .from('job_postings')
        .select('id, slug, company_name, company_logo_url, position_name, work_model, deadline_date, is_active')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching job postings:', error)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            
            {/* Üst Header ve Aksiyon Bölümü */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                        Staj ve İş İlanı Yönetimi
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Sistemdeki tüm kariyer fırsatlarını görüntüleyin, düzenleyin veya silin.</p>
                </div>
                <Link 
                    href="/admin/jobs/create" 
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Yeni İlan Ekle
                </Link>
            </div>

            {/* İlan Kartları Listesi */}
            <div className="flex flex-col gap-4">
                {jobs?.map((job) => {
                    // İlanın aktif olup olmadığını kontrol ediyoruz
                    const isExpired = job.deadline_date ? new Date(job.deadline_date) < new Date() : false;
                    const isActiveStatus = job.is_active && !isExpired;

                    const WorkModelIcon = workModelIcons[job.work_model] || workModelIcons[0];

                    return (
                        <div key={job.id} className={`bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 sm:items-center justify-between group ${!isActiveStatus ? 'bg-slate-50' : ''}`}>
                            
                            {/* SOL KISIM: Görsel ve Bilgiler */}
                            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                {/* Şirket Logosu (Kare/Yuvarlatılmış Köşe) */}
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border flex-shrink-0 flex items-center justify-center overflow-hidden relative ${!isActiveStatus ? 'border-slate-200 grayscale opacity-75' : 'border-slate-100'}`}>
                                    {job.company_logo_url ? (
                                        <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Briefcase className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>

                                {/* Metin İçeriği */}
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        {/* Dinamik Durum Rozeti */}
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActiveStatus ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {isActiveStatus ? 'Aktif' : 'Süresi Doldu'}
                                        </span>
                                        <h3 className={`text-lg font-bold truncate ${isActiveStatus ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {job.position_name}
                                        </h3>
                                    </div>
                                    
                                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium mt-1 ${isActiveStatus ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <div className="flex items-center text-brand-600 font-bold">
                                            <Briefcase className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                            <span className="truncate max-w-[150px] sm:max-w-xs">{job.company_name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <WorkModelIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
                                            <span>{workModelLabels[job.work_model]}</span>
                                        </div>
                                        {job.deadline_date && (
                                            <div className="flex items-center">
                                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
                                                <time dateTime={job.deadline_date}>
                                                    Son: {new Date(job.deadline_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </time>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SAĞ KISIM: Aksiyon Butonları */}
                            <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                {/* Görüntüle Butonu (Canlı Siteye Gider) */}
                                <Link 
                                    href={`/jobs/${job.slug}`} 
                                    target="_blank"
                                    className="p-2.5 text-slate-400 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-colors tooltip-trigger"
                                    title="Sitede Görüntüle"
                                >
                                    <Eye className="w-5 h-5" />
                                </Link>

                                {/* Düzenle Butonu */}
                                <Link 
                                    href={`/admin/jobs/edit/${job.id}`} 
                                    className="p-2.5 text-slate-400 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>

                                {/* Silme Formu ve Butonu */}
                                <DeleteConfirmButton
                                    id={job.id}
                                    onDelete={deleteJobPosting}
                                    itemName={`${job.company_name} - ${job.position_name}`}
                                />
                            </div>

                        </div>
                    )
                })}

                {/* Boş Durum (Empty State) Görünümü */}
                {(!jobs || jobs.length === 0) && (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz İlan Yok</h3>
                        <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
                            Sistemde kayıtlı herhangi bir staj veya iş ilanı bulunamadı. Yeni bir ilan ekleyerek öğrencilere fırsatlar sunmaya başlayabilirsiniz.
                        </p>
                        <Link 
                            href="/admin/jobs/create" 
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            İlk İlanı Ekle
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
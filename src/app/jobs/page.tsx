import { createClient } from '@/utils/supabase/server'
import { Briefcase, MapPin, Building2, ExternalLink } from 'lucide-react'

export const metadata = {
    title: 'Staj ve İş İlanları - YBS Topluluğu',
    description: 'Sakarya Üniversitesi YBS öğrencilerine özel kariyer fırsatları',
}

export default async function PublicJobsPage() {
    const supabase = await createClient()

    const { data: jobs, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    return (
        <div className="bg-gray-50 min-h-screen py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Kariyer Fırsatları</h1>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        Topluluk üyelerimize ve YBS öğrencilerine özel staj, yarı zamanlı ve tam zamanlı iş ilanları.
                    </p>
                </div>

                <div className="space-y-6">
                    {(!jobs || jobs.length === 0) ? (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">Şu an için aktif bir ilan bulunmamaktadır.</p>
                        </div>
                    ) : (
                        jobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    {/* Avatar / Logo */}
                                    <div className="flex items-start gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {job.company_logo_url ? (
                                                <img src={job.company_logo_url} alt={job.company_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Building2 className="h-8 w-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{job.position_name}</h2>
                                            <p className="text-lg font-medium text-indigo-600 mt-1">{job.company_name}</p>

                                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                                    <Briefcase className="h-4 w-4" />
                                                    {job.work_model}
                                                </span>
                                                {job.deadline_date && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-medium">
                                                        Son Başvuru: {new Date(job.deadline_date).toLocaleDateString('tr-TR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 md:pt-2">
                                        {job.application_link && (
                                            <a
                                                href={job.application_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all"
                                            >
                                                Başvur <ExternalLink className="ml-2 -mr-1 h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">İlan Detayları</h3>
                                    <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                                        {job.description}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

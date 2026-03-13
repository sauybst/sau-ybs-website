import { createClient } from '@/utils/supabase/server'
import { Activity, Users, Calendar, FileText, Plus, ArrowRight, Briefcase, ShieldAlert, Clock, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
export const runtime = 'edge';

/** Dashboard aktivite akışı için tip tanımı */
type DashboardActivity = {
    id: string
    title: string
    created_at: string
    type: string
    icon: LucideIcon
    color: string
    bgColor: string
}

/** Tarih formatlamak için yardımcı fonksiyon */
const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('tr-TR', options)
}

export default async function AdminDashboard() {
    const supabase = await createClient()

    // 1. Kullanıcı ve Rol
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role, accessible_modules, first_name').eq('id', user.id).single()
    const role = profile?.role || 'viewer'
    const modules: string[] = profile?.accessible_modules || []
    const firstName = profile?.first_name || 'Yönetici'

    /** Rol bazlı modül erişim kontrolü */
    const hasAccess = (module: string) =>
        role === 'super_admin' || role === 'viewer' || (role === 'editor' && modules.includes(module))

    // 2. Dinamik Selamlama (Türkiye Saati UTC+3'e göre)
    const hour = new Date(new Date().getTime() + 3 * 60 * 60 * 1000).getUTCHours()
    let greeting = 'İyi geceler'
    if (hour >= 6 && hour < 12) greeting = 'Günaydın'
    else if (hour >= 12 && hour < 18) greeting = 'İyi günler'
    else if (hour >= 18 && hour < 22) greeting = 'İyi akşamlar'

    // 3. İstatistikler — Paralel çalışır (performans)
    const [
        { count: eventsCount },
        { count: blogsCount },
        { count: usersCount },
        { count: projectsCount },
        { count: jobsCount },
    ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('job_postings').select('*', { count: 'exact', head: true }),
    ])

    // 4. Son Hareketlilik Akışı — Paralel sorgular
    const fetchEvents = async (): Promise<DashboardActivity[]> => {
        if (!hasAccess('events')) return []
        const { data } = await supabase.from('events').select('id, title, created_at').order('created_at', { ascending: false }).limit(2)
        return (data || []).map(e => ({ ...e, type: 'Etkinlik', icon: Calendar, color: 'text-brand-600', bgColor: 'bg-brand-50' }))
    }

    const fetchBlogs = async (): Promise<DashboardActivity[]> => {
        if (!hasAccess('blogs')) return []
        const { data } = await supabase.from('blogs').select('id, title, created_at').order('created_at', { ascending: false }).limit(2)
        return (data || []).map(b => ({ ...b, type: 'Blog', icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50' }))
    }

    const fetchJobs = async (): Promise<DashboardActivity[]> => {
        if (!hasAccess('jobs')) return []
        const { data } = await supabase.from('job_postings').select('id, position_name, created_at').order('created_at', { ascending: false }).limit(2)
        return (data || []).map(j => ({ id: j.id, title: j.position_name, created_at: j.created_at, type: 'İlan', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50' }))
    }

    const activityArrays = await Promise.all([fetchEvents(), fetchBlogs(), fetchJobs()])
    const activities: DashboardActivity[] = activityArrays.flat()

    // Tarihe göre en yenileri üste, son 4 işlem
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const recentActivities = activities.slice(0, 4)

    // İstatistik Kartları
    const allStats = [
        { id: 'events', name: 'Toplam Etkinlik', stat: eventsCount || 0, icon: Calendar, color: 'text-brand-600', bgColor: 'bg-brand-50', trend: 'Aktif takvim', adminOnly: false },
        { id: 'blogs', name: 'Toplam Blog', stat: blogsCount || 0, icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50', trend: 'Yayında', adminOnly: false },
        { id: 'jobs', name: 'İş İlanları', stat: jobsCount || 0, icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: 'Kariyer Fırsatları', adminOnly: false },
        { id: 'projects', name: 'Öğrenci Projeleri', stat: projectsCount || 0, icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50', trend: 'Geliştiriliyor', adminOnly: false },
        { id: 'users', name: 'Sistem Kullanıcıları', stat: usersCount || 0, icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50', trend: 'Yöneticiler', adminOnly: true },
    ]

    const visibleStats = allStats.filter(item => {
        if (item.adminOnly && role !== 'super_admin') return false
        return hasAccess(item.id)
    })

    const canCreateEvents = hasAccess('events') && role !== 'viewer'
    const canCreateBlogs = hasAccess('blogs') && role !== 'viewer'
    const canCreateJobs = hasAccess('jobs') && role !== 'viewer'
    const hasQuickActions = canCreateEvents || canCreateBlogs || canCreateJobs

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            
            {/* Dinamik Üst Karşılama Alanı */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-brand-600 font-bold text-sm tracking-wider uppercase">
                        <Sparkles className="w-4 h-4" />
                        <span>{greeting}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                        Hoş geldin, {firstName}!
                    </h2>
                    <p className="text-slate-500 mt-2 max-w-lg leading-relaxed">Sistem özetin hazır. Topluluğun dijital ayak izini yönetmeye hemen başlayabilirsin.</p>
                </div>
                
                {canCreateEvents && (
                    <div className="relative z-10 mt-4 md:mt-0 shrink-0">
                        <Link 
                            href="/admin/events/create" 
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-brand-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            Hızlı Etkinlik Ekle
                        </Link>
                    </div>
                )}
            </div>

            {role === 'viewer' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 text-amber-800 text-sm font-medium">
                    <ShieldAlert className="w-6 h-6 shrink-0 text-amber-600" />
                    <p><strong>İzleyici Modu:</strong> Sadece görüntüleme yetkisine sahipsiniz. İşlem yapamazsınız.</p>
                </div>
            )}

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 xl:gap-6">
                {visibleStats.map((item) => {
                    const IconComponent = item.icon
                    return (
                        <div key={item.name} className="relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col justify-between h-40">
                            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-700 ease-out ${item.bgColor}`} aria-hidden="true" />
                            <div className="relative z-10 flex items-start justify-between">
                                <div className={`p-3 rounded-2xl ${item.bgColor} text-opacity-90 group-hover:scale-110 transition-transform`}>
                                    <IconComponent className={`h-6 w-6 ${item.color}`} />
                                </div>
                                <span className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    <TrendingUp className="w-3 h-3 mr-1" /> {item.trend}
                                </span>
                            </div>
                            <div className="relative z-10 mt-auto">
                                <p className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                                    {item.stat}
                                </p>
                                <p className="text-sm font-semibold text-slate-500">{item.name}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Alt Bölüm: Hızlı İşlemler & Son Hareketlilik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                
                {/* Sol Kısım: Hızlı İşlemler */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] shadow-lg p-7 text-white relative overflow-hidden flex-1">
                        <Activity className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-5" aria-hidden="true" />
                        <h3 className="text-xl font-heading font-bold mb-6 relative z-10 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-brand-400" /> Operasyon Merkezi
                        </h3>
                        
                        {hasQuickActions ? (
                            <div className="space-y-3 relative z-10">
                                {canCreateEvents && (
                                    <Link href="/admin/events/create" className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-brand-500 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-brand-300 group-hover:text-white transition-colors" />
                                            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Etkinlik Planla</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </Link>
                                )}
                                {canCreateBlogs && (
                                    <Link href="/admin/blogs/create" className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-green-500 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-green-300 group-hover:text-white transition-colors" />
                                            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Blog Yazısı Yayınla</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </Link>
                                )}
                                {canCreateJobs && (
                                    <Link href="/admin/jobs/create" className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-blue-500 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors" />
                                            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">İlan Aç</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 bg-white/5 p-4 rounded-xl border border-white/10">
                                İşlem yetkiniz bulunmuyor. Görüntüleme modundasınız.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sağ Kısım: Son Hareketlilik Akışı */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-7">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-xl font-heading font-bold text-slate-900 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-slate-400" /> Son Hareketlilik
                        </h3>
                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">Sistem Özeti</span>
                    </div>

                    {recentActivities.length > 0 ? (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {recentActivities.map((activity) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={`${activity.type}-${activity.id}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${activity.bgColor} ${activity.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-transform group-hover:scale-110`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-0.5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${activity.color}`}>{activity.type}</span>
                                                <time className="text-xs font-medium text-slate-400">{formatDate(activity.created_at)}</time>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 truncate">{activity.title}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Activity className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-600 mb-1">Henüz Hareketlilik Yok</p>
                            <p className="text-xs text-slate-400 max-w-xs">Sisteme etkinlik, blog veya ilan eklendiğinde burada akış olarak görünecektir.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
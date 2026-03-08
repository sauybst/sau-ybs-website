import { createClient } from '@/utils/supabase/server'
import { Activity, Users, Calendar, FileText, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Veritabanından gerçek sayıları çekiyoruz
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true })
    const { count: blogsCount } = await supabase.from('blogs').select('*', { count: 'exact', head: true })
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })

    // Tailwind PurgeCSS'in canlıda renkleri silememesi için renk sınıflarını açıkça tanımladık
    const stats = [
        { name: 'Toplam Etkinlik', stat: eventsCount || 0, icon: Calendar, color: 'text-brand-600', bgColor: 'bg-brand-50', trend: 'Aktif takvim' },
        { name: 'Toplam Blog', stat: blogsCount || 0, icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50', trend: 'Yayında' },
        { name: 'Aktif Kullanıcılar', stat: usersCount || 0, icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50', trend: 'Topluluk üyeleri' },
        { name: 'Öğrenci Projeleri', stat: projectsCount || 0, icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50', trend: 'Geliştiriliyor' },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Üst Karşılama Alanı */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                        Hoş geldin! 👋
                    </h2>
                    <p className="text-slate-500 mt-1">SAÜ YBS Yönetim Paneline hoş geldin. Bugün neler yapıyoruz?</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/events/create" 
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-brand-700 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Etkinlik
                    </Link>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => {
                    const IconComponent = item.icon
                    return (
                        <div key={item.name} className="relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                            {/* Arka plan dekoratif şekil (Üzerine gelince büyür) */}
                            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-700 ease-out ${item.bgColor}`}></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-3 rounded-2xl ${item.bgColor}`}>
                                        <IconComponent className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                        {item.trend}
                                    </span>
                                </div>
                                
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 mb-1">{item.name}</p>
                                    <p className="text-4xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
                                        {item.stat}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Alt Bölüm: Hızlı İşlemler ve Bilgi Panosu */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                
                {/* Hızlı İşlemler Kartı */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-xl font-heading font-bold text-slate-900 mb-6">Hızlı İşlemler</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/admin/events/create" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-all group">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:text-brand-600 transition-colors">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-brand-700 transition-colors">Etkinlik Oluştur</span>
                        </Link>
                        
                        <Link href="/admin/blogs/create" className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-all group">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:text-green-600 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-green-700 transition-colors">Blog Yazısı Yaz</span>
                        </Link>
                    </div>
                </div>
                
                {/* Karşılama / Marka Kartı */}
                <div className="bg-gradient-to-br from-brand-600 to-indigo-800 rounded-3xl shadow-lg p-8 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider mb-4">SİSTEM AKTİF</span>
                        <h3 className="text-2xl font-heading font-bold mb-3">Yönetim Paneline Hoş Geldin</h3>
                        <p className="text-brand-100 text-sm max-w-sm leading-relaxed">
                            SAÜ YBS ekosistemindeki tüm etkinlikleri, blogları ve öğrenci projelerini buradan tek bir merkezden kolayca yönetebilirsin.
                        </p>
                    </div>
                    <div className="relative z-10 mt-8">
                        <Link href="/" target="_blank" className="inline-flex items-center text-sm font-bold text-white hover:text-brand-200 transition-colors">
                            Ana Siteyi Görüntüle <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    {/* Arka Plan Dekoratif İkonu */}
                    <Activity className="absolute -bottom-8 -right-8 w-48 h-48 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
                </div>

            </div>
        </div>
    )
}
import { createClient } from '@/utils/supabase/server'
import { Activity, Users, Calendar, FileText } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Basic stats fetch... In a real scenario we use counts from specific tables.
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true })
    const { count: blogsCount } = await supabase.from('blogs').select('*', { count: 'exact', head: true })
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })

    const stats = [
        { name: 'Toplam Etkinlik', stat: eventsCount || 0, icon: Calendar, color: 'text-blue-500' },
        { name: 'Toplam Blog', stat: blogsCount || 0, icon: FileText, color: 'text-green-500' },
        { name: 'Aktif Kullanıcılar', stat: usersCount || 0, icon: Users, color: 'text-indigo-500' },
        { name: 'Öğrenci Projeleri', stat: projectsCount || 0, icon: Activity, color: 'text-orange-500' },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
                Hoşgeldiniz
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => {
                    const IconComponent = item.icon
                    return (
                        <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border border-gray-100">
                            <dt>
                                <div className={`absolute rounded-md p-3 ${item.color.replace('text', 'bg').replace('500', '100')}`}>
                                    <IconComponent className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                                </div>
                                <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                            </dt>
                            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                            </dd>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

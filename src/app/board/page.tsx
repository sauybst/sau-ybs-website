import { createClient } from '@/utils/supabase/server'
import { Users, History, Linkedin } from 'lucide-react'

export const metadata = {
    title: 'Yönetim Kurulu - YBS Topluluğu',
    description: 'SAU YBS mevcut ve geçmiş yönetim kurulu üyeleri',
}

export default async function PublicBoardPage() {
    const supabase = await createClient()

    const { data: members, error } = await supabase
        .from('board_members')
        .select('*')
        .order('term_year', { ascending: false })
        .order('created_at', { ascending: true })

    // Grup the members by term_year and active status
    const activeMembers = members?.filter(m => m.is_active) || []
    const pastMembers = members?.filter(m => !m.is_active) || []

    // Group past members by term year for the archive
    const pastTerms = pastMembers.reduce((acc, member) => {
        if (!acc[member.term_year]) {
            acc[member.term_year] = []
        }
        acc[member.term_year].push(member)
        return acc
    }, {} as Record<string, typeof pastMembers>)

    const sortedPastTerms = Object.keys(pastTerms).sort((a, b) => b.localeCompare(a))

    const MemberCard = ({ member }: { member: any }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-28 w-28 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-indigo-50 flex items-center justify-center">
                {member.image_url ? (
                    <img src={member.image_url} alt={member.full_name} className="h-full w-full object-cover" />
                ) : (
                    <Users className="h-10 w-10 text-slate-300" />
                )}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{member.full_name}</h3>
            <p className="text-sm font-medium text-indigo-600 mt-1">{member.board_role}</p>

            {member.linkedin_url && (
                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="mt-4 text-gray-400 hover:text-blue-600 transition-colors">
                    <span className="sr-only">LinkedIn</span>
                    <Linkedin className="h-5 w-5" />
                </a>
            )}
        </div>
    )

    return (
        <div className="bg-white min-h-screen py-16 sm:py-24">
            {/* Active Board */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Aktif Yönetim Kurulu</h1>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        {activeMembers.length > 0 ? activeMembers[0].term_year : 'Mevcut'} Dönemi Yönetim Kurulumuz.
                    </p>
                </div>

                {activeMembers.length === 0 ? (
                    <p className="text-center text-gray-500 bg-gray-50 py-10 rounded-xl">Aktif dönem yönetim kurulu henüz eklenmemiş.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {activeMembers.map(member => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                )}
            </section>

            {/* Corporate Memory (Past Boards Archive) */}
            <section className="bg-slate-50 py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 flex flex-col items-center">
                        <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <History className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Geçmiş Yönetim Kurulları</h2>
                        <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto">
                            Kurumsal hafızamızı yaşatıyoruz. Önceki dönemlerde topluluğumuza hizmet eden değerli üyelerimiz.
                        </p>
                    </div>

                    {sortedPastTerms.length === 0 ? (
                        <p className="text-center text-gray-400">Arşivde geçmiş dönem kaydı bulunmamaktadır.</p>
                    ) : (
                        <div className="space-y-16">
                            {sortedPastTerms.map(term => (
                                <div key={term}>
                                    <div className="flex items-center mb-8">
                                        <h3 className="text-2xl font-bold text-gray-800 pr-4">{term}</h3>
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        {pastTerms[term].map(member => (
                                            <MemberCard key={member.id} member={member} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

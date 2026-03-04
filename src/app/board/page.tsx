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
        <div className="bg-white rounded-2xl shadow-sm border border-brand-50 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-32 w-32 rounded-full bg-slate-100 mb-6 overflow-hidden border-4 border-white shadow-md flex items-center justify-center relative">
                {member.image_url ? (
                    <img src={member.image_url} alt={member.full_name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                        <Users className="h-12 w-12 text-brand-300" />
                    </div>
                )}
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{member.full_name}</h3>
            <p className="text-sm font-semibold tracking-wide text-brand-500 uppercase mt-2">{member.board_role}</p>

            {member.linkedin_url && (
                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="mt-5 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 p-2 rounded-full hover:bg-blue-50">
                    <span className="sr-only">LinkedIn</span>
                    <Linkedin className="h-5 w-5" />
                </a>
            )}
        </div>
    )

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            {/* Active Board */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="text-center mb-16">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Canım Ekip</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Aktif Yönetim Kurulu</h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-light">
                        {activeMembers.length > 0 ? activeMembers[0].term_year : 'Mevcut'} Dönemi Yönetim Kurulumuz. Başarıya giden yolda birlikte yürüyen ekibimiz.
                    </p>
                </div>

                {activeMembers.length === 0 ? (
                    <p className="text-center text-slate-500 bg-white py-12 rounded-2xl border border-dashed border-slate-300 shadow-sm">Aktif dönem yönetim kurulu henüz eklenmemiş.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {activeMembers.map(member => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                )}
            </section>

            {/* Corporate Memory (Past Boards Archive) */}
            <section className="bg-white py-24 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 flex flex-col items-center">
                        <div className="h-16 w-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <History className="h-8 w-8" />
                        </div>
                        <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Arşiv</h2>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Geçmiş Yönetim Kurulları</h2>
                        <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-light">
                            Kurumsal hafızamızı yaşatıyoruz. Önceki dönemlerde topluluğumuza hizmet eden ve vizyonumuzu şekillendiren değerli üyelerimiz.
                        </p>
                    </div>

                    {sortedPastTerms.length === 0 ? (
                        <p className="text-center text-slate-400">Arşivde geçmiş dönem kaydı bulunmamaktadır.</p>
                    ) : (
                        <div className="space-y-20">
                            {sortedPastTerms.map(term => (
                                <div key={term}>
                                    <div className="flex items-center mb-10">
                                        <h3 className="text-2xl font-heading font-bold text-brand-900 pr-6">{term} <span className="text-brand-400 font-medium text-lg ml-2">Dönemi</span></h3>
                                        <div className="flex-1 h-px bg-gradient-to-r from-brand-200 to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        {pastTerms[term].map((member: any) => (
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

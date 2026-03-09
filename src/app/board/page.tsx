import { createClient } from '@/utils/supabase/server'
import { Users, History, Linkedin, Target, Lightbulb, Compass } from 'lucide-react'
import Link from 'next/link'
import FloatingTechBackground from '@/components/FloatingTechBackground'

export const metadata = {
    title: 'Hakkımızda & Yönetim Kurulu - YBS Topluluğu',
    description: 'SAU YBS topluluğunun vizyonu, misyonu ve mevcut ile geçmiş yönetim kurulu üyeleri',
}

// Üye Kartı Bileşeni
const MemberCard = ({ member, isPresident = false }: { member: any, isPresident?: boolean }) => {
    return (
        <div
            className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-2 hover:border-brand-200 transition-all duration-300 group relative ${isPresident ? 'w-full max-w-sm mx-auto' : 'w-full'}`}
        >
            <Link href={`/board/${member.slug}`} className="absolute inset-0 rounded-3xl z-10" aria-label={`${member.full_name} profilini görüntüle`} />

            <div className={`${isPresident ? 'h-40 w-40' : 'h-32 w-32'} rounded-full bg-slate-50 mb-6 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center relative`}>
                {member.image_url ? (
                    <img src={member.image_url} alt={member.full_name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                        <Users className={`${isPresident ? 'h-16 w-16' : 'h-12 w-12'} text-brand-300`} />
                    </div>
                )}
            </div>
            
            <h3 className={`${isPresident ? 'text-2xl' : 'text-xl'} font-heading font-bold text-slate-900 group-hover:text-brand-600 transition-colors`}>
                {member.full_name}
            </h3>
            
            <p className={`font-semibold tracking-wide uppercase mt-2 ${isPresident ? 'text-brand-600 text-sm' : 'text-brand-500 text-xs'}`}>
                {member.board_role}
            </p>

            {member.linkedin_url && (
                <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-20 mt-5 text-slate-400 hover:text-[#0A66C2] transition-colors bg-slate-50 p-2.5 rounded-full hover:bg-blue-50"
                    aria-label={`${member.full_name} LinkedIn profili`}
                >
                    <span className="sr-only">LinkedIn</span>
                    <Linkedin className="h-5 w-5" />
                </a>
            )}
        </div>
    )
}

export default async function AboutAndBoardPage() {
    const supabase = await createClient()

    const { data: members, error } = await supabase
        .from('board_members')
        .select('*')
        .order('term_year', { ascending: false })
        .order('created_at', { ascending: true })

    const activeMembers = members?.filter(m => m.is_active) || []
    const pastMembers = members?.filter(m => !m.is_active) || []

    const president = activeMembers.find(m => m.board_level === '1'); 
    const vicePresidents = activeMembers.filter(m => m.board_level === '2'); 
    const others = activeMembers.filter(m => m.board_level === '3' || !m.board_level);

    const pastTerms = pastMembers.reduce((acc, member) => {
        if (!acc[member.term_year]) acc[member.term_year] = []
        acc[member.term_year].push(member)
        return acc
    }, {} as Record<string, typeof pastMembers>)

    const sortedPastTerms = Object.keys(pastTerms).sort((a, b) => b.localeCompare(a))

    return (
        <div className="bg-slate-50 min-h-screen">
            
            {/* HERO SECTION: HAREKETLİ ARKA PLAN SADECE BU BÖLÜMDE VAR */}
            <div className="relative pt-24 pb-24 lg:pb-32 overflow-hidden border-b border-slate-200">
                <FloatingTechBackground />
                
                {/* 1. BÖLÜM: BİZ KİMİZ? (Vizyon & Misyon) */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 animate-fade-in-up">Hakkımızda</h2>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight animate-fade-in-up animation-delay-100">Biz Kimiz?</h1>
                        <p className="mt-6 max-w-3xl text-lg text-slate-700 mx-auto font-montserrat leading-relaxed animate-fade-in-up animation-delay-200 font-medium">
                            Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu olarak; teknolojiyi yakından takip eden, analitik düşünebilen ve iş dünyası ile dijital dünya arasında sağlam köprüler kuran liderler yetiştirmeyi amaçlıyoruz.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Misyon */}
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white hover:shadow-xl hover:-translate-y-2 hover:border-brand-200 transition-all duration-500 group relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600 relative z-10 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                <Target className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-5 font-heading relative z-10">Misyonumuz</h3>
                            <ul className="space-y-3 relative z-10 mt-auto">
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Akademik bilgiyi pratik deneyimle harmanlamak.</span>
                                </li>
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Eğitim ve projelerle sektörel yetkinlikleri artırmak.</span>
                                </li>
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>İş dünyasının aranan profesyonellerini yetiştirmek.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Vizyon */}
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white hover:shadow-xl hover:-translate-y-2 hover:border-amber-200 transition-all duration-500 group relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-500 relative z-10 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                                <Lightbulb className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-5 font-heading relative z-10">Vizyonumuz</h3>
                            <ul className="space-y-3 relative z-10 mt-auto">
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Türkiye'nin en aktif öğrenci topluluğu olmak.</span>
                                </li>
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Sürekli yenilik ve yüksek değer üretmek.</span>
                                </li>
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Teknolojiye yön veren güçlü bir mezun ağı kurmak.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Değerlerimiz */}
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white hover:shadow-xl hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 group relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 relative z-10 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                                <Compass className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-5 font-heading relative z-10">Değerlerimiz</h3>
                            <ul className="space-y-3 relative z-10 mt-auto">
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Yenilikçilik ve sürekli gelişim.</span>
                                </li>
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Şeffaflık ve güçlü takım ruhu.</span>
                                </li>
                                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                    <span>Birlikte öğrenip büyüyen bir aile olmak.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            {/* ALT KISIM (YÖNETİM KURULU): TEMİZ ARKA PLAN İLE DEVAM EDER */}
            <div className="pt-24 pb-16">
                {/* 2. BÖLÜM: AKTİF YÖNETİM KURULU */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Ekip Üyelerimiz</h2>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Aktif Yönetim Kurulu</h1>
                        <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-medium font-montserrat">
                            {activeMembers.length > 0 ? activeMembers[0].term_year : 'Mevcut'} Dönemi Yönetim Kurulumuz. Başarıya giden yolda liderlik eden çekirdek kadromuz.
                        </p>
                    </div>

                    {activeMembers.length === 0 ? (
                        <p className="text-center text-slate-500 bg-white py-12 rounded-2xl border border-dashed border-slate-300 shadow-sm">Aktif dönem yönetim kurulu henüz eklenmemiş.</p>
                    ) : (
                        <div className="relative">
                            {president && (
                                <div className="flex flex-col items-center">
                                    <MemberCard member={president} isPresident={true} />
                                    {(vicePresidents.length > 0 || others.length > 0) && (
                                        <div className="w-px h-12 bg-brand-200"></div>
                                    )}
                                </div>
                            )}

                            {vicePresidents.length > 0 && (
                                <div className="flex flex-col items-center">
                                    {vicePresidents.length > 1 && (
                                        <div className="w-[50%] md:w-[60%] border-t-2 border-brand-200"></div>
                                    )}
                                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-0">
                                        {vicePresidents.map((vp) => (
                                            <div key={vp.id} className="flex flex-col items-center w-full sm:w-auto">
                                                {vicePresidents.length > 1 && <div className="w-px h-6 bg-brand-200"></div>}
                                                <div className="w-full sm:w-72 mt-2">
                                                    <MemberCard member={vp} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {others.length > 0 && (
                                        <div className="w-px h-16 bg-brand-200 mt-6 hidden sm:block"></div>
                                    )}
                                </div>
                            )}

                            {others.length > 0 && (
                                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ${(!president && vicePresidents.length === 0) ? '' : 'mt-8 sm:mt-0'}`}>
                                    {others.map(member => (
                                        <MemberCard key={member.id} member={member} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* 3. BÖLÜM: GEÇMİŞ YÖNETİM KURULLARI */}
                <section className="bg-white py-24 border-t border-slate-200 rounded-t-[3rem]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20 flex flex-col items-center">
                            <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                                <History className="h-8 w-8" />
                            </div>
                            <h2 className="text-slate-400 font-semibold tracking-wide uppercase text-sm mb-2">Arşiv</h2>
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Geçmiş Yönetim Kurulları</h2>
                            <p className="mt-4 max-w-2xl text-lg text-slate-500 mx-auto font-medium font-montserrat">
                                Kurumsal hafızamızı yaşatıyoruz. Önceki dönemlerde topluluğumuza hizmet eden ve vizyonumuzu şekillendiren değerli üyelerimiz.
                            </p>
                        </div>

                        {sortedPastTerms.length === 0 ? (
                            <p className="text-center text-slate-400 bg-slate-50 py-12 rounded-2xl">Arşivde geçmiş dönem kaydı bulunmamaktadır.</p>
                        ) : (
                            <div className="space-y-24">
                                {sortedPastTerms.map(term => (
                                    <div key={term} className="relative">
                                        <div className="flex items-center mb-12">
                                            <h3 className="text-2xl font-heading font-bold text-slate-800 pr-6 bg-white relative z-10">
                                                {term} <span className="text-slate-400 font-medium text-lg ml-2">Dönemi</span>
                                            </h3>
                                            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-slate-200 to-transparent top-1/2 -translate-y-1/2"></div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 opacity-80 hover:opacity-100 transition-opacity">
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
        </div>
    )
}
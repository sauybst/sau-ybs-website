import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { Users, History, Target, Lightbulb, Compass, Linkedin } from 'lucide-react'
import FloatingTechBackground from '@/components/FloatingTechBackground'
import MemberCard from '@/components/board/MemberCard'
import type { BoardMemberListItem } from '@/types/board-member'
import ArchiveViewer from '@/components/board/ArchiveViewer' 

export const metadata: Metadata = {
  title: 'Hakkımızda & Yönetim Kurulu',
  description:
    'SAU YBS topluluğunun vizyonu, misyonu ve mevcut ile geçmiş yönetim kurulu üyeleri.',
  alternates: { canonical: '/board' },
}

/** Liste sayfasında kullanılan alanlar */
const MEMBER_LIST_SELECT =
  'id,slug,full_name,board_role,board_level,term_year,is_active,image_url,linkedin_url' as const

export default async function AboutAndBoardPage() {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('board_members')
    .select(MEMBER_LIST_SELECT)
    .order('term_year', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[Board:list]', error)
  }

  const typedMembers = (members ?? []) as unknown as BoardMemberListItem[]
  
  const activeMembers = typedMembers.filter((m) => m.is_active && String(m.board_level) !== '4')
  const pastMembers = typedMembers.filter((m) => !m.is_active && String(m.board_level) !== '4')
  
  const currentTermYear = activeMembers.length > 0 ? activeMembers[0].term_year : ''
  
  const allContributors = typedMembers.filter((m) => String(m.board_level) === '4')
  
  const currentContributors = allContributors.filter((m) => m.term_year === currentTermYear)
  const pastContributors = allContributors.filter((m) => m.term_year !== currentTermYear)

  const president = activeMembers.find((m) => m.board_level === '1')
  const vicePresidents = activeMembers.filter((m) => m.board_level === '2')
  const others = activeMembers.filter((m) => m.board_level === '3' || !m.board_level)
  const pastTerms = pastMembers.reduce(
    (acc, member) => {
      if (!acc[member.term_year]) acc[member.term_year] = []
      acc[member.term_year].push(member)
      return acc
    },
    {} as Record<string, BoardMemberListItem[]>
  )

  const contributorTerms = pastContributors.reduce(
    (acc, member) => {
      const year = member.term_year || 'Bilinmeyen Dönem';
      if (!acc[year]) acc[year] = [];
      acc[year].push(member);
      return acc;
    },
    {} as Record<string, BoardMemberListItem[]>
  )

  const allYearsSet = new Set([...Object.keys(pastTerms), ...Object.keys(contributorTerms)]);
  const sortedPastTerms = Array.from(allYearsSet).sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* HERO: Vizyon & Misyon */}
      <div className="relative pt-24 pb-24 lg:pb-32 overflow-hidden border-b border-slate-200">
        <FloatingTechBackground />

        <section aria-label="Hakkımızda" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="text-center mb-16">
            <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block animate-fade-in-up">
              Hakkımızda
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight animate-fade-in-up animation-delay-100">
              Biz Kimiz?
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-slate-700 mx-auto font-montserrat leading-relaxed animate-fade-in-up animation-delay-200 font-medium">
              Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu olarak; teknolojiyi yakından
              takip eden, analitik düşünebilen ve iş dünyası ile dijital dünya arasında sağlam
              köprüler kuran liderler yetiştirmeyi amaçlıyoruz.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Misyon */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white hover:shadow-xl hover:-translate-y-2 hover:border-brand-200 transition-all duration-500 group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" aria-hidden="true" />
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600 relative z-10 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-5 font-heading relative z-10">
                Misyonumuz
              </h2>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0" />
                  <span>Akademik bilgiyi pratik deneyimle harmanlamak.</span>
                </li>
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0" />
                  <span>Eğitim ve projelerle sektörel yetkinlikleri artırmak.</span>
                </li>
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 mr-3 flex-shrink-0" />
                  <span>İş dünyasının aranan profesyonellerini yetiştirmek.</span>
                </li>
              </ul>
            </div>

            {/* Vizyon */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white hover:shadow-xl hover:-translate-y-2 hover:border-amber-200 transition-all duration-500 group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" aria-hidden="true" />
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-500 relative z-10 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-5 font-heading relative z-10">
                Vizyonumuz
              </h2>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0" />
                  <span>Türkiye'nin en aktif öğrenci topluluğu olmak.</span>
                </li>
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0" />
                  <span>Sürekli yenilik ve yüksek değer üretmek.</span>
                </li>
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0" />
                  <span>Teknolojiye yön veren güçlü bir mezun ağı kurmak.</span>
                </li>
              </ul>
            </div>

            {/* Değerlerimiz */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white hover:shadow-xl hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out" aria-hidden="true" />
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 relative z-10 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Compass className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-5 font-heading relative z-10">
                Değerlerimiz
              </h2>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0" />
                  <span>Yenilikçilik ve sürekli gelişim.</span>
                </li>
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0" />
                  <span>Şeffaflık ve güçlü takım ruhu.</span>
                </li>
                <li className="flex items-start text-slate-600 font-montserrat text-sm md:text-base">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0" />
                  <span>Birlikte öğrenip büyüyen bir aile olmak.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Yönetim Kurulu Bölümü */}
      <div className="pt-24 pb-16">
        {/* Aktif Yönetim Kurulu */}
        <section aria-label="Aktif yönetim kurulu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <header className="text-center mb-16">
            <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">
              Ekip Üyelerimiz
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
              Aktif Yönetim Kurulu
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-medium font-montserrat">
              {activeMembers.length > 0 ? activeMembers[0].term_year : 'Mevcut'} Dönemi Yönetim
              Kurulumuz. Başarıya giden yolda liderlik eden çekirdek kadromuz.
            </p>
          </header>

          {activeMembers.length === 0 ? (
            <p className="text-center text-slate-500 bg-white py-12 rounded-2xl border border-dashed border-slate-300 shadow-sm">
              Aktif dönem yönetim kurulu henüz eklenmemiş.
            </p>
          ) : (
            <div className="relative">
              {president && (
                <div className="flex flex-col items-center">
                  <MemberCard member={president} isPresident />
                  {(vicePresidents.length > 0 || others.length > 0) && (
                    <div className="w-px h-12 bg-brand-200" aria-hidden="true" />
                  )}
                </div>
              )}

              {vicePresidents.length > 0 && (
                <div className="flex flex-col items-center">
                  {vicePresidents.length > 1 && (
                    <div className="w-[50%] md:w-[60%] border-t-2 border-brand-200" aria-hidden="true" />
                  )}
                  <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-0">
                    {vicePresidents.map((vp) => (
                      <div key={vp.id} className="flex flex-col items-center w-full sm:w-auto">
                        {vicePresidents.length > 1 && (
                          <div className="w-px h-6 bg-brand-200" aria-hidden="true" />
                        )}
                        <div className="w-full sm:w-72 mt-2">
                          <MemberCard member={vp} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {others.length > 0 && (
                    <div className="w-px h-16 bg-brand-200 mt-6 hidden sm:block" aria-hidden="true" />
                  )}
                </div>
              )}

              {others.length > 0 && (
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ${
                    !president && vicePresidents.length === 0 ? '' : 'mt-8 sm:mt-0'
                  }`}
                >
                  {others.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* --- EMEĞİ GEÇENLER / ERKEN AYRILANLAR BÖLÜMÜ --- */}
        {currentContributors.length > 0 && (
          <section aria-label="Topluluğa Emeği Geçenler" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <header className="text-center mb-12 flex flex-col items-center">
              <div className="h-12 w-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4 border border-amber-100">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-800 tracking-tight">
                Topluluğumuza Emeği Geçenler
              </h2>
              <p className="mt-3 max-w-2xl text-base text-slate-500 mx-auto font-medium font-montserrat">
                Görev süresini tamamlamadan aramızdan ayrılan, ancak topluluğumuza değerli katkılar sunan ekip arkadaşlarımız.
              </p>
            </header>

            {/* Biraz daha küçük, şık ve tatlı bir kart tasarımı kullanıyoruz */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 opacity-90 hover:opacity-100 transition-opacity duration-300">
              {currentContributors.map(member => (
                <div key={member.id} className="text-center flex flex-col items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-brand-200 hover:-translate-y-1 transition-all duration-300">
                  {member.image_url ? (
                    <img src={member.image_url} alt={member.full_name} className="w-20 h-20 rounded-full object-cover mb-4 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300 border border-slate-100">
                       <Users className="w-8 h-8" />
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-1" title={member.full_name}>{member.full_name}</h3>
                  <p className="text-xs text-brand-600 font-medium mt-1 line-clamp-1">{member.board_role}</p>
                  {/* Badge (Etiket) ve LinkedIn Butonu Yan Yana */}
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <span className="text-sm text-slate-500 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 font-medium">
                      {member.term_year}
                    </span>
                    
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#0A66C2] transition-colors p-2 bg-slate-50 hover:bg-blue-50 rounded-full border border-slate-100 hover:border-blue-100"
                        title={`${member.full_name} LinkedIn Profili`}
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Geçmiş Yönetim Kurulları ve Arşiv */}
        <section aria-label="Geçmiş yönetim kurulları ve arşiv" className="bg-white py-24 border-t border-slate-200 rounded-t-[3rem]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16 flex flex-col items-center">
              <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                <History className="h-8 w-8" />
              </div>
              <span className="text-slate-400 font-semibold tracking-wide uppercase text-sm mb-2 block">
                Arşiv
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">
                Geçmiş Dönem Arşivi
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-slate-500 mx-auto font-medium font-montserrat">
                Kurumsal hafızamızı yaşatıyoruz. Topluluğumuza hizmet eden, vizyonumuzu şekillendiren ve emeği geçen tüm değerli ekip arkadaşlarımız.
              </p>
            </header>

            {/* Yeni Client Bileşenimiz Burada Devreye Giriyor */}
            <ArchiveViewer 
              pastTerms={pastTerms} 
              contributorTerms={contributorTerms} 
              allYears={sortedPastTerms} 
            />
            
          </div>
        </section>
      </div>
    </div>
  )
}
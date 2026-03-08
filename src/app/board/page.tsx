import { createClient } from '@/utils/supabase/server'
import { Users, History, Linkedin, Target, Lightbulb, Compass } from 'lucide-react'

export const metadata = {
    title: 'Hakkımızda & Yönetim Kurulu - YBS Topluluğu',
    description: 'SAU YBS topluluğunun vizyonu, misyonu ve mevcut ile geçmiş yönetim kurulu üyeleri',
}

// Üye Kartı Bileşeni (Hiyerarşiye göre boyut değiştirebilmesi için "isPresident" prop'u eklendi)
const MemberCard = ({ member, isPresident = false }: { member: any, isPresident?: boolean }) => (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative z-10 ${isPresident ? 'w-full max-w-sm mx-auto' : 'w-full'}`}>
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
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="mt-5 text-slate-400 hover:text-[#0A66C2] transition-colors bg-slate-50 p-2.5 rounded-full hover:bg-blue-50">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
            </a>
        )}
    </div>
)

export default async function AboutAndBoardPage() {
    const supabase = await createClient()

    const { data: members, error } = await supabase
        .from('board_members')
        .select('*')
        .order('term_year', { ascending: false })
        .order('created_at', { ascending: true })

    const activeMembers = members?.filter(m => m.is_active) || []
    const pastMembers = members?.filter(m => !m.is_active) || []

    // --- HİYERARŞİ ALGORİTMASI ---
    // Seviye 1: Başkan (Tek kişi olduğunu varsayarak .find kullanıyoruz, birden fazlaysa .filter yapabilirsin)
    const president = activeMembers.find(m => m.board_level === '1'); 

    // Seviye 2: Başkan Yardımcıları
    const vicePresidents = activeMembers.filter(m => m.board_level === '2'); 

    // Seviye 3: Koordinatörler ve Diğer Yönetim Kurulu Üyeleri
    const others = activeMembers.filter(m => m.board_level === '3' || !m.board_level);

    // Geçmiş dönem arşivi için gruplama
    const pastTerms = pastMembers.reduce((acc, member) => {
        if (!acc[member.term_year]) acc[member.term_year] = []
        acc[member.term_year].push(member)
        return acc
    }, {} as Record<string, typeof pastMembers>)

    const sortedPastTerms = Object.keys(pastTerms).sort((a, b) => b.localeCompare(a))

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16 overflow-hidden">
            
            {/* 1. BÖLÜM: BİZ KİMİZ? (Vizyon & Misyon) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="text-center mb-16">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Hakkımızda</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Biz Kimiz?</h1>
                    <p className="mt-6 max-w-3xl text-lg text-slate-600 mx-auto font-montserrat leading-relaxed">
                        Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu olarak; teknolojiyi yakından takip eden, analitik düşünebilen ve iş dünyası ile dijital dünya arasında sağlam köprüler kuran liderler yetiştirmeyi amaçlıyoruz.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Misyon */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600">
                            <Target className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 font-heading">Misyonumuz</h3>
                        <p className="text-slate-600 leading-relaxed font-montserrat">
                            Öğrencilerimizin akademik bilgilerini pratikle harmanlayarak, sektörel yetkinliklerini artırmak. Düzenlediğimiz eğitim, seminer ve projelerle onları iş dünyasının aranan profesyonelleri haline getirmek.
                        </p>
                    </div>

                    {/* Vizyon */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
                            <Lightbulb className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 font-heading">Vizyonumuz</h3>
                        <p className="text-slate-600 leading-relaxed font-montserrat">
                            Yönetim Bilişim Sistemleri alanında Türkiye'nin en aktif, en yenilikçi ve en çok değer üreten öğrenci topluluğu olmak. Teknolojinin geleceğine yön veren mezunlar ağı oluşturmak.
                        </p>
                    </div>

                    {/* Değerlerimiz */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                            <Compass className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 font-heading">Değerlerimiz</h3>
                        <p className="text-slate-600 leading-relaxed font-montserrat">
                            Yenilikçilik, takım ruhu, sürekli gelişim ve şeffaflık. Biz bir ekipten çok daha fazlasıyız; teknolojiyi tutkuyla seven, birlikte öğrenip birlikte büyüyen büyük bir aileyiz.
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. BÖLÜM: AKTİF YÖNETİM KURULU (HİYERARŞİ AĞACI) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="text-center mb-16">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Canım Ekip</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Aktif Yönetim Kurulu</h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-light">
                        {activeMembers.length > 0 ? activeMembers[0].term_year : 'Mevcut'} Dönemi Yönetim Kurulumuz. Başarıya giden yolda liderlik eden çekirdek kadromuz.
                    </p>
                </div>

                {activeMembers.length === 0 ? (
                    <p className="text-center text-slate-500 bg-white py-12 rounded-2xl border border-dashed border-slate-300 shadow-sm">Aktif dönem yönetim kurulu henüz eklenmemiş.</p>
                ) : (
                    <div className="relative">
                        
                        {/* HİYERARŞİ SEVİYE 1: BAŞKAN */}
                        {president && (
                            <div className="flex flex-col items-center">
                                <MemberCard member={president} isPresident={true} />
                                {/* Aşağıya inen çizgi */}
                                {(vicePresidents.length > 0 || others.length > 0) && (
                                    <div className="w-px h-12 bg-brand-200"></div>
                                )}
                            </div>
                        )}

                        {/* HİYERARŞİ SEVİYE 2: BAŞKAN YARDIMCILARI */}
                        {vicePresidents.length > 0 && (
                            <div className="flex flex-col items-center">
                                {/* Yatay dağıtım çizgisi (Sadece 1'den fazla yardımcı varsa) */}
                                {vicePresidents.length > 1 && (
                                    <div className="w-[50%] md:w-[60%] border-t-2 border-brand-200"></div>
                                )}
                                {/* Yardımcılar için dikey kısa çizgiler ve kartlar */}
                                <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-0">
                                    {vicePresidents.map((vp, index) => (
                                        <div key={vp.id} className="flex flex-col items-center w-full sm:w-auto">
                                            {vicePresidents.length > 1 && <div className="w-px h-6 bg-brand-200"></div>}
                                            <div className="w-full sm:w-72 mt-2">
                                                <MemberCard member={vp} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Diğer üyelere inen çizgi */}
                                {others.length > 0 && (
                                    <div className="w-px h-16 bg-brand-200 mt-6 hidden sm:block"></div>
                                )}
                            </div>
                        )}

                        {/* HİYERARŞİ SEVİYE 3: DİĞER YÖNETİM KURULU (Koordinatörler vb.) */}
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

            {/* 3. BÖLÜM: GEÇMİŞ YÖNETİM KURULLARI (KURUMSAL HAFIZA) */}
            <section className="bg-white py-24 border-t border-slate-200 rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 flex flex-col items-center">
                        <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                            <History className="h-8 w-8" />
                        </div>
                        <h2 className="text-slate-400 font-semibold tracking-wide uppercase text-sm mb-2">Arşiv</h2>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Geçmiş Yönetim Kurulları</h2>
                        <p className="mt-4 max-w-2xl text-lg text-slate-500 mx-auto font-light">
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
    )
}
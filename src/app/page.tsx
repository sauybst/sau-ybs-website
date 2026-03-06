import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Calendar as CalendarIcon, MapPin, ArrowRight, Target, Lightbulb, Trophy, Users, Briefcase, Clock, FileText, CheckCircle } from 'lucide-react'
import { Montserrat } from 'next/font/google';
import { syncSabisData } from '@/actions/sabisSync'

// Font ayarlarını yapıyoruz 
const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
});

export default async function Home() {
  const supabase = await createClient()

  // Fetch upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3)

  // Fetch some basic stats for the counter section (simulated or real)
  const { count: membersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true })
  const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })

  const sabisData = await syncSabisData()
  const actualMemberCount = sabisData.memberCount || 650 
  const actualTotalEvents = sabisData.totalEventCount || '50+'

  return (
    <main className="min-h-screen flex flex-col pt-16">
      <section className="relative min-h-[calc(100vh-50px)] flex items-center justify-center overflow-hidden bg-brand-900">
        {/* Fotoğraf tam görünürlükte (opacity-100) eklendi ve karıştırma efekti kaldırıldı */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/hero-arkaplan.jpg')" }}
        />
        <div className="absolute inset-0 bg-brand-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/20 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
  
          {/* Başlık */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 mb-6">
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight">
              Geleceği Analiz Et,<br />
              <span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300"
                style={{ WebkitTextStroke: '1.5px rgba(30, 58, 138, 0.8)' }}
                >
                Sistemi Yönet
              </span>
            </h1>
          </div>

          {/* Paragraf */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 mb-6">
            <p className={`max-w-2xl text-lg md:text-xl text-white font-light leading-relaxed ${montserrat.className}`}>
              Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu; veriyi bilgiye, teknolojiyi stratejik bir güce dönüştüren yenilikçi analistlerin buluşma noktasıdır. İş dünyası ile dijital dünya arasındaki köprüyü birlikte inşa ediyoruz.
            </p>
          </div>

          {/* Butonlar */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <Link href="/events" className="rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-500 hover:-translate-y-1 transition-all duration-300 text-center">
                Etkinlikleri Keşfet
              </Link>
              <Link href="/board" className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                Biz Kimiz? <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
      </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <ArrowRight className="w-6 h-6 rotate-90" />
        </div>
      </section>

              <section className="py-24 bg-white relative overflow-hidden">
                {/* BPMN ve Kod Dizeleri Arka Plan Efekti - Sağa Sola Savrulan Animasyonlar */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.15] z-0 overflow-hidden text-slate-900">
                  <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    
                    {/*Süzülen Kod Dizeleri */}
                    <g>
                      <animateTransform attributeName="transform" type="translate" values="0,0; -20,-30; 0,0" dur="20s" repeatCount="indefinite" />
                      <text x="100" y="150" fontFamily="monospace" fontSize="18" fill="currentColor">&lt;Process id="erp_flow_01"&gt;</text>
                      <text x="850" y="250" fontFamily="monospace" fontSize="16" fill="currentColor">SELECT strategy FROM future;</text>
                      <text x="150" y="650" fontFamily="monospace" fontSize="18" fill="currentColor">const optimize = (data) =&gt; data.map(analyze);</text>
                      <text x="750" y="650" fontFamily="monospace" fontSize="16" fill="currentColor">await system.automate();</text>
                    </g>

                    <g>
                      <animateTransform attributeName="transform" type="translate" values="0,0; 30,20; 0,0" dur="25s" repeatCount="indefinite" />
                      
                      {/* BPMN Task (İşlem / Süreç) */}
                      <rect x="300" y="200" width="120" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
                      <line x1="320" y1="220" x2="380" y2="220" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="320" y1="235" x2="400" y2="235" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      
                      {/* BPMN Exclusive Gateway (Karar Elması) */}
                      <polygon points="650,120 700,170 650,220 600,170" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path d="M635,155 L665,185 M665,155 L635,185" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

                      {/* BPMN Data Store (Veritabanı) */}
                      <path d="M850,450 C850,440 900,440 950,450 C950,460 850,460 850,450 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path d="M850,450 L850,510 C850,520 950,520 950,510 L950,450" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path d="M850,470 C850,480 950,480 950,470" fill="none" stroke="currentColor" strokeWidth="3" />

                      {/* BPMN Intermediate Event (Olay Halkası) */}
                      <circle cx="200" cy="450" r="25" fill="none" stroke="currentColor" strokeWidth="3" />
                      <circle cx="200" cy="450" r="18" fill="none" stroke="currentColor" strokeWidth="2" />

                      {/* Bağlantı Okları (Sequence Flows) */}
                      <path d="M420,230 L550,230 L550,170 L600,170" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6" />
                      <polygon points="600,170 590,165 590,175" fill="currentColor" />

                      <path d="M225,450 L360,450 L360,260" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6" />
                      <polygon points="360,260 355,270 365,270" fill="currentColor" />
                    </g>
                    
                    <g>
                      <animateTransform attributeName="transform" type="translate" values="0,0; -15,25; 0,0" dur="15s" repeatCount="indefinite" />
                      <text x="400" y="550" fontFamily="monospace" fontSize="14" fill="currentColor">try {'{'} process.start(); {'}'} catch (e) {'{'} log(e); {'}'}</text>
                      
                      {/* BPMN End Event (Kalın Halkalı Bitiş) */}
                      <circle cx="700" cy="400" r="25" fill="none" stroke="currentColor" strokeWidth="6" />
                      <path d="M700,320 L700,375" fill="none" stroke="currentColor" strokeWidth="2" />
                      <polygon points="700,375 695,365 705,365" fill="currentColor" />
                    </g>
                  </svg>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Kurumsal Kimliğimiz</h2>
                    <h3 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Önce Kendimizi Tanıtarak Başlayalım</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Amacımız Kartı */}
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <Target className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-heading font-bold text-slate-900 mb-4">Amacımız</h4>
                        <ul className={`mt-2 text-left space-y-4 text-sm md:text-base text-slate-700 font-normal leading-relaxed w-full ${montserrat.className}`}>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Öğrencilerde takım çalışması, liderlik ve analitik düşünme becerilerini geliştirmek.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Bilişim ve yönetim bilimlerini harmanlayarak sektöre nitelikli yetenekler kazandırmak.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Vizyonumuz Kartı */}
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <Lightbulb className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-heading font-bold text-slate-900 mb-4">Vizyonumuz</h4>
                        <ul className={`mt-2 text-left space-y-4 text-sm md:text-base text-slate-700 font-normal leading-relaxed w-full ${montserrat.className}`}>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Sadece üniversite içinde değil, ulusal çapta teknoloji ve bilişim ekosistemine yön vermek.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Sektörel sorunlara çözüm sunan, yenilikçi projeler üreten öncü bir öğrenci topluluğu olmak.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Neden Biz Kartı (Madde İşaretli) */}
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <Trophy className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-heading font-bold text-slate-900 mb-4">Neden Biz?</h4>
                        <ul className={`mt-2 text-left space-y-4 text-sm md:text-base text-slate-700 font-normal leading-relaxed w-full ${montserrat.className}`}>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>İdeathon ve kariyer zirveleriyle dolu dinamik bir ekosistem.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Yapay zeka ve topluluk otomasyonu gibi pratik projeler geliştirme imkanı.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Proje yönetimi ve kurumsal sistem analizi alanlarında gerçek dünya tecrübesi.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

      {/* 3. Counters / Parallax Stats */}
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-80 grayscale"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-900/80 to-brand-900/50" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            {/* Kutu 1 */}
            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
              <Users className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              {/* SABIS'ten gelen sayının yanına + koyuyoruz */}
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{actualMemberCount}+</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Aktif Üye</div>
            </div>

            {/* Kutu 2 */}
            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
              <CalendarIcon className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{actualTotalEvents}</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Etkinlik</div>
            </div>

            {/* Kutu 3 */}
            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
              <Clock className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">Sınırsız</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Tecrübe</div>
            </div>

            {/* Kutu 4 */}
            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
              <FileText className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{projectsCount || '1+'}</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Açık Kaynak Proje</div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Recent Events / News Grid */}
      <section id="events" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Son Olaylar</h2>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Yaklaşan Etkinliklerimiz</h3>
            </div>
            <Link href="/events" className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-600 transition-all duration-200">
              Tümünü Görüntüle <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(!upcomingEvents || upcomingEvents.length === 0) ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-heading font-semibold text-slate-900 mb-2">Yakında Görüşmek Üzere</h4>
                <p className="text-slate-500">Şu an için listelenmiş yeni bir etkinlik bulunmamaktadır. Sosyal medya hesaplarımızı takipte kalın!</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <Link href={`/events/${event.slug}`} key={event.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center text-brand-300">
                        <CalendarIcon className="h-16 w-16 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-brand-700 shadow-sm">
                        {new Date(event.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-heading font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-slate-500 text-sm mt-auto">
                      <MapPin className="h-4 w-4 mr-1.5 text-brand-400 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

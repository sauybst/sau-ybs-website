import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Calendar as CalendarIcon, MapPin, ArrowRight, Target, Lightbulb, Trophy, Users, Briefcase, Clock, FileText } from 'lucide-react'

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

  return (
    <main className="min-h-screen flex flex-col pt-16">
      {/* 1. Hero Section (Parallax Video/Image Placeholder) */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-brand-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/60 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 text-white text-sm font-medium">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            Topluluğumuza Katılın
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white tracking-tight mb-6 leading-tight">
            Geleceği Şekillendiren <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Bilişimciler
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-brand-100 font-light leading-relaxed">
            Başarılı bir kariyerin arkasında, daima başarılı insanlar vardır. Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link href="#events" className="rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-500 hover:-translate-y-1 transition-all duration-300 text-center">
              Etkinlikleri Keşfet
            </Link>
            <Link href="/board" className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 text-center flex items-center justify-center gap-2">
              Biz Kimiz? <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <ArrowRight className="w-6 h-6 rotate-90" />
        </div>
      </section>

      {/* 2. Features / About Us Summary */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Peki, Biz Kimiz?</h2>
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Önce biraz kendimizden bahsedelim</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="mx-auto w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Target className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-heading font-bold text-slate-900 mb-4">Amacımız</h4>
              <p className="text-slate-600 leading-relaxed font-light">
                Öğrencilerde takım çalışması, liderlik ve analitik düşünme becerilerini geliştirmek. Bilişim ve yönetim bilimlerini harmanlayarak sektöre nitelikli yetenekler kazandırmak.
              </p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="mx-auto w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-heading font-bold text-slate-900 mb-4">Vizyonumuz</h4>
              <p className="text-slate-600 leading-relaxed font-light">
                Sadece üniversite içinde değil, ulusal çapta teknoloji ve bilişim ekosistemine yön veren, yenilikçi projeler üreten öncü bir öğrenci topluluğu olmak.
              </p>
            </div>
            <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="mx-auto w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-heading font-bold text-slate-900 mb-4">Neden Biz?</h4>
              <p className="text-slate-600 leading-relaxed font-light">
                Düzenlediğimiz hackathonlar, zirveler, sektörel eğitimler ve güçlü mezun ağımız ile üyelerimize benzersiz bir kariyer hazırlık ortamı sunuyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Counters / Parallax Stats */}
      <section className="relative py-24 bg-brand-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://sakaryasehirhafizasi.gov.tr/wp-content/uploads/2021/01/MG_7029-1024x683-1.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 to-brand-900/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="p-6">
              <Users className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{membersCount || '10+'}</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Aktif Üye</div>
            </div>
            <div className="p-6">
              <CalendarIcon className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{eventsCount || '25+'}</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Etkinlik</div>
            </div>
            <div className="p-6">
              <Clock className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">Sınırsız</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Tecrübe</div>
            </div>
            <div className="p-6">
              <FileText className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{projectsCount || '5+'}</div>
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

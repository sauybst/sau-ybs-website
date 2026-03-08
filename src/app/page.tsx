import { createClient } from '@/utils/supabase/server'
import { syncSabisData } from '@/actions/sabisSync'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  MapPin,
  ArrowRight,
  Target,
  Lightbulb,
  Trophy,
  Users,
  Clock,
  FileText,
  CheckCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type UpcomingEvent = {
  id: string | number
  slug: string
  title: string
  event_date: string
  location: string | null
  image_url: string | null
}

type HomeMetrics = {
  memberCount: number
  totalEvents: string
  projectsCount: number
}

type IdentityCardItem = {
  title: string
  icon: LucideIcon
  bullets: string[]
}

const FALLBACK_MEMBER_COUNT = 650
const FALLBACK_TOTAL_EVENTS = '50+'
const FALLBACK_PROJECTS_COUNT = 1

const identityCards: IdentityCardItem[] = [
  {
    title: 'Amacımız',
    icon: Target,
    bullets: [
      'Öğrencilerde takım çalışması, liderlik ve analitik düşünme becerilerini geliştirmek.',
      'Bilişim ve yönetim bilimlerini harmanlayarak sektöre nitelikli yetenekler kazandırmak.',
    ],
  },
  {
    title: 'Vizyonumuz',
    icon: Lightbulb,
    bullets: [
      'Sadece üniversite içinde değil, ulusal çapta teknoloji ve bilişim ekosistemine yön vermek.',
      'Sektörel sorunlara çözüm sunan, yenilikçi projeler üreten öncü bir öğrenci topluluğu olmak.',
    ],
  },
  {
    title: 'Neden Biz?',
    icon: Trophy,
    bullets: [
      'İdeathon ve kariyer zirveleriyle dolu dinamik bir ekosistem.',
      'Yapay zeka ve topluluk otomasyonu gibi pratik projeler geliştirme imkanı.',
      'Proje yönetimi ve kurumsal sistem analizi alanlarında gerçek dünya tecrübesi.',
    ],
  },
]

function logIfError(scope: string, error: unknown) {
  if (!error) return
  console.error(`[HomeV2:${scope}]`, error)
}

async function getHomeData() {
  const supabase = await createClient()

  const [eventsResult, membersResult, eventsCountResult, projectsResult, sabisData] = await Promise.all([
    supabase
      .from('events')
      .select('id,slug,title,event_date,location,image_url')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    syncSabisData(),
  ])

  logIfError('upcoming-events', eventsResult.error)
  logIfError('members-count', membersResult.error)
  logIfError('events-count', eventsCountResult.error)
  logIfError('projects-count', projectsResult.error)

  const upcomingEvents = (eventsResult.data ?? []) as UpcomingEvent[]

  const memberCount =
    sabisData.memberCount ?? membersResult.count ?? FALLBACK_MEMBER_COUNT

  const totalEvents =
    sabisData.totalEventCount ??
    (eventsCountResult.count ? `${eventsCountResult.count}+` : FALLBACK_TOTAL_EVENTS)

  const projectsCount = projectsResult.count ?? FALLBACK_PROJECTS_COUNT

  const metrics: HomeMetrics = {
    memberCount,
    totalEvents,
    projectsCount,
  }

  return { upcomingEvents, metrics }
}

function IdentityCard({ item }: { item: IdentityCardItem }) {
  const Icon = item.icon

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-heading font-bold text-slate-900 mb-4">{item.title}</h4>
        <ul className="mt-2 text-left space-y-4 text-sm md:text-base text-slate-700 font-normal leading-relaxed w-full font-montserrat">
          {item.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function EmptyUpcomingEvents() {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
      <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <CalendarIcon className="w-8 h-8 text-slate-400" />
      </div>
      <h4 className="text-lg font-heading font-semibold text-slate-900 mb-2">Yakında Görüşmek Üzere</h4>
      <p className="text-slate-500">
        Şu an için listelenmiş yeni bir etkinlik bulunmamaktadır. Sosyal medya hesaplarımızı takipte kalın!
      </p>
    </div>
  )
}

function UpcomingEventCard({ event }: { event: UpcomingEvent }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-64 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {event.image_url ? (
          <>
            <div className="absolute inset-0 opacity-50">
              <img
                src={event.image_url}
                alt=""
                className="object-cover w-full h-full blur-xl scale-125 group-hover:scale-150 transition-transform duration-700"
              />
            </div>
            <img
              src={event.image_url}
              alt={event.title}
              className="relative z-10 object-contain w-full h-full p-3 group-hover:scale-105 transition-transform duration-700 drop-shadow-xl"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center text-brand-300">
            <CalendarIcon className="h-16 w-16 opacity-50" />
          </div>
        )}

        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-sm text-brand-700 shadow-sm border border-white/50">
            {new Date(event.event_date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-heading font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {event.title}
        </h3>
        <div className="flex items-center text-slate-500 text-sm mt-auto">
          <MapPin className="h-4 w-4 mr-1.5 text-brand-400 flex-shrink-0" />
          <span className="truncate">{event.location ?? 'Belirtilmedi'}</span>
        </div>
      </div>
    </Link>
  )
}

export default async function HomeV2() {
  const { upcomingEvents, metrics } = await getHomeData()

  return (
    <main className="min-h-[100dvh] flex flex-col pt-16">
      <section className="relative flex-1 flex items-center justify-center overflow-hidden bg-brand-900 py-12 sm:py-24">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/hero-arkaplan.jpg')" }}
        />
        <div className="absolute inset-0 bg-brand-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/20 to-transparent" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="w-full sm:w-auto bg-white/10 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-5 mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight break-words">
              Geleceği Analiz Et,
              <br />
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300"
                style={{ WebkitTextStroke: '1.5px rgba(30, 58, 138, 0.8)' }}
              >
                Sistemi Yönet
              </span>
            </h1>
          </div>

          <div className="w-full sm:w-auto bg-white/10 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-4 mb-8">
            <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-white font-medium leading-relaxed font-montserrat">
              Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu; veriyi bilgiye, teknolojiyi stratejik bir güce
              dönüştüren yenilikçi analistlerin buluşma noktasıdır. İş dünyası ile dijital dünya arasındaki köprüyü birlikte
              inşa ediyoruz.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto px-2 sm:px-0">
            <Link
              href="/events"
              className="rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-500 hover:-translate-y-1 transition-all duration-300 text-center"
            >
              Etkinlikleri Keşfet
            </Link>
            <Link
              href="/board"
              className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Biz Kimiz? <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50 hidden sm:block">
          <ArrowRight className="w-6 h-6 rotate-90" />
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.15] md:opacity-[0.40] z-0 overflow-hidden text-slate-300 transition-opacity duration-500">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; 250,0; -150,0; 0,0" dur="29s" repeatCount="indefinite" />
              <g>
                <animateTransform attributeName="transform" type="translate" values="0,0; 0,120; 0,-80; 0,0" dur="19s" repeatCount="indefinite" />
                <text x="80" y="120" className="translate-x-[200px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="18">
                  <tspan fill="#2563eb">&lt;Process </tspan>
                  <tspan fill="#64748b">id=</tspan>
                  <tspan fill="#059669">"erp_flow_01"</tspan>
                  <tspan fill="#2563eb">&gt;</tspan>
                </text>
                <text x="800" y="150" className="-translate-x-[250px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="16">
                  <tspan fill="#9333ea">def </tspan>
                  <tspan fill="#2563eb">train_model</tspan>
                  <tspan fill="#64748b">(dataset):</tspan>
                </text>
                <g className="translate-x-[150px] md:translate-x-0 transition-transform duration-700">
                  <circle cx="500" cy="100" r="25" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="500" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,4" />
                  <polyline points="500,85 500,100 510,100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            </g>

            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; -180,0; 150,0; 0,0" dur="23s" repeatCount="indefinite" />
              <g>
                <animateTransform attributeName="transform" type="translate" values="0,0; 0,-100; 0,130; 0,0" dur="17s" repeatCount="indefinite" />
                <g className="translate-x-[200px] md:translate-x-0 transition-transform duration-700">
                  <rect x="250" y="250" width="120" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
                  <line x1="270" y1="270" x2="330" y2="270" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="270" y1="285" x2="350" y2="285" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="150" cy="280" r="25" fill="none" stroke="currentColor" strokeWidth="3" />
                </g>
                <g className="-translate-x-[200px] md:translate-x-0 transition-transform duration-700">
                  <polygon points="650,220 700,270 650,320 600,270" fill="none" stroke="currentColor" strokeWidth="3" />
                  <line x1="650" y1="245" x2="650" y2="295" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <line x1="625" y1="270" x2="675" y2="270" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </g>
                <text x="750" y="380" className="-translate-x-[200px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="16">
                  <tspan fill="#9333ea">SELECT </tspan>
                  <tspan fill="#64748b">strategy </tspan>
                  <tspan fill="#9333ea">FROM </tspan>
                  <tspan fill="#64748b">future;</tspan>
                </text>
              </g>
            </g>

            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; 160,0; -220,0; 0,0" dur="31s" repeatCount="indefinite" />
              <g>
                <animateTransform attributeName="transform" type="translate" values="0,0; 0,-80; 0,90; 0,0" dur="23s" repeatCount="indefinite" />
                <text x="60" y="450" className="translate-x-[150px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="15">
                  <tspan fill="#9333ea">import </tspan>
                  <tspan fill="#64748b">{'{'} Model {'}'}</tspan>
                  <tspan fill="#9333ea">from </tspan>
                  <tspan fill="#059669">'ai-engine'</tspan>
                  <tspan fill="#64748b">;</tspan>
                </text>
                <text x="120" y="650" className="translate-x-[200px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="18">
                  <tspan fill="#9333ea">const </tspan>
                  <tspan fill="#64748b">optimize = (data) </tspan>
                  <tspan fill="#2563eb">=&gt; </tspan>
                  <tspan fill="#64748b">data.</tspan>
                  <tspan fill="#2563eb">map</tspan>
                  <tspan fill="#64748b">(analyze);</tspan>
                </text>
                <text x="750" y="600" className="-translate-x-[250px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="16">
                  <tspan fill="#9333ea">await </tspan>
                  <tspan fill="#64748b">system.</tspan>
                  <tspan fill="#2563eb">automate</tspan>
                  <tspan fill="#64748b">();</tspan>
                </text>
                <text x="700" y="750" className="-translate-x-[150px] md:translate-x-0 transition-transform duration-700" fontFamily="monospace" fontSize="15">
                  <tspan fill="#64748b">{'{'} </tspan>
                  <tspan fill="#059669">"status"</tspan>
                  <tspan fill="#64748b">: </tspan>
                  <tspan fill="#d97706">200</tspan>
                  <tspan fill="#64748b">, </tspan>
                  <tspan fill="#059669">"role"</tspan>
                  <tspan fill="#64748b">: </tspan>
                  <tspan fill="#059669">"admin"</tspan>
                  <tspan fill="#64748b"> {'}'}</tspan>
                </text>
                <g className="translate-x-[100px] md:translate-x-0 transition-transform duration-700">
                  <path d="M 850 450 L 910 450 L 910 520 C 895 535 865 505 850 520 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                  <line x1="865" y1="470" x2="895" y2="470" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="865" y1="490" x2="885" y2="490" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </g>
              </g>
            </g>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Kurumsal Kimliğimiz</h2>
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Önce Kendimizi Tanıtarak Başlayalım</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {identityCards.map((item) => (
              <IdentityCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-80 grayscale"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-900/80 to-brand-900/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
              <Users className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{metrics.memberCount}+</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Aktif Üye</div>
            </div>

            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
              <CalendarIcon className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{metrics.totalEvents}</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Etkinlik</div>
            </div>

            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
              <Clock className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-2xl font-heading font-extrabold text-white mb-3 drop-shadow-md">Gerçek Dünya Deneyimi</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Sürekli Gelişim</div>
            </div>

            <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
              <FileText className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
              <div className="text-5xl font-heading font-extrabold text-white mb-3 drop-shadow-md">{metrics.projectsCount}+</div>
              <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">Açık Kaynak Proje</div>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">Son Olaylar</h2>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Yaklaşan Etkinliklerimiz</h3>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-600 transition-all duration-200"
            >
              Tümünü Görüntüle <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.length === 0 ? (
              <EmptyUpcomingEvents />
            ) : (
              upcomingEvents.map((event) => <UpcomingEventCard key={event.id} event={event} />)
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

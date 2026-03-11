import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Users, Calendar as CalendarIcon, Clock, FileText } from 'lucide-react'

import { getHomeData } from '@/lib/home-data'
import { identityCards } from '@/data/identity-cards'
import FloatingTechBackground from '@/components/FloatingTechBackground'
import IdentityCard from '@/components/home/IdentityCard'
import UpcomingEventCard from '@/components/home/UpcomingEventCard'
import EmptyUpcomingEvents from '@/components/home/EmptyUpcomingEvents'
import MetricCard from '@/components/home/MetricCard'
import HomeJsonLd from '@/components/home/HomeJsonLd'

/* ── SEO: Sayfa-Özel Metadata ── */
export const metadata: Metadata = {
  title: 'Ana Sayfa',
  description:
    'Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu resmi web sitesi. Etkinlikler, projeler, staj ilanları ve topluluk haberleri.',
  alternates: { canonical: '/' },
}

/* ── Metrik kartları verisi ── */
const metricCardsConfig = [
  { icon: Users, suffix: '+', label: 'Aktif Üye', key: 'memberCount' as const },
  { icon: CalendarIcon, suffix: '', label: 'Etkinlik', key: 'totalEvents' as const },
  { icon: Clock, value: 'Gerçek Dünya Deneyimi', label: 'Sürekli Gelişim', key: null, textSize: 'text-2xl' },
  { icon: FileText, suffix: '+', label: 'Açık Kaynak Proje', key: 'projectsCount' as const },
]

export default async function HomePage() {
  const { upcomingEvents, metrics } = await getHomeData()

  return (
    <main className="min-h-[100dvh] flex flex-col pt-16">
      {/* SEO: JSON-LD Yapılandırılmış Veri */}
      <HomeJsonLd />

      {/* ── Hero Section ── */}
      <section
        id="hero"
        aria-label="Ana tanıtım"
        className="relative flex-1 flex items-center justify-center overflow-hidden bg-brand-900 py-12 sm:py-24"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/hero-arkaplan.webp')" }}
          role="presentation"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-brand-900/40" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/20 to-transparent" aria-hidden="true" />

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

        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50 hidden sm:block" aria-hidden="true">
          <ArrowRight className="w-6 h-6 rotate-90" />
        </div>
      </section>

      {/* ── Kurumsal Kimlik Section ── */}
      <section id="identity" aria-label="Kurumsal kimliğimiz" className="py-24 bg-white relative overflow-hidden">
        <FloatingTechBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">Kurumsal Kimliğimiz</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Önce Kendimizi Tanıtarak Başlayalım</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {identityCards.map((item) => (
              <IdentityCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrikler Section ── */}
      <section id="metrics" aria-label="Topluluk istatistikleri" className="relative py-24 bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-80 grayscale"
          style={{ backgroundImage: "url('/background.webp')" }}
          role="presentation"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-900/80 to-brand-900/50" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Topluluk İstatistikleri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {metricCardsConfig.map((card) => {
              const displayValue = card.key
                ? `${metrics[card.key]}${card.suffix}`
                : card.value!
              return (
                <MetricCard
                  key={card.label}
                  icon={card.icon}
                  value={displayValue}
                  label={card.label}
                  textSize={card.textSize}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Yaklaşan Etkinlikler Section ── */}
      <section id="events" aria-label="Yaklaşan etkinlikler" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">Son Olaylar</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Yaklaşan Etkinliklerimiz</h2>
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
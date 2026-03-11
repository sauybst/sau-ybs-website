import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Github, MapPin } from 'lucide-react'
import { NAV_ITEMS, LEGAL_LINKS, SOCIAL_LINKS, EXTERNAL_LINKS } from '@/utils/navigation'

// Lucide ikon adını bileşene eşleyen yardımcı harita
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Github,
}

export default function Footer() {
    return (
        <footer className="relative bg-slate-950 overflow-hidden" aria-labelledby="footer-heading">

            {/* Üst Gradient Sınır Çizgisi */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-70"></div>

            {/* Arka Plan Derinlik/Işık Efekti */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="relative z-10 mx-auto max-w-7xl px-6 pb-6 pt-12 sm:pt-16 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">

                    {/* 1. SÜTUN: Logo ve Hakkımızda */}
                    <div className="space-y-8">
                        <div className="flex items-center">
                            <img
                                src="/logotip.webp"
                                alt="SAU YBS Logo"
                                className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
                            />
                        </div>
                        <p className="text-sm leading-6 text-slate-300 max-w-xs font-light">
                            Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu. <br className="hidden sm:block" />
                            <span className="mt-2 block font-medium text-slate-200">Gelecekte başarılı bir kariyerin arkasında, daima başarılı insanlar vardır.</span>
                        </p>

                        {/* Sosyal Medya İkonları */}
                        <div className="flex space-x-5">
                            {SOCIAL_LINKS.map((social) => {
                                const Icon = ICON_MAP[social.icon]
                                if (!Icon) return null
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-brand-400 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <span className="sr-only">{social.name}</span>
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    {/* SAĞ KISIM: Bağlantılar ve İletişim */}
                    <div className="mt-12 xl:col-span-2 xl:mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* 2. SÜTUN: Topluluk */}
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Topluluk</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {NAV_ITEMS.filter(item => ['/', '/events', '/projects', '/board'].includes(item.href)).map((item) => (
                                        <li key={item.href}>
                                            <Link href={item.href} className="group inline-flex items-center text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">{item.name === 'Ana Sayfa' ? 'Ana Sayfa' : item.name === '/board' ? 'Hakkımızda' : item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* 3. SÜTUN: Kariyer & Medya */}
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Kariyer & Medya</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {NAV_ITEMS.filter(item => ['/jobs', '/blogs'].includes(item.href)).map((item) => (
                                        <li key={item.href}>
                                            <Link href={item.href} className="group inline-flex items-center text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* 4. SÜTUN: İletişim Bilgileri */}
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">İletişim</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li className="flex items-start">
                                        <MapPin className="h-5 w-5 text-brand-500 mr-3 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm leading-6 text-slate-300">
                                            Sakarya Üniversitesi<br />
                                            Esentepe Kampüsü
                                            İşletme Fakültesi
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Mail className="h-5 w-5 text-brand-500 mr-3 flex-shrink-0 mt-0.5" />
                                        <a href={`mailto:${EXTERNAL_LINKS.CONTACT_EMAIL}`} className="text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                            {EXTERNAL_LINKS.CONTACT_EMAIL}
                                        </a>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Alt Bilgi ve Yasal Linkler */}
                <div className="relative z-10 mt-12 border-t border-slate-800/80 pt-8 sm:mt-16 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs leading-5 text-slate-400 text-center md:text-left">
                        &copy; {new Date().getFullYear()} Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu. Tüm hakları saklıdır.
                    </p>

                    <div className="flex items-center gap-x-6">
                        {LEGAL_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs leading-5 text-slate-400 hover:text-brand-400 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
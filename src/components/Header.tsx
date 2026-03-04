import Link from 'next/link'

export default function Header() {
    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100/50 shadow-sm transition-all duration-300">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <span className="sr-only">SAU YBS</span>
                            <div className="h-10 w-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                                YBS
                            </div>
                            <span className="font-heading font-extrabold text-2xl tracking-tight text-brand-900 hidden sm:block">SAU YBS</span>
                        </Link>
                        <div className="ml-12 hidden space-x-8 lg:flex">
                            <Link href="/" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Ana Sayfa</Link>
                            <Link href="/events" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Etkinlikler</Link>
                            <Link href="/blogs" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Duyurular & Blog</Link>
                            <Link href="/projects" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Projeler</Link>
                            <Link href="/board" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Yönetim Kurulu</Link>
                        </div>
                    </div>
                    <div className="ml-10 flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="hidden sm:inline-flex items-center justify-center rounded-full bg-brand-50 px-5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition-all duration-200"
                        >
                            Giriş Yap
                        </Link>
                        <Link
                            href="/jobs"
                            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-500 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            Kariyer
                        </Link>
                    </div>
                </div>
                {/* Mobile Navigation */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 py-3 border-t border-brand-50 lg:hidden">
                    <Link href="/events" className="text-sm font-medium text-slate-600 hover:text-brand-600">Etkinlikler</Link>
                    <Link href="/blogs" className="text-sm font-medium text-slate-600 hover:text-brand-600">Blog</Link>
                    <Link href="/projects" className="text-sm font-medium text-slate-600 hover:text-brand-600">Projeler</Link>
                    <Link href="/board" className="text-sm font-medium text-slate-600 hover:text-brand-600">Hakkımızda</Link>
                </div>
            </nav>
        </header>
    )
}

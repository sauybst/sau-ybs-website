export default function Footer() {
    return (
        <footer className="bg-slate-900" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                YBS
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight text-white">SAU YBS</span>
                        </div>
                        <p className="text-sm leading-6 text-gray-300">
                            Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu. <br />
                            Geleceği şekillendiren bilişimciler.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white">Topluluk</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li><a href="/board" className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">Hakkımızda</a></li>
                                    <li><a href="/events" className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">Etkinlikler</a></li>
                                    <li><a href="/projects" className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">Öğrenci Projeleri</a></li>
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-white">Kariyer & İletişim</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li><a href="/jobs" className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">Staj & İş İlanları</a></li>
                                    <li><a href="/blogs" className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">Duyurular</a></li>
                                    <li><a href="mailto:info@sauybs.com" className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">İletişime Geçin</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-xs leading-5 text-gray-400">&copy; {new Date().getFullYear()} Sakarya Üniversitesi YBS Topluluğu. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    )
}

import { Facebook, Twitter, Instagram, Linkedin, Mail, Github, MapPin } from 'lucide-react'

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
                                src="/logotip.png" 
                                alt="SAU YBS Logo" 
                                className="h-10 sm:h-12 w-auto object-contain drop-shadow-md" 
                            />
                        </div>
                        <p className="text-sm leading-6 text-slate-300 max-w-xs font-light">
                            Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu. <br className="hidden sm:block" />
                            <span className="mt-2 block font-medium text-slate-200">Gelecekte başarılı bir kariyerin arkasında, daima başarılı insanlar vardır.</span>
                        </p>
                        
                        <div className="flex space-x-5">
                            <a href="https://www.facebook.com/sauybst/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-400 hover:-translate-y-1 transition-all duration-300">
                                <span className="sr-only">Facebook</span>
                                <Facebook className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a href="https://www.instagram.com/sauybst/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-400 hover:-translate-y-1 transition-all duration-300">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a href="https://x.com/SAUYBST" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-400 hover:-translate-y-1 transition-all duration-300">
                                <span className="sr-only">Twitter</span>
                                <Twitter className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a href="https://www.linkedin.com/in/sauybst/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-400 hover:-translate-y-1 transition-all duration-300">
                                <span className="sr-only">LinkedIn</span>
                                <Linkedin className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a href="https://github.com/sauybst" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-400 hover:-translate-y-1 transition-all duration-300">
                                <span className="sr-only">Github</span>
                                <Github className="h-5 w-5" aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                    
                    {/* SAĞ KISIM: 3 Sütunlu Bağlantılar ve İletişim */}
                    <div className="mt-12 xl:col-span-2 xl:mt-0">
                        {/* md:grid-cols-2 yerine md:grid-cols-3 yapıldı */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* 2. SÜTUN: Topluluk */}
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Topluluk</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <a href="/board" className="group inline-flex items-center text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">Hakkımızda</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/events" className="group inline-flex items-center text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">Etkinlikler</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/projects" className="group inline-flex items-center text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">Öğrenci Projeleri</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* 3. SÜTUN: Kariyer & Medya */}
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Kariyer & Medya</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <a href="/jobs" className="group inline-flex items-center text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">Staj & İş İlanları</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/blogs" className="group inline-flex items-center text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">Duyurular & Blog</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* 4. SÜTUN: İletişim Bilgileri (YENİ EKLENEN KISIM) */}
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
                                        <a href="mailto:sauybst@gmail.com" className="text-sm leading-6 text-slate-300 hover:text-brand-400 transition-colors">
                                            sauybst@gmail.com
                                        </a>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
                
                    <div className="relative z-10 mt-12 border-t border-slate-800/80 pt-8 sm:mt-16 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs leading-5 text-slate-400 text-center md:text-left">
                        &copy; {new Date().getFullYear()} Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu. Tüm hakları saklıdır.
                    </p>
                    
                    {/* YENİ EKLENEN YASAL METİNLER */}
                    <div className="flex items-center gap-x-6">
                        <a href="/privacyPolicy" className="text-xs leading-5 text-slate-400 hover:text-brand-400 transition-colors">
                            Aydınlatma Metni
                        </a>
                        <a href="/cookiePolicy" className="text-xs leading-5 text-slate-400 hover:text-brand-400 transition-colors">
                            Çerez Politikası
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
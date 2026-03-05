import { Facebook, Twitter, Instagram, Linkedin, Mail, Github } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-brand-900 border-t border-brand-500" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="mx-auto max-w-7xl px-6 pb-6 pt-10 sm:pt-12 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                YBS
                            </div>
                            <span className="font-heading font-extrabold text-2xl tracking-tight text-white">SAU YBS</span>
                        </div>
                        <p className="text-sm leading-6 text-brand-100 max-w-xs">
                            Sakarya Üniversitesi Yönetim Bilişim Sistemleri Topluluğu. <br />
                            Gelecekte başarılı bir kariyerin arkasında, daima başarılı insanlar vardır.
                        </p>
                        
                        <div className="flex space-x-5">
                            <a 
                                href="https://www.facebook.com/sauybst/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-brand-100 hover:text-white transition-colors"
                            >
                                <span className="sr-only">Facebook</span>
                                <Facebook className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a 
                                href="https://www.instagram.com/sauybst/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-brand-100 hover:text-white transition-colors"
                            >
                                <span className="sr-only">Instagram</span>
                                <Instagram className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a 
                                href="https://x.com/SAUYBST" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-brand-100 hover:text-white transition-colors"
                            >
                                <span className="sr-only">Twitter</span>
                                <Twitter className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a 
                                href="https://www.linkedin.com/in/sauybst/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-brand-100 hover:text-white transition-colors"
                            >
                                <span className="sr-only">LinkedIn</span>
                                <Linkedin className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a 
                                href="https://github.com/sauybst" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-brand-100 hover:text-white transition-colors"
                            >
                                <span className="sr-only">Github</span>
                                <Github className="h-5 w-5" aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Topluluk</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li><a href="/board" className="text-sm leading-6 text-brand-100 hover:text-white transition-colors">Hakkımızda</a></li>
                                    <li><a href="/events" className="text-sm leading-6 text-brand-100 hover:text-white transition-colors">Etkinlikler</a></li>
                                    <li><a href="/projects" className="text-sm leading-6 text-brand-100 hover:text-white transition-colors">Öğrenci Projeleri</a></li>
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Kariyer & İletişim</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li><a href="/jobs" className="text-sm leading-6 text-brand-100 hover:text-white transition-colors">Staj & İş İlanları</a></li>
                                    <li><a href="/blogs" className="text-sm leading-6 text-brand-100 hover:text-white transition-colors">Duyurular & Blog</a></li>
                                    <li><a href="mailto:sauybst@gmail.com" className="text-sm leading-6 text-brand-100 hover:text-white transition-colors flex items-center gap-2"><Mail className="h-4 w-4" /> İletişime Geçin</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 border-t border-brand-800/50 pt-6 sm:mt-10 lg:mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs leading-5 text-brand-200/60">
                        &copy; {new Date().getFullYear()} Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu. Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </footer>
    )
}
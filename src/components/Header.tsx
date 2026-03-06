"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const closeMenu = () => setIsMenuOpen(false)

    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100/50 shadow-sm transition-all duration-300">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">
                    
                    {/* SOL KISIM: Logo (flex-1 ile alanı doldurur, linkleri ortaya iter) */}
                    <div className="flex lg:flex-1">
                        <Link href="/" onClick={closeMenu} className="flex items-center group">
                            <span className="sr-only">SAU YBS</span>
                            <img 
                                src="/logotip.png" 
                                alt="SAU YBS Logo" 
                                className="h-8 sm:h-10 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" 
                            />
                        </Link>
                    </div>
                    
                    {/* ORTA KISIM: Sayfa Bağlantıları (Tam merkeze hizalanır) */}
                    <div className="hidden lg:flex items-center justify-center gap-x-8">
                        <Link href="/" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Ana Sayfa</Link>
                        <Link href="/events" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Etkinlikler</Link>
                        <Link href="/blogs" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Duyurular & Blog</Link>
                        <Link href="/projects" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Projeler</Link>
                        <Link href="/board" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Hakkımızda</Link>
                    </div>

                    {/* SAĞ KISIM: Buton ve Mobil Menü Tetikleyici (flex-1 ile sağa yaslanır) */}
                    <div className="flex flex-1 items-center justify-end gap-4">
                        {/* Masaüstü Butonu */}
                        <a 
                            href="https://topluluk.sabis.sakarya.edu.tr/sau-yonetim-bilisim-sistemleri-ogrenci-toplulugu" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hidden lg:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold shadow-sm hover:bg-brand-700 hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            Topluluğumuza Katılın
                        </a>

                        {/* Mobil Menü Butonu (Sadece telefonda gözükür, o da sağa yaslı kalır) */}
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 lg:hidden"
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Menüyü Aç</span>
                            {isMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {/* MOBİL AKORDİYON MENÜ */}
                <div 
                    className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                        isMenuOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="flex flex-col space-y-1 pt-2 border-t border-brand-50">
                        <Link href="/" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Ana Sayfa</Link>
                        <Link href="/events" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Etkinlikler</Link>
                        <Link href="/blogs" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Duyurular & Blog</Link>
                        <Link href="/projects" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Projeler</Link>
                        <Link href="/board" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Hakkımızda</Link>
                        
                        {/* Mobil Menüdeki Buton */}
                        <div className="px-3 pt-4 pb-2 mt-2 border-t border-slate-100">
                            <a 
                                href="https://topluluk.sabis.sakarya.edu.tr/sau-yonetim-bilisim-sistemleri-ogrenci-toplulugu" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={closeMenu}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full bg-brand-600 text-white text-[15px] font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                            >
                                <span className="flex h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse"></span>
                                Topluluğumuza Katılın
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
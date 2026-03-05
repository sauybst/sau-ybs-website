"use client"

import { useState } from 'react'
import Link from 'next/link'
// 1. DEĞİŞİKLİK: MoreVertical yerine Menu ikonunu içe aktardık
import { Menu, X } from 'lucide-react'

export default function Header() {
    // Mobil menü durum yönetimi
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Tıklama sonrası menüyü kapatan yardımcı fonksiyon
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const closeMenu = () => setIsMenuOpen(false)

    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100/50 shadow-sm transition-all duration-300">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">
                    
                    {/* LOGO VE MASAÜSTÜ MENÜ */}
                    <div className="flex items-center">
                        <Link href="/" onClick={closeMenu} className="flex items-center gap-3 group">
                            <span className="sr-only">SAU YBS</span>
                            <img 
                                src="/favicon.ico" 
                                alt="SAU YBS Logo" 
                                className="h-10 w-10 object-contain drop-shadow-lg rounded-md group-hover:scale-105 transition-transform duration-300" 
                            />
                            <span className="font-heading font-extrabold text-2xl tracking-tight text-brand-900">SAU YBS</span>
                        </Link>
                        
                        {/* Masaüstü Navigasyon */}
                        <div className="ml-12 hidden space-x-8 lg:flex">
                            <Link href="/" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Ana Sayfa</Link>
                            <Link href="/events" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Etkinlikler</Link>
                            <Link href="/blogs" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Duyurular & Blog</Link>
                            <Link href="/projects" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Projeler</Link>
                            <Link href="/board" className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors">Yönetim Kurulu</Link>
                        </div>
                    </div>

                    {/* MOBİL MENÜ TETİKLEYİCİ (Hamburger İkonu) */}
                    <div className="flex items-center lg:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
                            onClick={toggleMenu}
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Menüyü Aç</span>
                            {/* 2. DEĞİŞİKLİK: Burada MoreVertical yerine Menu kullandık */}
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
                        isMenuOpen ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="flex flex-col space-y-1 pt-2 border-t border-brand-50">
                        <Link href="/" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Ana Sayfa</Link>
                        <Link href="/events" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Etkinlikler</Link>
                        <Link href="/blogs" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Duyurular & Blog</Link>
                        <Link href="/projects" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Projeler</Link>
                        <Link href="/board" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">Hakkımızda</Link>
                    </div>
                </div>
            </nav>
        </header>
    )
}
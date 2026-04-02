"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Ticket, ChevronDown, Users } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, EXTERNAL_LINKS } from '@/utils/navigation'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const pathname = usePathname()
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const closeMenu = () => {
        setIsMenuOpen(false)
        setIsDropdownOpen(false)
    }

    // URL her değiştiğinde menüleri otomatik kapatan efekt
    useEffect(() => {
        setIsMenuOpen(false)
        setIsDropdownOpen(false)
    }, [pathname])

    // Ekranda herhangi bir yere tıklandığında, tıklanan yer menünün dışındaysa dropdown'ı kapat
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100/50 shadow-sm transition-all duration-300">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between py-4">

                    {/* SOL KISIM: Logo */}
                    <div className="flex lg:flex-1">
                        <Link href="/" className="flex items-center group -my-2 sm:-my-3 -ml-2 lg:-ml-6">
                            <span className="sr-only">SAU YBS</span>
                            <Image
                                src="/logotip.webp"
                                alt="SAU YBS Logo"
                                width={364}
                                height={84}
                                priority 
                                className="h-12 sm:h-16 w-auto object-contain drop-shadow-sm origin-left group-hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                    </div>

                    {/* ORTA KISIM: Sayfa Bağlantıları */}
                    <div className="hidden lg:flex items-center justify-center gap-x-8">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-[15px] font-medium text-slate-600 hover:text-brand-600 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* SAĞ KISIM: Buton ve Mobil Menü Tetikleyici */}
                    <div className="flex flex-1 items-center justify-end gap-4">
                        
                        {/* MASAÜSTÜ: Topluluk Portalı Dropdown */}
                        <div className="relative hidden lg:block" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold shadow-sm hover:bg-brand-700 transition-all duration-200"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                                Topluluk Portalı
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Açılır Menü (Dropdown) */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 z-50 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                                    <div className="py-1">
                                        <Link
                                            href="/pasaport"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                                        >
                                            <Ticket className="h-[18px] w-[18px]" />
                                            Pasaportum
                                        </Link>
                                        <div className="h-px bg-slate-100 mx-2"></div>
                                        <a
                                            href={EXTERNAL_LINKS.SABIS_COMMUNITY}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                                        >
                                            <Users className="h-[18px] w-[18px]" />
                                            Topluluğa Katıl
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MOBİL: Hamburger Menü Tetikleyici */}
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 mr-2 sm:mr-4 rounded-md text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 lg:hidden"
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
                    className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-[600px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
                >
                    <div className="flex flex-col space-y-1 pt-2 border-t border-brand-50">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                onClick={closeMenu}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* MOBİL: Alt Kısım Portalı */}
                        <div className="flex flex-col gap-2 px-3 pt-4 pb-2 mt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Topluluk Portalı</span>
                            
                            <Link
                                href="/pasaport"
                                onClick={closeMenu}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors shadow-sm"
                            >
                                <Ticket className="h-5 w-5 text-brand-500" />
                                Pasaportum
                            </Link>

                            <a
                                href={EXTERNAL_LINKS.SABIS_COMMUNITY}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={closeMenu}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-brand-600 text-white text-[15px] font-semibold hover:bg-brand-700 transition-colors shadow-sm"
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
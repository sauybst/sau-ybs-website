'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Lightbulb,
    Briefcase,
    Users,
    UserCog,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { logout } from '@/actions/auth'

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Etkinlikler', href: '/admin/events', icon: Calendar },
    { name: 'Blog & Duyurular', href: '/admin/blogs', icon: FileText },
    { name: 'Projeler', href: '/admin/projects', icon: Lightbulb },
    { name: 'İlanlar', href: '/admin/jobs', icon: Briefcase },
    { name: 'Yönetim Kurulu', href: '/admin/board', icon: Users },
    { name: 'Kullanıcılar', href: '/admin/users', icon: UserCog },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Sayfa değişince mobil menüyü kapat
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Menü açıkken sayfanın scroll'unu kilitle
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const isActiveRoute = (itemHref: string) => {
        if (itemHref === '/admin') return pathname === '/admin'
        return pathname.startsWith(itemHref)
    }

    const SidebarContent = () => (
        <div className="flex flex-col w-64 bg-slate-950 h-full text-slate-300 border-r border-slate-800/50 shadow-2xl">

            {/* Üst Logo Bölümü */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50">
                <Link href="/admin" className="flex items-center group">
                    <span className="sr-only">SAU YBS Panel</span>
                    <img
                        src="/logotip.png"
                        alt="SAU YBS Logo"
                        className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-all duration-300 brightness-0 invert opacity-90 group-hover:opacity-100"
                    />
                </Link>
                {/* Mobilde kapat butonu */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Menü Linkleri */}
            <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = isActiveRoute(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group relative flex items-center px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? 'bg-brand-500/10 text-brand-400'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-1'
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                )}
                                <Icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                                        isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
                                    }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Çıkış Yap */}
            <div className="flex-shrink-0 p-4 border-t border-slate-800/50 bg-slate-900/50">
                <form action={logout} className="w-full">
                    <button
                        type="submit"
                        className="group flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-300"
                    >
                        <LogOut className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Güvenli Çıkış
                    </button>
                </form>
            </div>
        </div>
    )

    return (
        <>
            {/* Masaüstü: sabit sidebar */}
            <div className="hidden lg:flex h-screen">
                <SidebarContent />
            </div>

            {/* Mobil: hamburger butonu */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 shadow-lg hover:bg-slate-800 transition-colors"
                aria-label="Menüyü Aç"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobil: karartma overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobil: slide-in sidebar */}
            <div
                className={`lg:hidden fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <SidebarContent />
            </div>
        </>
    )
}
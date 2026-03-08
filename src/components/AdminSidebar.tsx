'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Lightbulb,
    Briefcase,
    Users,
    UserCog,
    LogOut
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

    // Alt sayfaları da (örneğin /admin/events/create) aktif göstermek için ufak bir kontrol fonksiyonu
    const isActiveRoute = (itemHref: string) => {
        if (itemHref === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(itemHref);
    };

    return (
        <div className="flex flex-col w-64 bg-slate-950 h-screen text-slate-300 border-r border-slate-800/50 shadow-2xl">
            
            {/* Üst Logo Bölümü */}
            <div className="flex items-center justify-center h-20 px-6 border-b border-slate-800/50">
                <Link href="/admin" className="flex items-center justify-center group w-full">
                    <span className="sr-only">SAU YBS Panel</span>
                    {/* brightness-0 invert sınıfı logoyu tamamen beyaza çevirir. Kendi orijinal rengini istersen bu iki sınıfı silebilirsin. */}
                    <img 
                        src="/logotip.png" 
                        alt="SAU YBS Logo" 
                        className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-all duration-300 brightness-0 invert opacity-90 group-hover:opacity-100" 
                    />
                </Link>
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
                                {/* Aktif Sayfa Gösterge Çizgisi */}
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

            {/* Çıkış Yap Bölümü */}
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
}
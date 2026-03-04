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

    return (
        <div className="flex flex-col w-64 bg-slate-900 h-screen text-white">
            <div className="flex items-center justify-center h-16 border-b border-slate-800">
                <h1 className="text-xl font-bold">YBS Panel</h1>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <Icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-slate-800 p-4">
                <form action={logout} className="w-full">
                    <button
                        type="submit"
                        className="flex-shrink-0 group block w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Çıkış Yap
                    </button>
                </form>
            </div>
        </div>
    )
}

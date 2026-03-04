import Link from 'next/link'

export default function Header() {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex w-full items-center justify-between border-b border-indigo-50 py-4 lg:border-none">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="sr-only">SAU YBS</span>
                            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                YBS
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-gray-900 hidden sm:block">SAU YBS</span>
                        </Link>
                        <div className="ml-10 hidden space-x-8 lg:block">
                            <Link href="/events" className="text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors">Etkinlikler</Link>
                            <Link href="/blogs" className="text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors">Duyurular & Blog</Link>
                            <Link href="/projects" className="text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors">Projeler</Link>
                            <Link href="/jobs" className="text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors">Kariyer</Link>
                            <Link href="/board" className="text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors">Yönetim Kurulu</Link>
                        </div>
                    </div>
                    <div className="ml-10 space-x-4">
                        <Link
                            href="/admin"
                            className="inline-block rounded-md border border-transparent bg-indigo-50 px-4 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                            Giriş
                        </Link>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center space-x-6 py-4 lg:hidden">
                    <Link href="/events" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Etkinlikler</Link>
                    <Link href="/blogs" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Blog</Link>
                    <Link href="/projects" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Projeler</Link>
                    <Link href="/board" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Hakkımızda</Link>
                </div>
            </nav>
        </header>
    )
}

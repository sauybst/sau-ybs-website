import AdminSidebar from '@/components/AdminSidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ToastProvider } from '@/components/ToastProvider';

export const metadata = {
    title: 'YBS Yönetim Paneli',
    description: 'SAU YBS Yönetim Paneli',
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Kullanıcının baş harfini avatar için alıyoruz
    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

    return (
        // Tüm admin panelini ToastProvider ile sarmalıyoruz
        <ToastProvider>
            <div className="flex h-screen bg-slate-50">
                <AdminSidebar />
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    
                    {/* YENİLENEN MODERN HEADER */}
                    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 transition-all">
                        <div className="px-6 py-3 lg:px-8 flex justify-between items-center h-16">
                            
                            {/* Sol Taraf: Modern Başlık */}
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-1.5 bg-brand-500 rounded-full shadow-sm"></div>
                                <h1 className="text-xl font-heading font-extrabold text-slate-800 tracking-tight">
                                    Yönetim Paneli
                                </h1>
                            </div>

                            {/* Sağ Taraf: Kullanıcı Profil Modülü */}
                            <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-default group">
                                <div className="flex flex-col text-right hidden sm:flex pl-2">
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Aktif Oturum</span>
                                    <span className="text-sm font-bold text-slate-700 leading-none group-hover:text-brand-600 transition-colors">
                                        {user.email}
                                    </span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 text-brand-700 flex items-center justify-center font-extrabold font-heading shadow-inner border border-brand-200/50">
                                    {userInitial}
                                </div>
                            </div>

                        </div>
                    </header>

                    {/* ANA İÇERİK ALANI */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}
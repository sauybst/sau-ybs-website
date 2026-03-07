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

    return (
        // Tüm admin panelini ToastProvider ile sarmalıyoruz
        <ToastProvider>
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white shadow z-10">
                        <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                            <h1 className="text-lg font-semibold text-gray-900 border-l-4 border-indigo-600 pl-3">
                                Yönetim Paneli
                            </h1>
                            <div className="text-sm text-gray-500">
                                Oturum açık: <span className="font-medium text-gray-900">{user.email}</span>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}
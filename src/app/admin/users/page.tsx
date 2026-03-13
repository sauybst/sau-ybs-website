import { createClient } from '@/utils/supabase/server'
import { Users, ShieldAlert } from 'lucide-react'
import UserRoleCard from './UserRoleCard'
import CreateUserForm from './CreateUserForm'
export const runtime = 'edge';

export const metadata = {
    title: 'Kullanıcı Yönetimi - YBS Admin',
}

export default async function UsersAdminPage() {
    const supabase = await createClient()

    // Sistemdeki tüm profilleri çekiyoruz
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Kullanıcılar çekilirken hata:', error)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            
            {/* Üst Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                            Kullanıcı Yönetimi
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Sisteme kayıtlı kullanıcıların yetkilerini ve rollerini (RBAC) yapılandırın.</p>
                    </div>
                </div>
                <CreateUserForm />
            </div>

            {/* Bilgilendirme Kutusu */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm font-medium">
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
                <p>
                    <strong>Güvenlik Notu:</strong> "Super Admin" tüm modüllere tam erişime sahiptir. "Editör" rolünü seçtiğinizde, sağ taraftan hangi modülleri yöneteceğini seçmelisiniz. Sisteme yeni kayıt olan herkes varsayılan olarak "İzleyici" başlar.
                </p>
            </div>

            {/* Kullanıcı Listesi */}
            <div className="flex flex-col gap-4">
                {profiles?.map((profile) => (
                    <UserRoleCard key={profile.id} profile={profile} />
                ))}

                {(!profiles || profiles.length === 0) && (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                        Henüz sistemde kullanıcı bulunmuyor.
                    </div>
                )}
            </div>
            
        </div>
    )
}
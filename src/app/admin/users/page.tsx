import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Trash2, Shield, User } from 'lucide-react'
import { deleteUser } from '@/actions/board_users'

export default async function UsersPage() {
    const supabase = await createClient()

    // Checking admin rights
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()

    if (adminProfile?.role !== 'admin') {
        return (
            <div className="p-8 text-center">
                <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Erişim Reddedildi</h2>
                <p className="mt-2 text-gray-600">Bu sayfayı görüntülemek için Admin yetkisine sahip olmalısınız.</p>
            </div>
        )
    }

    // Fetch all profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Kullanıcı ve Rol Yönetimi
                    </h2>
                </div>
                <Link href="/admin/users/create" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Yeni Editör/Admin Ekle
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                    {profiles?.map((profile) => (
                        <li key={profile.id}>
                            <div className="px-4 py-4 flex items-center sm:px-6">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="flex items-center">
                                        <User className="flex-shrink-0 h-6 w-6 text-gray-400" />
                                        <div className="ml-4">
                                            <p className="font-medium text-gray-900 truncate">{profile.first_name} {profile.last_name}</p>
                                            <p className="text-sm text-gray-500">ID: <span className="text-xs">{profile.id}</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {profile.role.toUpperCase()}
                                    </span>

                                    {/* Preventing self-deletion visually */}
                                    {user?.id !== profile.id && (
                                        <form action={async () => {
                                            'use server'
                                            await deleteUser(profile.id)
                                        }}>
                                            <button type="submit" className="text-red-500 hover:text-red-700" title="Kullanıcıyı Sil (Geri alınamaz)">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

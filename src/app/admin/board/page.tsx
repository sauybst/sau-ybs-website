import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Trash2, Users } from 'lucide-react'
import { deleteBoardMember } from '@/actions/board_users'

export default async function BoardMembersPage() {
    const supabase = await createClient()

    const { data: members, error } = await supabase
        .from('board_members')
        .select('*')
        .order('term_year', { ascending: false })
        .order('is_active', { ascending: false })

    if (error) {
        console.error('Error fetching board members:', error)
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Yönetim Kurulu
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Geçmiş ve mevcut yönetim kurulları kurumsal hafıza olarak saklanır.</p>
                </div>
                <Link href="/admin/board/create" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Üye Ekle
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                    {members?.map((member) => (
                        <li key={member.id}>
                            <div className="px-4 py-4 flex items-center sm:px-6">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <div className="flex items-center">
                                            {member.image_url ? (
                                                <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={member.image_url} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-indigo-500" />
                                                </div>
                                            )}

                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <p className="font-medium text-indigo-600 truncate">{member.full_name}</p>
                                                    <span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                        {member.board_role}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <p>Dönem: {member.term_year}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {member.is_active ? 'Aktif' : 'Geçmiş'}
                                    </span>
                                    <form action={async () => {
                                        'use server'
                                        await deleteBoardMember(member.id)
                                    }}>
                                        <button type="submit" className="text-red-500 hover:text-red-700" title="Sil">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </li>
                    ))}
                    {!members?.length && (
                        <li className="px-4 py-8 text-center text-sm text-gray-500">
                            Henüz bir yönetim kurulu üyesi eklenmemiş.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Eye, Edit, Users, User, Calendar, Shield } from 'lucide-react'
import { deleteBoardMember } from '@/actions/board_users' 
import DeleteConfirmButton from '@/components/DeleteConfirmButton'

export default async function BoardAdminPage() {
    const supabase = await createClient()

    // Üyeleri önce döneme, sonra seviyeye (başkandan aşağı doğru) sıralayarak çekiyoruz
    const { data: members, error } = await supabase
        .from('board_members')
        .select('*')
        .order('term_year', { ascending: false })
        .order('board_level', { ascending: true })

    if (error) {
        console.error('Error fetching board members:', error)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            
            {/* Üst Header ve Aksiyon Bölümü */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                        Yönetim Kurulu Yönetimi
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Aktif ve geçmiş dönem yönetim kurulu üyelerini görüntüleyin, düzenleyin veya silin.</p>
                </div>
                <Link 
                    href="/admin/board/create" 
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Yeni Üye Ekle
                </Link>
            </div>

            {/* Üye Kartları Listesi */}
            <div className="flex flex-col gap-4">
                {members?.map((member) => {
                    const isActive = member.is_active;

                    return (
                        <div key={member.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 sm:items-center justify-between group">
                            
                            {/* SOL KISIM: Görsel ve Bilgiler */}
                            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                {/* Profil Fotoğrafı (Yuvarlak) */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                    {member.image_url ? (
                                        <img src={member.image_url} alt={member.full_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <User className="w-8 h-8 text-brand-200" />
                                    )}
                                </div>

                                {/* Metin İçeriği */}
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        {/* Dinamik Durum Rozeti */}
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {isActive ? 'Aktif Dönem' : 'Geçmiş Dönem'}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900 truncate">
                                            {member.full_name}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium mt-1">
                                        <div className="flex items-center text-brand-600 font-bold">
                                            <Shield className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                            <span className="truncate max-w-[150px] sm:max-w-xs">{member.board_role}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
                                            <span>{member.term_year}</span>
                                        </div>
                                        {member.board_level && (
                                            <div className="flex items-center bg-slate-100 px-2 py-0.5 rounded text-xs">
                                                <span>Seviye: {member.board_level}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SAĞ KISIM: Aksiyon Butonları */}
                            <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                {/* Görüntüle Butonu (Canlı Siteye Gider) */}
                                <Link 
                                    href="/about" 
                                    target="_blank"
                                    className="p-2.5 text-slate-400 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-colors tooltip-trigger"
                                    title="Sitede Görüntüle"
                                >
                                    <Eye className="w-5 h-5" />
                                </Link>

                                {/* Düzenle Butonu */}
                                <Link 
                                    href={`/admin/board/edit/${member.id}`} 
                                    className="p-2.5 text-slate-400 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>

                                {/* Silme Formu ve Butonu */}
                                <DeleteConfirmButton
                                    id={member.id}
                                    onDelete={deleteBoardMember}
                                    itemName={member.full_name}
                                />
                            </div>

                        </div>
                    )
                })}

                {/* Boş Durum (Empty State) Görünümü */}
                {(!members || members.length === 0) && (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz Üye Yok</h3>
                        <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
                            Sistemde kayıtlı herhangi bir yönetim kurulu üyesi bulunamadı. Aktif ekibinizi ekleyerek hemen başlayabilirsiniz.
                        </p>
                        <Link 
                            href="/admin/board/create" 
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            İlk Üyeyi Ekle
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
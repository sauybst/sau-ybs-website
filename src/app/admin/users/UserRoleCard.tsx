"use client"

import { useState } from 'react'
import { ShieldCheck, UserCog, Eye, Save, CheckSquare, Square } from 'lucide-react'
import { updateUserPermissions } from '@/actions/users'
import { useToast } from '@/components/ToastProvider'
export const runtime = 'edge';

// Sistemdeki mevcut modüllerimiz
const AVAILABLE_MODULES = [
    { id: 'events', name: 'Etkinlikler' },
    { id: 'jobs', name: 'İş İlanları' },
    { id: 'blogs', name: 'Blog & Duyurular' },
    { id: 'projects', name: 'Projeler' }
]

export default function UserRoleCard({ profile }: { profile: any }) {
    const { showToast } = useToast()
    const [role, setRole] = useState(profile.role)
    const [modules, setModules] = useState<string[]>(profile.accessible_modules || [])
    const [isSaving, setIsSaving] = useState(false)

    // Modül seçme/kaldırma işlemi
    const toggleModule = (moduleId: string) => {
        setModules(prev => 
            prev.includes(moduleId) 
                ? prev.filter(m => m !== moduleId) 
                : [...prev, moduleId]
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateUserPermissions(profile.id, role, modules)
            if (result.error) {
                showToast(result.error, 'error')
            } else {
                showToast(`${profile.first_name} adlı kullanıcının yetkileri güncellendi.`, 'success')
            }
        } catch (error) {
            showToast('Sunucu ile iletişim hatası.', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    // Role göre sol taraftaki ikonun rengini ve şeklini belirliyoruz
    const getRoleIcon = () => {
        if (role === 'super_admin') return <ShieldCheck className="w-6 h-6 text-emerald-600" />
        if (role === 'editor') return <UserCog className="w-6 h-6 text-brand-600" />
        return <Eye className="w-6 h-6 text-slate-400" />
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row md:items-start gap-6 transition-all hover:shadow-md">
            
            {/* Kullanıcı Bilgisi (Sol Kısım) */}
            <div className="flex items-center gap-4 min-w-[250px]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${role === 'super_admin' ? 'bg-emerald-50' : role === 'editor' ? 'bg-brand-50' : 'bg-slate-50'}`}>
                    {getRoleIcon()}
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900">
                        {profile.first_name} {profile.last_name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                        {role === 'super_admin' ? 'Sistem Yöneticisi' : role === 'editor' ? 'İçerik Editörü' : 'İzleyici'}
                    </p>
                </div>
            </div>

            {/* Kontroller (Orta Kısım) */}
            <div className="flex-1 flex flex-col sm:flex-row gap-6">
                
                {/* Rol Seçimi */}
                <div className="sm:w-48 shrink-0">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sistem Rolü</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm font-medium bg-slate-50 hover:bg-white transition-colors cursor-pointer"
                    >
                        <option value="super_admin">Super Admin</option>
                        <option value="editor">Editör</option>
                        <option value="viewer">İzleyici</option>
                    </select>
                </div>

                {/* Dinamik Modül Seçimi (Sadece Editör ise görünür) */}
                <div className={`flex-1 transition-all duration-300 ${role === 'editor' ? 'opacity-100 max-h-40' : 'opacity-50 max-h-20 pointer-events-none'}`}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Erişilebilir Modüller</label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_MODULES.map(module => {
                            const isSelected = modules.includes(module.id);
                            return (
                                <button
                                    key={module.id}
                                    type="button"
                                    onClick={() => toggleModule(module.id)}
                                    disabled={role !== 'editor'}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                        isSelected 
                                        ? 'bg-brand-50 border-brand-200 text-brand-700' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                >
                                    {isSelected ? <CheckSquare className="w-4 h-4 mr-2 text-brand-600" /> : <Square className="w-4 h-4 mr-2 text-slate-400" />}
                                    {module.name}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Kaydet Butonu (Sağ Kısım) */}
            <div className="flex items-end justify-end shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-transparent">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none w-full md:w-auto"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

        </div>
    )
}
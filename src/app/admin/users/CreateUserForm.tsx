"use client"

import { useState } from 'react'
import { UserPlus, Save, X, ShieldAlert, User, Mail, Key, ShieldCheck, CheckSquare, Square } from 'lucide-react'
import { createUserByAdmin } from '@/actions/users'
import { useToast } from '@/components/ToastProvider'

const AVAILABLE_MODULES = [
    { id: 'events', name: 'Etkinlikler' },
    { id: 'jobs', name: 'İş İlanları' },
    { id: 'blogs', name: 'Blog & Duyurular' },
    { id: 'projects', name: 'Projeler' }
]

export default function CreateUserForm() {
    const { showToast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedRole, setSelectedRole] = useState('viewer')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        
        const formData = new FormData(e.currentTarget)
        
        try {
            const result = await createUserByAdmin(formData)
            if (result.error) {
                showToast(result.error, 'error')
            } else {
                showToast('Yeni kullanıcı başarıyla oluşturuldu!', 'success')
                setIsOpen(false) 
                setSelectedRole('viewer') 
            }
        } catch (error) {
            showToast('Sistemsel bir hata oluştu.', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) setIsOpen(false);
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all hover:-translate-y-0.5"
            >
                <UserPlus className="w-5 h-5 mr-2 -ml-1" />
                Yeni Kullanıcı Ekle
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6"
                    onClick={handleBackdropClick}
                >
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up overflow-hidden ring-1 ring-slate-200">
                        
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
                            <h3 className="text-xl font-heading font-extrabold text-slate-900 flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mr-3 border border-brand-100/50">
                                    <UserPlus className="w-5 h-5 text-brand-600" />
                                </div>
                                Yönetici Tanımla
                            </h3>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="createUserForm" onSubmit={handleSubmit} className="space-y-6">
                                
                                <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-4 flex gap-3 text-brand-800 text-sm font-medium mb-6 shadow-sm">
                                    <ShieldAlert className="w-5 h-5 shrink-0 text-brand-600 mt-0.5" />
                                    <p className="leading-relaxed">
                                        Kullanıcı belirlediğiniz <strong>E-posta</strong> ve <strong>Şifre</strong> ile sisteme anında giriş yapabilir. Profil bilgileri otomatik oluşturulur.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Adı */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Adı <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input type="text" name="first_name" required placeholder="Örn: Ahmet" 
                                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all sm:text-sm font-medium outline-none" 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Soyadı */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Soyadı <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input type="text" name="last_name" required placeholder="Örn: Yılmaz" 
                                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all sm:text-sm font-medium outline-none" 
                                            />
                                        </div>
                                    </div>

                                    {/* E-posta */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">E-posta Adresi <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input type="email" name="email" required placeholder="ornek@sauybs.com" 
                                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all sm:text-sm font-medium outline-none" 
                                            />
                                        </div>
                                    </div>

                                    {/* Şifre */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Geçici Şifre <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Key className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input type="password" name="password" required minLength={6} placeholder="En az 6 hane" 
                                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all sm:text-sm font-medium outline-none" 
                                            />
                                        </div>
                                    </div>

                                    {/* Rol Seçimi */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Sistem Rolü (RBAC) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <ShieldCheck className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <select 
                                                name="role" 
                                                value={selectedRole}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all sm:text-sm font-bold cursor-pointer outline-none appearance-none"
                                            >
                                                <option value="super_admin">Super Admin (Tüm yetkilere sahip Başkan/Yönetici)</option>
                                                <option value="editor">Editör (Sadece atanmış modüllere veri ekleyip silebilir)</option>
                                                <option value="viewer">İzleyici (Sadece okuyabilir, müdahale edemez)</option>
                                            </select>
                                            {/* Özel Dropdown Oku */}
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Editör ise Modülleri Göster */}
                                    {selectedRole === 'editor' && (
                                        <div className="sm:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 animate-fade-in-up shadow-sm">
                                            <label className="block text-sm font-bold text-slate-900 mb-3">Yönetebileceği Modüller</label>
                                            <div className="flex flex-wrap gap-3">
                                                {AVAILABLE_MODULES.map((mod) => (
                                                    <label key={mod.id} className="flex items-center gap-2.5 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all group">
                                                        <input type="checkbox" name="modules" value={mod.id} className="rounded text-brand-600 focus:ring-brand-500 focus:ring-offset-0 w-4 h-4 cursor-pointer" />
                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-brand-700 transition-colors">{mod.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-[2rem]">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                form="createUserForm" 
                                disabled={isSaving}
                                className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Kaydediliyor...' : 'Kaydet ve Yetkilendir'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    )
}
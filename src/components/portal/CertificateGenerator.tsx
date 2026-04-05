"use client"

import { useState } from 'react'
import { Award, Download, X, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Props {
    pinCode: string
}

export default function CertificateGenerator({ pinCode }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fullName, setFullName] = useState('')
    const { showToast } = useToast()

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fullName.trim()) return showToast('Lütfen adınızı girin.', 'error')

        setIsLoading(true)

        try {
            const response = await fetch('/api/certificates/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pinCode, requestedName: fullName.trim() })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Sertifika üretilemedi.')
            }

            // PDF verisini Blob (Binary) olarak al
            const blob = await response.blob()
            
            // Tarayıcıda geçici bir indirme linki oluştur (Zero-Storage Sihri)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `zaferOPS-Sertifika-${fullName.replace(/\s+/g, '-')}.pdf`
            document.body.appendChild(a)
            a.click()
            
            // Temizlik
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            showToast('Sertifikanız başarıyla üretildi ve indirildi!', 'success')
            setIsOpen(false)
            setFullName('')

        } catch (error: any) {
            showToast(error.message, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Tetikleyici Buton */}
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30 active:scale-95"
            >
                <Award className="w-5 h-5" />
                Katılım Sertifikamı Üret
            </button>

            {/* Modal (Popup) */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-xl">
                                    <Award className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Sertifika Üretimi</h3>
                            </div>
                            <button onClick={() => !isLoading && setIsOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-sm text-blue-800 leading-relaxed">
                                <span className="font-bold block mb-1">DİKKAT: Doğrulama Sistemi</span>
                                Sisteme kayıt olurken kullandığınız ad ve soyadı eksiksiz girmelisiniz. Girilen isim, güvenlik algoritması tarafından anonim kimliğinizle eşleştirilecektir.
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                    Sertifikada Yazacak İsim
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Herhangi Bir Adam"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium text-slate-700 transition-all uppercase placeholder:normal-case disabled:opacity-50"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading || !fullName.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Mühürleniyor...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Üret ve İndir
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
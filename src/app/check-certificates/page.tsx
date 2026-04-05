"use client"

import { useState } from 'react'
import { Search, ShieldCheck, CheckCircle2, XCircle, Award, Calendar, Fingerprint } from 'lucide-react'
import { verifyCertificate } from '@/actions/certificates'
import Link from 'next/link'
import FloatingTechBackground from '@/components/FloatingTechBackground' 

interface CertificateData {
    hash: string;
    event_count: number;
    created_at: string;
    masked_name: string;
}

export default function CheckCertificatesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<CertificateData | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const cleanQuery = searchQuery.trim()
        if (!cleanQuery) return

        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await verifyCertificate(cleanQuery)
            
            if (res.error) {
                setError(res.error)
            } else if (res.certificate) {
                setResult(res.certificate)
            }
        } catch (err) {
            setError('Sistemle bağlantı kurulurken bir hata oluştu.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-50 flex flex-col font-montserrat overflow-hidden">
            
            <div className="absolute inset-0 z-0 pointer-events-none">
                <FloatingTechBackground />
            </div>

            <header className="relative z-10 bg-transparent py-6 px-4 sm:px-8 flex justify-between items-center">
                <Link href="/" className="font-heading font-black text-2xl tracking-tighter text-brand-600">
                    zafer<span className="text-slate-900">OPS</span>
                </Link>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
                    <ShieldCheck className="w-5 h-5" />
                    Doğrulama Merkezi
                </div>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center pt-6 sm:pt-12 px-4 pb-12">
                
                {/* Arama Alanı */}
                <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-4">
                        <div className="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm shadow-sm rounded-full mb-2">
                            <Award className="w-12 h-12 text-brand-600" />
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Sertifika Doğrulama</h1>
                        <p className="text-slate-600 font-medium text-lg max-w-lg mx-auto bg-white/40 backdrop-blur-md py-2 px-4 rounded-2xl">
                            Elinizdeki belgenin orijinalliğini teyit etmek için sertifikanın altında yer alan <strong className="text-slate-800">SAU-</strong> ile başlayan kodu giriniz.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-20">
                            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                            placeholder="Örn: SAU-9F8A2B"
                            disabled={isLoading}
                            className="block w-full pl-14 pr-32 py-5 sm:text-lg font-mono font-bold uppercase tracking-widest text-slate-900 bg-white/90 backdrop-blur-xl border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none shadow-xl shadow-brand-900/5 disabled:opacity-50 relative z-10"
                        />
                        <div className="absolute inset-y-2 right-2 z-20">
                            <button
                                type="submit"
                                disabled={isLoading || !searchQuery.trim()}
                                className="h-full px-6 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md"
                            >
                                {isLoading ? 'Sorgulanıyor...' : 'Doğrula'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sonuç Ekranları */}
                <div className="w-full max-w-2xl mt-12 relative z-10">
                    
                    {error && (
                        <div className="bg-red-50/95 backdrop-blur-md border-2 border-red-100 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 animate-in zoom-in-95 duration-300 shadow-xl shadow-red-900/5">
                            <div className="shrink-0 p-4 bg-red-100 rounded-full text-red-600">
                                <XCircle className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-red-900 mb-2">Doğrulama Başarısız</h3>
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="bg-white/95 backdrop-blur-md border-2 border-emerald-100 p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-emerald-900/10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                            {/* Dekoratif Arka Plan */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-5">
                                <ShieldCheck className="w-64 h-64 text-emerald-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Sertifika Geçerli!</h3>
                                        <p className="text-emerald-600 font-bold tracking-widest text-sm uppercase">Orijinal Sistem Kaydı Bulundu</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Veriliş Tarihi
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {new Date(result.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Award className="w-4 h-4" /> Tamamlanan Etkinlik
                                        </p>
                                        <p className="text-lg font-bold text-brand-600">
                                            {result.event_count} Adet Katılım
                                        </p>
                                    </div>
                                </div>

                                {/* K-Anonimlik Uyarı Kartı */}
                                <div className="bg-blue-50/80 border border-blue-100 p-6 rounded-2xl flex gap-4 backdrop-blur-sm">
                                    <Fingerprint className="w-8 h-8 text-blue-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-blue-900 mb-2">Kimlik Eşleştirme (K-Anonimlik)</h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            Veri güvenliği politikalarımız gereği sistemimizde kişilerin gerçek adları tutulmamaktadır. 
                                            Bu sertifikanın yasal sahibi <strong className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">{result.masked_name}</strong> şablonuna sahip bir öğrencidir. 
                                            <br className="my-2" />
                                            <span className="opacity-80">Lütfen elinizdeki belgede yazan isim ve soyismin harf sayılarının ve ilk harflerinin bu şablonla uyuştuğunu (Örn: Ersin Görün = E4 G4) teyit ediniz.</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
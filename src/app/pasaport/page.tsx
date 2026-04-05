"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toPng } from 'html-to-image'

import { Ticket, Mail, Lock, User, Key, Download, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { requestPassportCreation, verifyAndCreatePassport, loginPassport } from '@/actions/passports'

type Mode = 'login' | 'register'
type Step = 1 | 2 | 3

export default function PasaportPage() {
    const router = useRouter()
    const cardRef = useRef<HTMLDivElement>(null)

    // Genel Durumlar
    const [mode, setMode] = useState<Mode>('register')
    const [step, setStep] = useState<Step>(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form Verileri
    const [email, setEmail] = useState('')
    const [fullName, setFullName] = useState('')
    const [otp, setOtp] = useState('')
    const [keyword, setKeyword] = useState('')
    const [pinCode, setPinCode] = useState('')

    // Başarı Durumunda Saklanacak Pasaport Bilgileri
    const [createdPassport, setCreatedPassport] = useState<{ pinCode: string; nameMask: string; recoveryKey: string } | null>(null)

    const switchMode = (newMode: Mode) => {
        setMode(newMode)
        setError('')
        setStep(1)
        setEmail('')
        setFullName('')
        setOtp('')
        setKeyword('')
        setPinCode('')
    }

    // --- AKSİYONLAR ---

    // 1. Adım: OTP Gönderimi
    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const res = await requestPassportCreation(email.trim(), fullName.trim())
        if (res.error) {
            setError(res.error)
        } else {
            setStep(2)
        }
        setLoading(false)
    }

    // 2. Adım: OTP Doğrulama ve Pasaport Üretimi
    const handleVerifyAndCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const res = await verifyAndCreatePassport(email.trim(), otp.trim(), keyword, fullName.trim())
        if (res.error) {
            setError(res.error)
        } else if (res.passport) {
            setCreatedPassport(res.passport)
            setStep(3)
        }
        setLoading(false)
    }

    // Pasaporta Giriş Yap
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const cleanPin = pinCode.trim().toUpperCase()
        const res = await loginPassport(cleanPin, keyword)
        
        if (res.error) {
            setError(res.error)
        } else {
            router.push('/portal')
            router.refresh()
        }
        setLoading(false)
    }

    // PNG İndirme İşlemi
    const handleDownload = async () => {
        if (cardRef.current === null) return
        try {
            const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
            const link = document.createElement('a')
            link.download = `SAU-YBS-Pasaport-${createdPassport?.pinCode}.png`
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error('İndirme hatası:', err)
        }
    }

    return (
        <div className="min-h-screen pt-28 pb-12 flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-500">
                
                {/* SEKMELER (Sadece Adım 1'de ve Teslimat ekranında değilse göster) */}
                {step === 1 && (
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => switchMode('register')}
                            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${mode === 'register' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            YENİ PASAPORT
                        </button>
                        <button
                            onClick={() => switchMode('login')}
                            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${mode === 'login' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            GİRİŞ YAP
                        </button>
                    </div>
                )}

                <div className="p-6 sm:p-8">
                    {/* HATA EKRANI */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 flex gap-3 items-start border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* --- KAYIT OLMA (REGISTER) AKIŞI --- */}
                    {mode === 'register' && (
                        <>
                            {step === 1 && (
                                <form onSubmit={handleRequestOTP} className="space-y-5 animate-in fade-in zoom-in-95">
                                    <div className="text-center mb-8">
                                        <div className="mx-auto h-12 w-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                                            <Ticket className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800">Pasaport Al</h2>
                                        <p className="text-sm text-slate-500 mt-2">Etkinlik biletleri ve yoklamalar için anonim kimliğinizi oluşturun.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Adınız ve Soyadınız</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                type="text"
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                                placeholder="Herhangi Bir Adam"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Öğrenci E-Postanız</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                                placeholder="ornek@ogr.sakarya.edu.tr"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 transition-all disabled:opacity-70"
                                    >
                                        {loading ? <span className="animate-pulse">Gönderiliyor...</span> : <>İleri <ArrowRight className="h-4 w-4" /></>}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleVerifyAndCreate} className="space-y-5 animate-in slide-in-from-right-4">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-slate-800">Doğrulama</h2>
                                        <p className="text-sm text-slate-500 mt-2"><b>{email}</b> adresine gönderdiğimiz 6 haneli kodu ve şifrenizi girin.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Doğrulama Kodu (OTP)</label>
                                        <div className="relative">
                                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg tracking-widest font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                                                placeholder="123456"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Anahtar Kelime (Şifreniz)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <input
                                                type="password"
                                                required
                                                value={keyword}
                                                onChange={(e) => setKeyword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                                                placeholder="Sadece sizin bildiğiniz bir kelime"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 transition-all disabled:opacity-70"
                                        >
                                            {loading ? 'Üretiliyor...' : 'Pasaportu Üret'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 3 && createdPassport && (
                                <div className="animate-in zoom-in-95 duration-500">
                                    <div className="text-center mb-6">
                                        <div className="mx-auto h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="h-8 w-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800">Pasaportunuz Hazır!</h2>
                                        <p className="text-sm text-slate-500 mt-2">Bu kartı cihazınıza kaydedin, etkinliklerde sadece PIN kodunuz sorulacaktır.</p>
                                    </div>

                                    {/* PNG OLARAK İNDİRİLECEK ALAN */}
                                    <div ref={cardRef} className="bg-gradient-to-br from-brand-600 to-brand-800 p-1 rounded-2xl mb-6 shadow-lg">
                                        <div className="bg-white rounded-xl p-6 relative overflow-hidden">
                                            <div className="absolute top-1 right-0 p-4"> 
                                                <Image
                                                    src="/logotip_ticket.png"
                                                    alt="SAÜ YBS Logo"
                                                    width={200} 
                                                    height={45} 
                                                />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Anonim Kimlik</p>
                                            <p className="text-xl font-bold text-slate-800 mb-6">{createdPassport.nameMask}</p>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-1">Pasaport PIN</p>
                                                    <p className="text-2xl font-mono font-bold text-brand-600 tracking-wider bg-brand-50 p-3 rounded-lg border border-brand-100 text-center">
                                                        {createdPassport.pinCode}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-red-500 font-medium mb-1 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> Kurtarma Kodu (Asla Paylaşmayın)
                                                    </p>
                                                    <p className="text-sm font-mono font-semibold text-slate-700 tracking-wider bg-red-50 p-2 rounded-lg border border-red-100 text-center">
                                                        {createdPassport.recoveryKey}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleDownload}
                                            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-900 transition-all shadow-md"
                                        >
                                            <Download className="h-5 w-5" /> Kartı Galeriye İndir
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/')
                                                router.refresh()
                                            }}
                                            className="w-full bg-brand-50 text-brand-700 py-3 rounded-xl font-medium hover:bg-brand-100 transition-all"
                                        >
                                            Ana Sayfaya Dön
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* --- GİRİŞ YAPMA (LOGIN) AKIŞI --- */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in zoom-in-95">
                            <div className="text-center mb-8">
                                <div className="mx-auto h-12 w-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4">
                                    <Ticket className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Pasaporta Giriş</h2>
                                <p className="text-sm text-slate-500 mt-2">Anonim kimliğinize erişmek için bilgilerinizi girin.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pasaport PIN</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={pinCode}
                                        onChange={(e) => setPinCode(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 font-mono uppercase bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                                        placeholder="SAU-XXXX"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Anahtar Kelime</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 transition-colors"
                                        placeholder="Belirlediğiniz şifre"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 transition-all disabled:opacity-70 mt-2"
                            >
                                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
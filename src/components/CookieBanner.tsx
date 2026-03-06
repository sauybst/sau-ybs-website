"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Info, X } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Kullanıcının bilgilendirmeyi daha önce kapatıp kapatmadığını kontrol et
        const consent = localStorage.getItem('cookieAcknowledged');
        if (!consent) {
            setIsVisible(true); 
        }
    }, []);

    const handleAcknowledge = () => {
        // Kullanıcı anladım dediğinde tarayıcıya kaydet ve gizle
        localStorage.setItem('cookieAcknowledged', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-[100] sm:bottom-6 sm:left-6 sm:right-auto w-full sm:max-w-md bg-slate-900/95 backdrop-blur-md border-t sm:border border-slate-700/50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] sm:shadow-2xl rounded-t-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-500">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 text-white">
                    <Info className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <h3 className="font-semibold text-base sm:text-lg font-heading">Çerez Bilgilendirmesi</h3>
                </div>
                <button onClick={handleAcknowledge} className="text-slate-400 hover:text-white transition-colors p-1">
                    <span className="sr-only">Kapat</span>
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 sm:mb-6">
                Sitemizin düzgün ve güvenli çalışabilmesi için yalnızca zorunlu teknik çerezler kullanılmaktadır. Sitemizde herhangi bir kişisel veri takibi veya analiz çerezi bulunmamaktadır. Detaylı bilgi için <Link href="/cookiePolicy" className="text-brand-400 hover:underline font-medium">Çerez Politikamızı</Link> inceleyebilirsiniz.
            </p>
            
            <div className="flex w-full">
                <button 
                    onClick={handleAcknowledge}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold py-2.5 sm:py-3 px-4 rounded-xl transition-all hover:-translate-y-0.5 text-center shadow-lg"
                >
                    Anladım
                </button>
            </div>
        </div>
    );
}
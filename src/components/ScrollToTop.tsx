"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            // Sayfanın ne kadarının kaydırıldığını matematiksel olarak hesapla
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (totalScroll / windowHeight) * 100;
            
            setProgress(scrollPercent);

            // Sayfa 200px'den fazla aşağı kaydırıldıysa butonu göster
            if (totalScroll > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Bileşen ekrandan kalkarsa listener'ı temizle (Performans için önemli)
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Yumuşak bir şekilde yukarı kaydırır
        });
    };

    // SVG Çemberi için matematiksel hesaplamalar
    const radius = 22; // Çemberin yarıçapı
    const circumference = 2 * Math.PI * radius; // Çemberin çevresi
    const strokeDashoffset = circumference - (progress / 100) * circumference; // Doldurulacak kısım

    return (
        <button
            onClick={scrollToTop}
            // isVisible durumuna göre butonu ekrana yumuşakça sok veya çıkar
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
            aria-label="Yukarı Çık"
        >
            {/* Etrafı dolan Progress Ring (SVG) */}
            {/* -rotate-90 ile dolumun saat 12 yönünden başlamasını sağlıyoruz */}
            <svg width="56" height="56" className="transform -rotate-90 drop-shadow-lg">
                {/* Arka plandaki silik halka */}
                <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-slate-200/50"
                />
                {/* Kaydırdıkça dolan renkli ana halka */}
                <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-brand-600 transition-all duration-150 ease-out"
                    strokeLinecap="round" // Çizginin uçlarını yuvarlatır
                />
            </svg>
            
            {/* İç Buton ve İkon (SVG'nin tam ortasına oturtulur) */}
            <div className="absolute inset-0 flex items-center justify-center m-auto w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-700 hover:text-brand-600 hover:bg-brand-50 hover:scale-105 transition-all duration-300">
                <ArrowUp className="w-5 h-5" />
            </div>
        </button>
    );
}
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const ticking = useRef(false);

    const handleScroll = useCallback(() => {
        if (!ticking.current) {
            window.requestAnimationFrame(() => {
                const totalScroll = document.documentElement.scrollTop;
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollPercent = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;

                setProgress(scrollPercent);
                setIsVisible(totalScroll > 200);
                ticking.current = false;
            });
            ticking.current = true;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // SVG Çemberi için hesaplamalar
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
            aria-label="Yukarı Çık"
        >
            {/* Progress Ring (SVG) */}
            <svg width="56" height="56" className="transform -rotate-90 drop-shadow-lg">
                {/* Arka plan halkası */}
                <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-slate-200/50"
                />
                {/* Kaydırdıkça dolan halka */}
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
                    strokeLinecap="round"
                />
            </svg>
            
            {/* İç Buton ve İkon */}
            <div className="absolute inset-0 flex items-center justify-center m-auto w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-700 hover:text-brand-600 hover:bg-brand-50 hover:scale-105 transition-all duration-300">
                <ArrowUp className="w-5 h-5" />
            </div>
        </button>
    );
}
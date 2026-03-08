'use client'

import { Mail, Instagram } from 'lucide-react'

export default function FloatingContact() {
    return (
        // Sayfanın sol altına sabitlenmiş ve elemanları alt alta dizen kapsayıcı
        <div className="fixed bottom-6 left-6 z-[1600] flex flex-col gap-4">
            
            {/* INSTAGRAM BUTONU */}
            <div className="relative group flex items-center">
                <a
                    
                    href="https://ig.me/m/sauybst" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:scale-110 hover:shadow-pink-500/50 transition-all duration-300 relative z-10"
                >
                    <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                
                {/* Instagram Tooltip */}
                <span className="absolute left-14 sm:left-16 bg-slate-800 text-white text-sm font-semibold py-1.5 px-3 rounded-lg opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap shadow-xl">
                    Instagram'dan Yazın
                    <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></span>
                </span>
            </div>

            {/* E-POSTA BUTONU */}
            <div className="relative group flex items-center">
                <a

                    href="mailto:sauybst@gmail.com" 
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-500 hover:scale-110 hover:shadow-brand-500/50 transition-all duration-300 relative z-10"
                >
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                    
                    <span className="absolute top-0 right-0 flex h-3 sm:h-3.5 w-3 sm:w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 sm:h-3.5 w-3 sm:w-3.5 bg-red-500 border-2 border-white"></span>
                    </span>
                </a>
                
                {/* E-Posta Tooltip */}
                <span className="absolute left-14 sm:left-16 bg-slate-800 text-white text-sm font-semibold py-1.5 px-3 rounded-lg opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap shadow-xl">
                    E-Posta Gönderin
                    <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></span>
                </span>
            </div>

        </div>
    )
}
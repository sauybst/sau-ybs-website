'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useRef } from 'react'

export default function PinSearch() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const [isPending, startTransition] = useTransition()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleSearch = (term: string) => {
        // Debounce (Gecikme) mantığı: Kullanıcı hızlıca yazarken her harfte veritabanını yormamak için
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            if (term) {
                params.set('query', term)
            } else {
                params.delete('query')
            }
            
            // URL'i güncelle ve Next.js'in sayfayı yeni parametreyle re-render etmesini sağla
            startTransition(() => {
                replace(`${pathname}?${params.toString()}`)
            })
        }, 300) // 300ms bekler
    }

    return (
        <div className="relative w-full sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isPending ? 'text-brand-500 animate-pulse' : 'text-slate-400'}`} />
            <input 
                type="text" 
                defaultValue={searchParams.get('query')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="PIN Kodu Ara..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
            />
        </div>
    )
}
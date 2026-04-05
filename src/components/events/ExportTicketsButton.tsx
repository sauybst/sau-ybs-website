"use client"

import { Download } from 'lucide-react'
import { TICKET_STATUS } from '@/types/tickets'

// --- TİP TANIMLAMALARI (Type Safety) ---
interface TicketData {
    pin_code: string;
    status: number;
    created_at: string;
    updated_at: string;
}

interface ExportProps {
    tickets: TicketData[]
    eventTitle: string
}

export default function ExportTicketsButton({ tickets, eventTitle }: ExportProps) {
    
    const exportToCSV = () => {
        // 1. Excel için Başlıklar (Header)
        const headers = ["Pasaport PIN", "Durum", "Bilet Alma Tarihi", "Giriş Saati"]
        
        const sanitize = (val: string) => {
            let str = String(val || '').replace(/"/g, '""'); 
            if (/^[=+\-@]/.test(str)) str = "'" + str; 
            return `"${str}"`; 
        };
        
        // 2. Verileri Satırlara Dönüştür
        const rows = tickets.map(ticket => [
            sanitize(ticket.pin_code),
            sanitize(ticket.status === TICKET_STATUS.SCANNED ? "Giriş Yaptı" : 
                     ticket.status === TICKET_STATUS.CANCELLED ? "İptal" : "Bekliyor"),
            sanitize(new Date(ticket.created_at).toLocaleString('tr-TR')),
            sanitize(ticket.status === TICKET_STATUS.SCANNED ? new Date(ticket.updated_at).toLocaleTimeString('tr-TR') : "-")
        ])

        // 3. CSV İçeriğini Oluştur (Excel uyumu için BOM ve noktalı virgül kullanımı)
        const csvContent = "\uFEFF" 
            + headers.join(";") + "\n" 
            + rows.map(e => e.join(";")).join("\n")

        // 4. İndirme İşlemini Başlat
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        
        const fileName = `${eventTitle.replace(/\s+/g, '-').toLowerCase()}-katilimci-listesi.csv`
        
        link.setAttribute("href", url)
        link.setAttribute("download", fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all font-semibold text-sm shadow-sm"
        >
            <Download className="h-4 w-4" />
            Excel'e Aktar
        </button>
    )
}
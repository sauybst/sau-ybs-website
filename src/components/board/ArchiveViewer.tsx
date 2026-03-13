"use client"

import { useState } from 'react'
import MemberCard from '@/components/board/MemberCard'
import { Users, History, Linkedin } from 'lucide-react'
import type { BoardMemberListItem } from '@/types/board-member'

type ArchiveViewerProps = {
    pastTerms: Record<string, BoardMemberListItem[]>
    contributorTerms: Record<string, BoardMemberListItem[]>
    allYears: string[]
}

export default function ArchiveViewer({ pastTerms, contributorTerms, allYears }: ArchiveViewerProps) {
    const [selectedYear, setSelectedYear] = useState<string>('');

    if (allYears.length === 0) {
        return (
            <p className="text-center text-slate-400 bg-slate-50 py-12 rounded-2xl">
                Arşivde geçmiş dönem kaydı bulunmamaktadır.
            </p>
        );
    }

    const currentPastMembers = pastTerms[selectedYear] || [];
    const currentContributors = contributorTerms[selectedYear] || [];

    return (
        <div className="flex flex-col items-center w-full animate-fade-in-up">
            {/* Yıl Seçim Dropdown'ı */}
            <div className="mb-16 w-full max-w-sm">
                <label htmlFor="year-select" className="block text-sm font-semibold text-slate-500 mb-3 text-center uppercase tracking-wider">
                    İncelemek İstediğiniz Dönemi Seçin
                </label>
                <div className="relative">
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="block w-full appearance-none rounded-2xl border-0 py-4 px-6 text-slate-800 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-brand-600 text-lg font-bold bg-white text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                        <option value="" disabled>Dönem Seçiniz...</option>
                        {allYears.map(year => (
                            <option key={year} value={year}>{year} Dönemi Arşivi</option>
                        ))}
                    </select>
                    {/* Özel Dropdown Oku */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-slate-400">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Seçilen Yılın Geçmiş Yönetim Kurulu */}
            {currentPastMembers.length > 0 && (
                <div className="w-full mb-20 relative">
                    <div className="flex items-center mb-10">
                        <h3 className="text-2xl font-heading font-bold text-slate-800 pr-6 bg-white relative z-10">
                            {selectedYear} <span className="text-slate-400 font-medium text-lg ml-2">Yönetim Kurulu</span>
                        </h3>
                        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-slate-200 to-transparent top-1/2 -translate-y-1/2" aria-hidden="true" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 opacity-90 hover:opacity-100 transition-opacity">
                        {currentPastMembers.map((member) => (
                            <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                </div>
            )}

            {/* Seçilen Yılın Emeği Geçenleri */}
            {currentContributors.length > 0 && (
                <div className="w-full relative mt-16 pt-16 border-t border-slate-100">
                    <div className="flex flex-col items-center mb-10">
                        <div className="h-14 w-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 border border-amber-100 shadow-sm">
                            <Users className="h-7 w-7" />
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-slate-700 text-center">
                        {selectedYear} Döneminde Emeği Geçenler
                        </h3>
                        <p className="text-base text-slate-500 mt-2">Görev süresini tamamlamadan ayrılan değerli üyelerimiz.</p>
                    </div>
                    
                    {/* Arşiv için Tok ve Şık Kart Tasarımı */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8 opacity-95 hover:opacity-100 transition-opacity duration-300">
                        {currentContributors.map(member => (
                            <div key={member.id} className="w-full sm:w-64 text-center flex flex-col items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:border-brand-200 hover:shadow-md hover:-translate-y-1.5 transition-all duration-300">
                                
                                {/* Fotoğrafı büyüttük ve çerçeve ekledik */}
                                {member.image_url ? (
                                    <img src={member.image_url} alt={member.full_name} className="w-28 h-28 rounded-full object-cover mb-5 shadow-sm ring-4 ring-slate-50" />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-slate-50 flex items-center justify-center mb-5 text-slate-300 border-4 border-white shadow-sm ring-1 ring-slate-100">
                                        <Users className="w-10 h-10" />
                                    </div>
                                )}
                                
                                {/* İsim ve Unvan okunabilirliğini artırdık */}
                                <h4 className="font-bold text-slate-800 text-base line-clamp-1" title={member.full_name}>{member.full_name}</h4>
                                <p className="text-sm text-brand-600 font-medium mt-1.5 line-clamp-1">{member.board_role}</p>
                                {/* LinkedIn Butonu */}
                                {member.linkedin_url && (
                                    <a
                                        href={member.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 text-slate-400 hover:text-[#0A66C2] transition-colors p-2 bg-slate-50 hover:bg-blue-50 rounded-full border border-slate-100 hover:border-blue-100"
                                        title={`${member.full_name} LinkedIn Profili`}
                                    >
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Eğer o yıla ait hiçbir veri yoksa (Sıradışı bir durum) */}
            {selectedYear !== '' && currentPastMembers.length === 0 && currentContributors.length === 0 && (
                <p className="text-slate-400 italic text-center mt-8">Bu döneme ait kayıt bulunamadı.</p>
            )}
        </div>
    )
}
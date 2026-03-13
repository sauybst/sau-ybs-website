"use client" 

import { useState, useEffect, useMemo } from 'react'
import { createBoardMember } from '@/actions/board_users'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider';
import ImageUpload from '@/components/ImageUpload'; 

// SSR hatasını önlemek için zengin metin editörünü dinamik yüklüyoruz
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css' 
export const runtime = 'edge';

export default function CreateBoardMemberPage() {
    const { showToast } = useToast();
    const [fullName, setFullName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    
    // Aktiflik Durumu State'i
    const [isActive, setIsActive] = useState(true);
    const [termYear, setTermYear] = useState('');

    // --- Yükleniyor durumu state'i eklendi ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- AKADEMİK YIL ALGORİTMASI ---
    // Mevcut aktif dönemi dinamik olarak hesaplar (Ağustos ayını yeni dönem başlangıcı sayar)
    const activeTermValue = useMemo(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth 0'dan başlar, o yüzden +1
        
        // Eğer Ağustos (8) veya daha sonraysa yeni dönem başlamıştır (Örn: 2026-2027)
        // Eğer Ağustos'tan önceyse önceki dönem devam ediyordur (Örn: 2025-2026)
        if (month >= 8) {
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    }, []);

    // Geçmiş 10 yılı Dropdown için üreten fonksiyon
    const pastTermsList = useMemo(() => {
        const terms = [];
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 10; i++) {
            const startYear = currentYear - i;
            terms.push(`${startYear}-${startYear + 1}`);
        }
        return terms;
    }, []);

    // Aktiflik durumu değiştiğinde "Dönem" inputunu otomatik ayarla
    useEffect(() => {
        if (isActive) {
            setTermYear(activeTermValue);
        } else {
            setTermYear(''); // Geçmiş seçilirse dropdown'ı "Seçiniz" moduna al
        }
    }, [isActive, activeTermValue]);

    // İsim değiştikçe otomatik Slug URL üretir
    useEffect(() => {
        const generatedSlug = fullName
            .toLowerCase()
            .trim()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); 

        setSlug(generatedSlug);
    }, [fullName]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 

        if (isSubmitting) return; 
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget); 
        await handleAction(formData);
    };

    const handleAction = async (formData: FormData) => {
        try {
            if (imageFile) {
                formData.append('image', imageFile); 
            }
            
            // Eğer form readOnly input'u algılamazsa diye term_year'ı manuel olarak da ekleyelim
            formData.set('term_year', termYear);

            const result = await createBoardMember(formData) as { error?: string } | undefined;
            
            if (result?.error) {
                showToast(result.error, 'error');
                setIsSubmitting(false);
            } else {
                showToast('Yönetim kurulu üyesi başarıyla eklendi!', 'success');
            }
        } catch (error: unknown) {
            const err = error as Record<string, unknown> | null;
            if (err?.message === 'NEXT_REDIRECT' || (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT'))) {
                showToast('Yönetim kurulu üyesi başarıyla eklendi!', 'success');
                throw error;
            }
            showToast('Sunucu ile iletişim kurulurken bir hata oluştu.', 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Yeni Yönetim Kurulu Üyesi Ekle
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/admin/board"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        İptal
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden">
                <input type="hidden" name="slug" value={slug} />

                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        
                        {/* Aktiflik Durumu (En üste aldık ki deneyim akıcı olsun) */}
                        <div className="sm:col-span-6 bg-brand-50 p-4 rounded-xl border border-brand-100">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="true"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-5 w-5 rounded border-brand-300 text-brand-600 focus:ring-brand-600 transition-all cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-brand-900 cursor-pointer select-none">
                                    Bu kişi şu anki "Aktif Dönem" (Mevcut Yönetim) üyesi mi?
                                </label>
                            </div>
                        </div>

                        {/* Tam İsim */}
                        <div className="sm:col-span-4">
                            <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-gray-900">
                                Ad Soyad <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2 text-gray-900">
                                <input
                                    type="text"
                                    name="full_name"
                                    id="full_name"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Örn: Ersin Görün"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* AKILLI DÖNEM YILI KUTUSU */}
                        <div className="sm:col-span-2">
                            <label htmlFor="term_year" className="block text-sm font-medium leading-6 text-gray-900">
                                Dönem <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2 text-gray-900">
                                {isActive ? (
                                    <input
                                        type="text"
                                        id="term_year"
                                        readOnly
                                        value={termYear}
                                        title="Aktif dönem seçili olduğu için otomatik hesaplanır."
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-500 bg-slate-100 shadow-sm ring-1 ring-inset ring-slate-200 sm:text-sm sm:leading-6 cursor-not-allowed select-none font-semibold"
                                    />
                                ) : (
                                    <select
                                        id="term_year"
                                        required
                                        value={termYear}
                                        onChange={(e) => setTermYear(e.target.value)}
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="" disabled>Dönem Seçiniz</option>
                                        {pastTermsList.map(term => (
                                            <option key={term} value={term}>{term}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Görev Adı */}
                        <div className="sm:col-span-3">
                            <label htmlFor="board_role" className="block text-sm font-medium leading-6 text-gray-900">
                                Görev Unvanı <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="board_role"
                                    id="board_role"
                                    required
                                    placeholder="Örn: Genel Sekreter"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Hiyerarşi Seviyesi */}
                        <div className="sm:col-span-3">
                            <label htmlFor="board_level" className="block text-sm font-medium leading-6 text-gray-900">
                                Hiyerarşi Seviyesi <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <select
                                    id="board_level"
                                    name="board_level"
                                    required
                                    defaultValue=""
                                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="" disabled>Seviye Seçiniz</option>
                                    <option value="1">1. Seviye (Başkan)</option>
                                    <option value="2">2. Seviye (Başkan Yrd. / Gen. Sekreter)</option>
                                    <option value="3">3. Seviye (Koordinatörler ve Üyeler)</option>
                                    <option value="4">4. Seviye (Emeği Geçenler / Erken Ayrılanlar)</option>
                                </select>
                            </div>
                        </div>

                        {/* LinkedIn URL */}
                        <div className="sm:col-span-6">
                            <label htmlFor="linkedin_url" className="block text-sm font-medium leading-6 text-gray-900">
                                LinkedIn Profili <span className="text-gray-400 font-normal text-xs ml-1">(İsteğe bağlı)</span>
                            </label>
                            <div className="mt-2 text-gray-900">
                                <input
                                    type="url"
                                    name="linkedin_url"
                                    id="linkedin_url"
                                    placeholder="https://linkedin.com/in/..."
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Profil Fotoğrafı Yükleme */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                Profil Fotoğrafı
                            </label>
                            <div className="mt-2">
                                <ImageUpload onImageSelect={(file) => setImageFile(file)} />
                            </div>
                        </div>

                        {/* Gelecek Seneler İçin Notlar / Açıklama */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                Üye Notları / Açıklama <span className="text-gray-400 font-normal text-xs ml-1">(Gelecek senelere not bırakabilirsiniz)</span>
                            </label>
                            <div className="bg-white rounded-md">
                                <ReactQuill 
                                    theme="snow" 
                                    value={description} 
                                    onChange={setDescription} 
                                    className="h-64 mb-12" 
                                    placeholder="Görevi süresince yaptığı çalışmalar, projeler veya gelecek ekip üyeleri için tavsiyeler..."
                                />
                            </div>
                            <input type="hidden" name="description" value={description} />
                        </div>

                    </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 bg-gray-50 px-4 py-4 sm:px-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`rounded-md px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2
                            ${isSubmitting 
                                ? 'bg-brand-400 cursor-not-allowed opacity-75' 
                                : 'bg-brand-600 hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Kaydediliyor...
                            </>
                        ) : (
                            'Üyeyi Kaydet'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
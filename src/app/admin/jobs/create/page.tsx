"use client" 

import { useState, useEffect } from 'react'
import { createJobPosting } from '@/actions/jobs'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider';
import ImageUpload from '@/components/ImageUpload'; 

// React Quill'i SSR hatası vermemesi için dinamik yüklüyoruz
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css' 

export default function CreateJobPage() {
    const { showToast } = useToast();
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [slug, setSlug] = useState(''); 
    const [companyName, setCompanyName] = useState(''); 
    const [positionName, setPositionName] = useState(''); 

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Şirket veya Pozisyon değiştikçe otomatik slug üret
    useEffect(() => {
        const combined = `${companyName} ${positionName}`;
        const generatedSlug = combined
            .toLowerCase()
            .trim()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); 
        setSlug(generatedSlug);
    }, [companyName, positionName]);

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

            const result = await createJobPosting(formData) as { error?: string } | undefined;
            
            if (result?.error) {
                showToast(result.error, 'error');
                setIsSubmitting(false);
            } else {
                showToast('İlan başarıyla oluşturuldu!', 'success');
            }
        } catch (error: unknown) {
            const err = error as Record<string, unknown> | null;
            if (err?.message === 'NEXT_REDIRECT' || (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT'))) {
                showToast('İlan başarıyla oluşturuldu!', 'success');
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
                        Yeni İlan Oluştur
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/admin/jobs"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        İptal
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        
                        {/* Aktiflik Durumu */}
                        <div className="sm:col-span-6 bg-brand-50 p-4 rounded-xl border border-brand-100">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="true"
                                    defaultChecked
                                    className="h-5 w-5 rounded border-brand-300 text-brand-600 focus:ring-brand-600 transition-all cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-brand-900 cursor-pointer select-none">
                                    İlanı şu anda "Aktif" (Görünür) olarak yayınla
                                </label>
                            </div>
                        </div>

                        {/* Şirket Adı */}
                        <div className="sm:col-span-3">
                            <label htmlFor="company_name" className="block text-sm font-medium leading-6 text-gray-900">
                                Şirket Adı <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2 text-gray-900">
                                <input
                                    type="text"
                                    name="company_name"
                                    id="company_name"
                                    required
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Örn: Otokar"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Pozisyon / Unvan */}
                        <div className="sm:col-span-3">
                            <label htmlFor="position_name" className="block text-sm font-medium leading-6 text-gray-900">
                                Pozisyon / Unvan <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2 text-gray-900">
                                <input
                                    type="text"
                                    name="position_name"
                                    id="position_name"
                                    required
                                    value={positionName}
                                    onChange={(e) => setPositionName(e.target.value)}
                                    placeholder="Örn: İş Analisti Stajyeri"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Çalışma Modeli (NORMALİZASYON İÇİN AÇILIR MENÜ YAPILDI) */}
                        <div className="sm:col-span-3">
                            <label htmlFor="work_model" className="block text-sm font-medium leading-6 text-gray-900">
                                Çalışma Modeli <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <select
                                    id="work_model"
                                    name="work_model"
                                    required
                                    defaultValue=""
                                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="" disabled>Seçiniz</option>
                                    <option value="0">Yüzyüze</option>
                                    <option value="1">Uzaktan</option>
                                    <option value="2">Hibrit</option>
                                    <option value="3">Belirtilmemiş</option>
                                </select>
                            </div>
                        </div>

                        {/* Son Başvuru Tarihi */}
                        <div className="sm:col-span-3">
                            <label htmlFor="deadline_date" className="block text-sm font-medium leading-6 text-gray-900">
                                Son Başvuru Tarihi <span className="text-gray-400 font-normal text-xs ml-1">(İsteğe bağlı)</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    type="datetime-local"
                                    name="deadline_date"
                                    id="deadline_date"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Başvuru Linki */}
                        <div className="sm:col-span-6">
                            <label htmlFor="application_link" className="block text-sm font-medium leading-6 text-gray-900">
                                Başvuru Linki <span className="text-gray-400 font-normal text-xs ml-1">(İsteğe bağlı)</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    type="url"
                                    name="application_link"
                                    id="application_link"
                                    placeholder="Örn: https://kariyer.net/..."
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Şirket Logosu Yükleme */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                Şirket Logosu <span className="text-gray-400 font-normal text-xs ml-1">(Kare veya şeffaf PNG/WEBP önerilir)</span>
                            </label>
                            <div className="mt-2">
                                <ImageUpload onImageSelect={(file) => setImageFile(file)} />
                            </div>
                        </div>

                        {/* İlan Detayları (Zengin Metin Editörü) */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                İlan Detayları ve Nitelikler <span className="text-red-500">*</span>
                            </label>
                            <div className="bg-white rounded-md">
                                <ReactQuill 
                                    theme="snow" 
                                    value={description} 
                                    onChange={setDescription} 
                                    className="h-64 mb-12" 
                                    placeholder="Aranan nitelikler, iş tanımı, staj programı detayları vb..."
                                />
                            </div>
                            <input type="hidden" name="description" value={description} />
                        </div>

                        <input type="hidden" name="slug" value={slug} />
                        
                    </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 bg-gray-50 px-4 py-4 sm:px-8">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`rounded-md px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2
                            ${isSubmitting 
                                ? 'bg-brand-400 cursor-not-allowed opacity-75' 
                                : 'bg-brand-600 hover:bg-brand-500'
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
                            'İlanı Kaydet'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
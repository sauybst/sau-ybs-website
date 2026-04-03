"use client" 

import { useState, useEffect } from 'react'
import { createEvent } from '@/actions/events'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider';
import ImageUpload from '@/components/ImageUpload'; 
import { QrCode, Users, Bus, CheckCircle2 } from 'lucide-react'
import { TICKETING_MODE, type TicketingMode } from '@/types/event' // YENİ: Sözlüğümüzü import ettik

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css' 

export default function CreateEventPage() {
    const { showToast } = useToast();
    
    // Temel Bilgiler
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null); 
    
    // Biletleme ve Yoklama (GÜNCELLENDİ: Artık varsayılan değer 0 yani FREE)
    const [ticketingMode, setTicketingMode] = useState<TicketingMode>(TICKETING_MODE.FREE);
    const [capacity, setCapacity] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const generatedSlug = title
            .toLowerCase()
            .trim()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9 -]/g, '') 
            .replace(/\s+/g, '-') 
            .replace(/-+/g, '-'); 

        setSlug(generatedSlug);
    }, [title]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        
        // Yeni eklediğimiz state verilerini FormData'ya manuel ekliyoruz
        // FormData sadece string kabul ettiği için sayıyı string'e çevirerek yolluyoruz ("0", "1", "2")
        formData.append('ticketing_mode', ticketingMode.toString());
        if (ticketingMode !== TICKETING_MODE.FREE && capacity) {
            formData.append('capacity', capacity);
        }

        await handleAction(formData);
    };

    const handleAction = async (formData: FormData) => {
        try {
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const result = await createEvent(formData) as { error?: string } | undefined;

            if (result?.error) {
                showToast(result.error, 'error');
                setIsSubmitting(false);
            } else {
                showToast('Etkinlik başarıyla oluşturuldu!', 'success');
            }
        } catch (error: unknown) {
            const err = error as Record<string, unknown> | null;
            if (err?.message === 'NEXT_REDIRECT' || (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT'))) {
                showToast('Etkinlik başarıyla oluşturuldu!', 'success');
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
                        Yeni Etkinlik Oluştur
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/admin/events"
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
                        
                        <div className="sm:col-span-4">
                            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                                Başlık
                            </label>
                            <div className="mt-2 text-gray-900">
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Örn: HSD Hackathon YBS Etkinliği"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="event_date" className="block text-sm font-medium leading-6 text-gray-900">
                                Tarih ve Saat
                            </label>
                            <div className="mt-2">
                                <input
                                    type="datetime-local"
                                    name="event_date"
                                    id="event_date"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                                Konum / Mekan
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    required
                                    placeholder="Örn: Kültür ve Kongre Merkezi"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="registration_url" className="block text-sm font-medium leading-6 text-gray-900">
                                Dış Kayıt Linki <span className="text-gray-400 font-normal text-xs ml-1">(İsteğe bağlı - Pasaport sistemi kullanılmayacaksa)</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    type="url"
                                    name="registration_url"
                                    id="registration_url"
                                    placeholder="Örn: https://forms.gle/..."
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* YENİ EKLENEN BÖLÜM: Biletleme ve Yoklama Modu (GÜNCELLENDİ) */}
                        <div className="sm:col-span-6 border-t border-b border-gray-900/10 py-6 my-2">
                            <label className="block text-base font-semibold leading-6 text-gray-900 mb-4">
                                Biletleme ve Yoklama Modu
                            </label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setTicketingMode(TICKETING_MODE.FREE)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${ticketingMode === TICKETING_MODE.FREE ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Users className={`h-6 w-6 ${ticketingMode === TICKETING_MODE.FREE ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        {ticketingMode === TICKETING_MODE.FREE && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                                    </div>
                                    <h3 className={`font-semibold text-sm ${ticketingMode === TICKETING_MODE.FREE ? 'text-indigo-900' : 'text-gray-700'}`}>Serbest Katılım</h3>
                                    <p className="text-xs text-gray-500 mt-1">QR kod gerekmez. Herkese açık etkinlik.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTicketingMode(TICKETING_MODE.STANDARD_QR)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${ticketingMode === TICKETING_MODE.STANDARD_QR ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <QrCode className={`h-6 w-6 ${ticketingMode === TICKETING_MODE.STANDARD_QR ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        {ticketingMode === TICKETING_MODE.STANDARD_QR && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                                    </div>
                                    <h3 className={`font-semibold text-sm ${ticketingMode === TICKETING_MODE.STANDARD_QR ? 'text-indigo-900' : 'text-gray-700'}`}>Salon (QR Bilet)</h3>
                                    <p className="text-xs text-gray-500 mt-1">Kapıda pasaport QR kod okutularak girilir.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTicketingMode(TICKETING_MODE.BUS_QR)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${ticketingMode === TICKETING_MODE.BUS_QR ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Bus className={`h-6 w-6 ${ticketingMode === TICKETING_MODE.BUS_QR ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        {ticketingMode === TICKETING_MODE.BUS_QR && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                                    </div>
                                    <h3 className={`font-semibold text-sm ${ticketingMode === TICKETING_MODE.BUS_QR ? 'text-indigo-900' : 'text-gray-700'}`}>Otobüslü Gezi</h3>
                                    <p className="text-xs text-gray-500 mt-1">Gelişmiş QR yoklaması (Gidiş/Dönüş).</p>
                                </button>
                            </div>

                            {/* Dinamik Kontenjan Alanı */}
                            {ticketingMode !== TICKETING_MODE.FREE && (
                                <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Maksimum Kontenjan (Kapasite)</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="number" 
                                            required 
                                            min="1" 
                                            value={capacity} 
                                            onChange={(e) => setCapacity(e.target.value)}
                                            className="w-32 block rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Örn: 150"
                                        />
                                        <span className="text-sm text-gray-500">Sınıra ulaşıldığında bilet satışları otomatik durdurulur.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                Etkinlik Afişi
                            </label>
                            <div className="mt-2">
                                <ImageUpload onImageSelect={(file) => setImageFile(file)} />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                Etkinlik Açıklaması
                            </label>
                            <div className="bg-white rounded-md">
                                <ReactQuill 
                                    theme="snow" 
                                    value={description} 
                                    onChange={setDescription} 
                                    className="h-64 mb-12" 
                                    placeholder="Etkinlik detaylarını buraya yazabilirsiniz..."
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
                                ? 'bg-indigo-400 cursor-not-allowed opacity-75' 
                                : 'bg-indigo-600 hover:bg-indigo-500'
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
                            'Etkinliği Kaydet'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
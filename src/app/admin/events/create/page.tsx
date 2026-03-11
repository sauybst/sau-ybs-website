"use client" 

import { useState, useEffect } from 'react'
import { createEvent } from '@/actions/events'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider';
import ImageUpload from '@/components/ImageUpload'; 

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css' 

export default function CreateEventPage() {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null); // Seçilen resmi tutacağımız state eklendi

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

    const handleAction = async (formData: FormData) => {
        try {
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const result = await createEvent(formData) as { error?: string } | undefined;

            if (result?.error) {
                showToast(result.error, 'error');
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

            <form action={handleAction} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden">
                {/* Ekranda görünmeyen ama arka planda veritabanına giden gizli Slug verisi */}
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
                                Kayıt Linki <span className="text-gray-400 font-normal text-xs ml-1">(İsteğe bağlı)</span>
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

                        {/* Eski URL inputu kaldırılarak yerine yeni görsel yükleme bileşeni eklendi */}
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
                        className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-colors"
                    >
                        Etkinliği Kaydet
                    </button>
                </div>
            </form>
        </div>
    )
}

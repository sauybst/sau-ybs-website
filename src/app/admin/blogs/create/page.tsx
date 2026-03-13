"use client"

import { useState } from 'react'
import { createBlog } from '@/actions/blogs'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider'
import { ImagePlus, Trash2 } from 'lucide-react'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'
export const runtime = 'edge';

export default function CreateBlogPage() {
    const { showToast } = useToast();
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('0'); // 0 = Blog, 1 = Makale

    const [imagePreview, setImagePreview] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setImagePreview('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        await handleAction(formData);
    };

    const handleAction = async (formData: FormData) => {
        try {
            // Slug artık arka planda oluşturulacak, sadece diğer verileri gönderiyoruz
            formData.append('content', content);
            formData.append('type', postType); 
            
            if (selectedFile) {
                formData.append('image_file', selectedFile);
            }

            const result = await createBlog(formData) as { error?: string } | undefined;
            
            if (result?.error) {
                showToast(result.error, 'error');
                setIsSubmitting(false);
            } else {
                showToast('Yazı başarıyla yayınlandı!', 'success');
            }
        } catch (error: unknown) {
            const err = error as Record<string, unknown> | null;
            if (err?.message === 'NEXT_REDIRECT' || (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT'))) {
                showToast('Yazı başarıyla yayınlandı!', 'success');
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
                        Yeni Yazı / Duyuru Oluştur
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link href="/admin/blogs" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
                        İptal
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        {/* BAŞLIK */}
                        <div className="sm:col-span-4">
                            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Yazı Başlığı</label>
                            <div className="mt-2">
                                <input type="text" name="title" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* YAZI TÜRÜ */}
                        <div className="sm:col-span-2">
                            <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">Yazı Türü</label>
                            <div className="mt-2">
                                <select id="type" name="type" value={postType} onChange={(e) => setPostType(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 cursor-pointer">
                                    <option value="0">Blog Yazısı</option>
                                    <option value="1">Akademik Makale</option>
                                    <option value="2">Duyuru</option> {/* BURA EKLENDİ */}
                                </select>
                            </div>
                        </div>

                        {/* KAPAK FOTOĞRAFI YÜKLEYİCİ */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Kapak Görseli</label>
                            {imagePreview ? (
                                <div className="relative w-full sm:w-96 h-56 rounded-xl overflow-hidden border-2 border-slate-200 group">
                                    <img src={imagePreview} alt="Kapak Önizleme" className="object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button type="button" onClick={handleRemoveImage} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg font-semibold text-sm">
                                            <Trash2 className="w-4 h-4" /> Resmi Kaldır
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-12 hover:bg-slate-50 hover:border-brand-400 transition-all cursor-pointer relative">
                                    <div className="text-center">
                                        <ImagePlus className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                            <label htmlFor="image_file" className="relative cursor-pointer rounded-md font-semibold text-brand-600 hover:text-brand-500 focus-within:outline-none">
                                                <span>Bilgisayardan görsel seç</span>
                                                <input id="image_file" name="image_file" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                                            </label>
                                            <p className="pl-1">veya sürükle bırak</p>
                                        </div>
                                        <p className="text-xs leading-5 text-gray-500 mt-1">Geniş formatlı görseller tercih edin (Örn: 1920x1080px)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ZENGİN METİN EDİTÖRÜ */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Blog İçeriği</label>
                            <div className="bg-white rounded-md">
                                <ReactQuill theme="snow" value={content} onChange={setContent} className="h-80 mb-12" placeholder="Yazınızı buraya yazın..." />
                            </div>
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
                                : 'bg-brand-600 hover:bg-brand-500'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Yayınlanıyor...
                            </>
                        ) : (
                            'Yayınla'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
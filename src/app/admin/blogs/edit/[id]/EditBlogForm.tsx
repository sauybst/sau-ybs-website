"use client"

import { useState } from 'react'
import { updateBlog } from '@/actions/blogs'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider'
import { ImagePlus, Trash2 } from 'lucide-react'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

type BlogEditData = {
    id: string
    title: string
    content: string
    type: number | null
    cover_image_url: string | null
}

export default function EditBlogForm({ blog }: { blog: BlogEditData }) {
    const { showToast } = useToast();
    
    const [title, setTitle] = useState(blog.title || '');
    const [content, setContent] = useState(blog.content || '');
    const [postType, setPostType] = useState(blog.type?.toString() || '0'); 

    const [imagePreview, setImagePreview] = useState(blog.cover_image_url || '');
    const [isImageDeleted, setIsImageDeleted] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsImageDeleted(false);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setImagePreview('');
        setIsImageDeleted(true); 
    };

    const handleAction = async (formData: FormData) => {
        try {
            formData.append('id', blog.id);
            formData.append('content', content);
            formData.append('type', postType);
            formData.append('old_image_url', blog.cover_image_url || '');
            formData.append('remove_image', isImageDeleted.toString());
            
            if (selectedFile) {
                formData.append('image_file', selectedFile);
            }

            // Slug göndermiyoruz, sunucu kendi üretecek
            const result = await updateBlog(formData) as { error?: string } | undefined;
            
            if (result?.error) {
                showToast(result.error, 'error');
            } else {
                showToast('Yazı başarıyla güncellendi!', 'success');
            }
        } catch (error: unknown) {
            const err = error as Record<string, unknown> | null;
            if (err?.message === 'NEXT_REDIRECT' || (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT'))) {
                showToast('Yazı başarıyla güncellendi!', 'success');
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
                        Yazıyı Düzenle
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link href="/admin/blogs" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
                        İptal
                    </Link>
                </div>
            </div>

            <form action={handleAction} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden">
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
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ZENGİN METİN EDİTÖRÜ */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Blog İçeriği</label>
                            <div className="bg-white rounded-md">
                                <ReactQuill theme="snow" value={content} onChange={setContent} className="h-80 mb-12" />
                            </div>
                        </div>

                    </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 bg-gray-50 px-4 py-4 sm:px-8">
                    <button type="submit" className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors">
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </form>
        </div>
    )
}
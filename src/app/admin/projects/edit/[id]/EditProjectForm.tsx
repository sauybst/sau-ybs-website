 "use client" 

import { useState, useEffect } from 'react'
import { updateProject } from '@/actions/projects'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider';
import { Trash2, ImagePlus } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css' 
export const runtime = 'edge';

export default function EditProjectForm({ project }: { project: any }) {
    const { showToast } = useToast();
    
    const [title, setTitle] = useState(project.title || '');
    const [slug, setSlug] = useState(project.slug || '');
    const [description, setDescription] = useState(project.description || '');
    const [developerNames, setDeveloperNames] = useState(project.developer_names || '');
    const [projectUrl, setProjectUrl] = useState(project.project_url || '');

    // Kategori işlemleri: Gelen veri sabit mi yoksa "Diğer" mi kontrolü
    const predefinedCategories = ['Yapay Zeka & Veri', 'Web Geliştirme', 'Mobil Uygulama', 'Oyun Geliştirme', 'Sistem & Otomasyon'];
    const initialCategory = project.category || '';
    const isPredefined = predefinedCategories.includes(initialCategory);
    
    const [selectedCategory, setSelectedCategory] = useState(isPredefined ? initialCategory : (initialCategory ? 'Diğer' : ''));
    const [customCategory, setCustomCategory] = useState(isPredefined ? '' : initialCategory);

    const finalCategory = selectedCategory === 'Diğer' ? customCategory : selectedCategory;
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Görsel işlemleri
    const [imagePreview, setImagePreview] = useState(project.image_url || '');
    const [isImageDeleted, setIsImageDeleted] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Otomatik Slug
    useEffect(() => {
        const generatedSlug = title
            .toLowerCase()
            .trim()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); 
        setSlug(generatedSlug);
    }, [title]);

    // Resim Yükleme/Kaldırma İşlemleri
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        await handleAction(formData);
    };

    const handleAction = async (formData: FormData) => {
        try {
            // FormData'ya sistem için gerekli bilgileri ekliyoruz
            formData.append('id', project.id);
            formData.append('old_image_url', project.image_url || '');
            formData.append('remove_image', isImageDeleted.toString());
            
            // finalCategory state'ini zorla formData'ya ekliyoruz ki action güncellesin
            formData.set('category', finalCategory);
            
            if (selectedFile) {
                formData.append('image_file', selectedFile);
            }

            const result = await updateProject(formData);
            
            if (result?.error) {
                showToast(result.error, 'error');
                setIsSubmitting(false);
            } else {
                showToast('Proje başarıyla güncellendi!', 'success');
            }
        } catch (error: any) {
            if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
                showToast('Proje başarıyla güncellendi!', 'success');
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
                        Projeyi Düzenle
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link href="/admin/projects" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
                        İptal
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden">
                <input type="hidden" name="slug" value={slug} />

                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        
                        <div className="sm:col-span-6">
                            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Proje Başlığı</label>
                            <div className="mt-2 text-gray-900">
                                <input type="text" name="title" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Kategori Seçimi */}
                        <div className="sm:col-span-6">
                            <label htmlFor="categorySelect" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                Kategori
                            </label>
                            <select
                                id="categorySelect"
                                required={!selectedCategory}
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                            >
                                <option value="" disabled>Kategori Seçiniz</option>
                                <option value="Yapay Zeka & Veri">Yapay Zeka & Veri</option>
                                <option value="Web Geliştirme">Web Geliştirme</option>
                                <option value="Mobil Uygulama">Mobil Uygulama</option>
                                <option value="Oyun Geliştirme">Oyun Geliştirme</option>
                                <option value="Sistem & Otomasyon">Sistem & Otomasyon</option>
                                <option value="Diğer">Diğer</option>
                            </select>

                            {/* "Diğer" seçilirse açılan input */}
                            {selectedCategory === 'Diğer' && (
                                <div className="mt-3 animate-in fade-in duration-200">
                                    <input
                                        type="text"
                                        required={selectedCategory === 'Diğer'}
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder="Kendi Kategorinizi Yazın (Örn: Siber Güvenlik)"
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-brand-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 bg-brand-50"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Geliştirici İsimleri */}
                        <div className="sm:col-span-3">
                            <label htmlFor="developer_names" className="block text-sm font-medium leading-6 text-gray-900">Geliştirici(ler)</label>
                            <div className="mt-2">
                                <input type="text" name="developer_names" id="developer_names" required value={developerNames} onChange={(e) => setDeveloperNames(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Proje URL */}
                        <div className="sm:col-span-3">
                            <label htmlFor="project_url" className="block text-sm font-medium leading-6 text-gray-900">Proje / GitHub Linki <span className="text-gray-400 font-normal text-xs ml-1">(İsteğe bağlı)</span></label>
                            <div className="mt-2">
                                <input type="url" name="project_url" id="project_url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Afiş / Kapak Görseli */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Proje Görseli / Kapak Fotoğrafı</label>
                            
                            {imagePreview ? (
                                <div className="relative w-64 h-auto rounded-xl overflow-hidden border-2 border-slate-200 group">
                                    <img src={imagePreview} alt="Afiş Önizleme" className="object-cover w-full h-full" />
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
                                        <p className="text-xs leading-5 text-gray-500 mt-1">PNG, JPG, WEBP (Maks. 5MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Proje Açıklaması (React Quill) */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Proje Açıklaması</label>
                            <div className="bg-white rounded-md">
                                <ReactQuill theme="snow" value={description} onChange={setDescription} className="h-64 mb-12" />
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
                                : 'bg-brand-600 hover:bg-brand-500'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Güncelleniyor...
                            </>
                        ) : (
                            'Değişiklikleri Kaydet'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
 "use client" 

import { useState, useEffect } from 'react'
import { updateJobPosting } from '@/actions/jobs'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider';
import { Trash2, ImagePlus } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css' 

export default function EditJobForm({ job }: { job: any }) {
    const { showToast } = useToast();
    
    // Form Stateleri (Veritabanından gelen verilerle dolduruluyor)
    const [companyName, setCompanyName] = useState(job.company_name || '');
    const [positionName, setPositionName] = useState(job.position_name || '');
    // Gelen integer değeri string'e çeviriyoruz ki select menüsünün value'su ile eşleşsin
    const [workModel, setWorkModel] = useState(job.work_model?.toString() || '');
    const [description, setDescription] = useState(job.description || '');
    const [isActive, setIsActive] = useState(job.is_active);
    const [slug, setSlug] = useState(job.slug || '');
    
    // Şirket veya pozisyon değiştikçe yeni slug üret (yukarıdaki useEffect'in aynısı)
    useEffect(() => {
        const combined = `${companyName} ${positionName}`;
        const generatedSlug = combined
            // ... replace kodları
        setSlug(generatedSlug);
    }, [companyName, positionName]);
    
    // Tarihi input'a uygun formata çeviren yardımcı fonksiyon
    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        const dateObj = new Date(dateString);
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}T${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
    };

    // Görsel işlemleri
    const [imagePreview, setImagePreview] = useState(job.company_logo_url || '');
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
            // Edit işlemi için ID ve resim durumlarını zorunlu olarak ekliyoruz
            formData.append('id', job.id);
            formData.append('old_image_url', job.company_logo_url || '');
            formData.append('remove_image', isImageDeleted.toString());
            
            // is_active checkbox'ının durumunu manuel ekliyoruz
            formData.set('is_active', isActive.toString());
            
            if (selectedFile) {
                formData.append('image_file', selectedFile);
            }

            const result = await updateJobPosting(formData);
            
            if (result?.error) {
                showToast(result.error, 'error');
            } else {
                showToast('İlan başarıyla güncellendi!', 'success');
            }
        } catch (error: any) {
            if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
                showToast('İlan başarıyla güncellendi!', 'success');
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
                        İlanı Düzenle
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link href="/admin/jobs" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
                        İptal
                    </Link>
                </div>
            </div>

            <form action={handleAction} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        
                        {/* Aktiflik Durumu */}
                        <div className="sm:col-span-6 bg-brand-50 p-4 rounded-xl border border-brand-100">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-5 w-5 rounded border-brand-300 text-brand-600 focus:ring-brand-600 transition-all cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-brand-900 cursor-pointer select-none">
                                    İlanı şu anda "Aktif" (Görünür) olarak yayınla
                                </label>
                            </div>
                        </div>

                        {/* Şirket Adı */}
                        <div className="sm:col-span-3">
                            <label htmlFor="company_name" className="block text-sm font-medium leading-6 text-gray-900">Şirket Adı <span className="text-red-500">*</span></label>
                            <div className="mt-2 text-gray-900">
                                <input type="text" name="company_name" id="company_name" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Pozisyon / Unvan */}
                        <div className="sm:col-span-3">
                            <label htmlFor="position_name" className="block text-sm font-medium leading-6 text-gray-900">Pozisyon / Unvan <span className="text-red-500">*</span></label>
                            <div className="mt-2 text-gray-900">
                                <input type="text" name="position_name" id="position_name" required value={positionName} onChange={(e) => setPositionName(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Çalışma Modeli (NORMALİZASYON HARİTALAMASI) */}
                        <div className="sm:col-span-3">
                            <label htmlFor="work_model" className="block text-sm font-medium leading-6 text-gray-900">Çalışma Modeli <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <select 
                                    id="work_model" 
                                    name="work_model" 
                                    required 
                                    value={workModel} 
                                    onChange={(e) => setWorkModel(e.target.value)}
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
                            <label htmlFor="deadline_date" className="block text-sm font-medium leading-6 text-gray-900">Son Başvuru Tarihi <span className="text-gray-400 font-normal text-xs ml-1">(İsteğe bağlı)</span></label>
                            <div className="mt-2">
                                <input type="datetime-local" name="deadline_date" id="deadline_date" defaultValue={formatDateForInput(job.deadline_date)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Başvuru Linki */}
                        <div className="sm:col-span-6">
                            <label htmlFor="application_link" className="block text-sm font-medium leading-6 text-gray-900">Başvuru Linki <span className="text-gray-400 font-normal text-xs ml-1">(İsteğe bağlı)</span></label>
                            <div className="mt-2">
                                <input type="url" name="application_link" id="application_link" defaultValue={job.application_link} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Şirket Logosu Görseli */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Şirket Logosu</label>
                            
                            {imagePreview ? (
                                <div className="relative w-48 h-auto p-4 rounded-xl overflow-hidden border-2 border-slate-200 group bg-white">
                                    <img src={imagePreview} alt="Logo Önizleme" className="object-contain w-full h-32" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-xl">
                                        <button type="button" onClick={handleRemoveImage} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg font-semibold text-sm">
                                            <Trash2 className="w-4 h-4" /> Resmi Kaldır
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-12 hover:bg-slate-50 hover:border-brand-400 transition-all cursor-pointer relative bg-white">
                                    <div className="text-center">
                                        <ImagePlus className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                            <label htmlFor="image_file" className="relative cursor-pointer rounded-md font-semibold text-brand-600 hover:text-brand-500 focus-within:outline-none">
                                                <span>Bilgisayardan logo seç</span>
                                                <input id="image_file" name="image_file" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                                            </label>
                                            <p className="pl-1">veya sürükle bırak</p>
                                        </div>
                                        <p className="text-xs leading-5 text-gray-500 mt-1">PNG, JPG, WEBP (Kare, Şeffaf Önerilir)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Zengin Metin (Notlar) */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">İlan Detayları ve Nitelikler <span className="text-red-500">*</span></label>
                            <div className="bg-white rounded-md">
                                <ReactQuill theme="snow" value={description} onChange={setDescription} className="h-64 mb-12" />
                            </div>
                            <input type="hidden" name="description" value={description} />
                        </div>

                        <input type="hidden" name="slug" value={slug} />
                        
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
"use client"

import { useState, useEffect, useMemo } from 'react'
import { updateBoardMember } from '@/actions/board_users'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ToastProvider';
import { Trash2, ImagePlus, User as UserIcon } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css' 

type BoardMemberEditData = {
    id: string
    slug: string
    full_name: string
    board_role: string
    board_level: number | string
    term_year: string
    is_active: boolean
    image_url: string | null
    linkedin_url: string | null
    description: string | null
}

export default function EditBoardMemberForm({ member }: { member: BoardMemberEditData }) {
    const { showToast } = useToast();
    
    // Temel Bilgiler
    const [fullName, setFullName] = useState(member.full_name || '');
    const [slug, setSlug] = useState(member.slug || '');
    const [boardRole, setBoardRole] = useState(member.board_role || '');
    const [boardLevel, setBoardLevel] = useState(member.board_level || '');
    const [linkedinUrl, setLinkedinUrl] = useState(member.linkedin_url || '');
    const [description, setDescription] = useState(member.description || '');

    // Görsel işlemleri
    const [imagePreview, setImagePreview] = useState(member.image_url || '');
    const [isImageDeleted, setIsImageDeleted] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Aktiflik Durumu ve Dönem Yılı
    const [isActive, setIsActive] = useState(member.is_active);
    const [termYear, setTermYear] = useState(member.term_year || '');

    // --- Yükleniyor durumu state'i ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- AKADEMİK YIL ALGORİTMASI ---
    const activeTermValue = useMemo(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        if (month >= 8) {
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    }, []);

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
            // Eğer veritabanından gelen eski bir geçmiş yıl varsa onu tut, yoksa boş bırak
            if (!member.is_active) {
                setTermYear(member.term_year);
            } else {
                setTermYear(''); 
            }
        }
    }, [isActive, activeTermValue, member]);

    // İsim değiştikçe otomatik Slug URL üretir (Yalnızca ilk defa yazıyorsa günceller, yoksa eskisi kalır)
    useEffect(() => {
        const generatedSlug = fullName
            .toLowerCase()
            .trim()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); 
        setSlug(generatedSlug);
    }, [fullName]);

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
            // Action dosyasına sistem için gerekli diğer propları zorunlu olarak ekliyoruz
            formData.append('id', member.id);
            formData.append('old_image_url', member.image_url || '');
            formData.append('remove_image', isImageDeleted.toString());
            
            // Eğer form readOnly input'u algılamazsa diye manuel gönderiyoruz
            formData.set('term_year', termYear);
            formData.set('is_active', isActive.toString());
            
            if (selectedFile) {
                formData.append('image_file', selectedFile);
            }

            const result = await updateBoardMember(formData);
            
            if (result?.error) {
                showToast(result.error, 'error');
                setIsSubmitting(false);
            } else {
                showToast('Üye başarıyla güncellendi!', 'success');
            }
        } catch (error: unknown) {
            const err = error as Record<string, unknown> | null;
            if (err?.message === 'NEXT_REDIRECT' || (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT'))) {
                showToast('Üye başarıyla güncellendi!', 'success');
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
                        Üyeyi Düzenle
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link href="/admin/board" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
                        İptal
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-hidden">
                <input type="hidden" name="slug" value={slug} />

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
                                    Bu kişi şu anki "Aktif Dönem" (Mevcut Yönetim) üyesi mi?
                                </label>
                            </div>
                        </div>

                        {/* Tam İsim */}
                        <div className="sm:col-span-4">
                            <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-gray-900">Ad Soyad</label>
                            <div className="mt-2 text-gray-900">
                                <input type="text" name="full_name" id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Dönem Yılı Kilitli/Seçimli */}
                        <div className="sm:col-span-2">
                            <label htmlFor="term_year" className="block text-sm font-medium leading-6 text-gray-900">
                                Dönem <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2 text-gray-900">
                                {isActive ? (
                                    <input
                                        type="text"
                                        readOnly
                                        value={termYear}
                                        title="Aktif dönem seçili olduğu için otomatik hesaplanır."
                                        className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-500 bg-slate-100 shadow-sm ring-1 ring-inset ring-slate-200 sm:text-sm sm:leading-6 cursor-not-allowed select-none font-semibold"
                                    />
                                ) : (
                                    <select
                                        required
                                        value={termYear}
                                        onChange={(e) => setTermYear(e.target.value)}
                                        className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="" disabled>Dönem Seçiniz</option>
                                        {/* Eğer veritabanından gelen dönem 10 yıllık listede yoksa onu da ekle */}
                                        {!pastTermsList.includes(member.term_year) && member.term_year && !member.is_active && (
                                            <option value={member.term_year}>{member.term_year}</option>
                                        )}
                                        {pastTermsList.map(term => (
                                            <option key={term} value={term}>{term}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Görev Adı */}
                        <div className="sm:col-span-3">
                            <label htmlFor="board_role" className="block text-sm font-medium leading-6 text-gray-900">Görev Unvanı</label>
                            <div className="mt-2">
                                <input type="text" name="board_role" id="board_role" required value={boardRole} onChange={(e) => setBoardRole(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Hiyerarşi Seviyesi */}
                        <div className="sm:col-span-3">
                            <label htmlFor="board_level" className="block text-sm font-medium leading-6 text-gray-900">Hiyerarşi Seviyesi</label>
                            <div className="mt-2">
                                <select id="board_level" name="board_level" required value={boardLevel} onChange={(e) => setBoardLevel(e.target.value)} className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6">
                                    <option value="" disabled>Seviye Seçiniz</option>
                                    <option value="1">1. Seviye (Başkan)</option>
                                    <option value="2">2. Seviye (Başkan Yrd. / Gen. Sekreter)</option>
                                    <option value="3">3. Seviye (Koordinatörler ve Üyeler)</option>
                                </select>
                            </div>
                        </div>

                        {/* LinkedIn URL */}
                        <div className="sm:col-span-6">
                            <label htmlFor="linkedin_url" className="block text-sm font-medium leading-6 text-gray-900">LinkedIn Profili</label>
                            <div className="mt-2 text-gray-900">
                                <input type="url" name="linkedin_url" id="linkedin_url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>

                        {/* Profil Fotoğrafı (Yuvarlak Hatlı) */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Profil Fotoğrafı</label>
                            
                            {imagePreview ? (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 group shadow-md">
                                    <img src={imagePreview} alt="Profil" className="object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button type="button" onClick={handleRemoveImage} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg" title="Resmi Kaldır">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-12 hover:bg-slate-50 hover:border-brand-400 transition-all cursor-pointer relative">
                                    <div className="text-center">
                                        <ImagePlus className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                            <label htmlFor="image_file" className="relative cursor-pointer rounded-md font-semibold text-brand-600 hover:text-brand-500 focus-within:outline-none">
                                                <span>Bilgisayardan fotoğraf seç</span>
                                                <input id="image_file" name="image_file" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                                            </label>
                                            <p className="pl-1">veya sürükle bırak</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Açıklama / Notlar */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Üye Notları / Açıklama</label>
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
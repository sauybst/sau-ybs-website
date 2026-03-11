'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Props {
    id: string;
    onDelete: (id: string) => Promise<void | { error?: string }>;
    itemName: string; 
}

export default function DeleteConfirmButton({ id, onDelete, itemName }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    // useTransition, arka planda çalışan Server Action'ın yüklenme durumunu (loading) takip etmemizi sağlar
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await onDelete(id);
                if (result && 'error' in result && result.error) {
                    showToast(result.error, 'error');
                } else {
                    showToast('Kayıt başarıyla silindi.', 'success');
                }
                setIsOpen(false);
            } catch (error) {
                showToast('Silinirken bir hata oluştu.', 'error');
                setIsOpen(false);
            }
        });
    };

    return (
        <>
            {/* Silme Butonu (Tetikleyici) */}
            <button 
                type="button" 
                onClick={() => setIsOpen(true)}
                className="p-2.5 text-slate-400 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors" 
                title="Sil"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            {/* Modal (Popup Onay Kutusu) */}
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
                                Emin misiniz?
                            </h3>
                            <p className="text-center text-slate-500 mb-6 line-clamp-3">
                                <span className="font-semibold text-slate-700">"{itemName}"</span> kalıcı olarak silinecektir. Bu işlem geri alınamaz ve bağlı görseller de sunucudan tamamen kaldırılacaktır.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsOpen(false)}
                                    disabled={isPending}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                    İptal
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <span className="animate-pulse">Siliniyor...</span>
                                    ) : (
                                        'Evet, Sil'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
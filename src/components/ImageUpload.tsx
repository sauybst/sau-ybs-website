'use client';

import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { compressImage } from '@/utils/supabase/imageCompression';
import { useToast } from '@/components/ToastProvider';

const MAX_RAW_FILE_SIZE = 20 * 1024 * 1024; // 20MB — sıkıştırma öncesi client-side üst limit
const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  previewUrl?: string | null;
  className?: string;
}

export default function ImageUpload({
  onImageSelect,
  previewUrl = null,
  className = '',
}: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Memory leak önleme: bileşen unmount olduğunda blob URL'yi temizle
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Lütfen geçerli bir resim dosyası seçin.', 'error');
      return;
    }

    if (file.size > MAX_RAW_FILE_SIZE) {
      showToast('Dosya boyutu 20MB\'dan küçük olmalıdır.', 'error');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Resmi sıkıştır
      const compressedFile = await compressImage(file);

      // 2. Eski blob URL'yi temizle (memory leak önleme)
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }

      // 3. Yeni önizleme URL'si oluştur
      const objectUrl = URL.createObjectURL(compressedFile);
      setLocalPreview(objectUrl);

      // 4. Üst (Parent) bileşene sıkıştırılmış dosyayı gönder
      onImageSelect(compressedFile);

    } catch (error) {
      showToast('Resim işlenirken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${localPreview ? 'border-gray-300 bg-gray-50' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'}
        `}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm font-medium">Görsel optimize ediliyor...</p>
          </div>
        ) : localPreview ? (
          <div className="relative w-full h-full p-2 group">
            <img
              src={localPreview}
              alt="Önizleme"
              className="object-contain w-full h-full rounded-md"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-4 right-4 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Resmi Kaldır"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
            <UploadCloud className="w-12 h-12 mb-3 text-blue-500" />
            <p className="mb-2 text-sm">
              <span className="font-semibold text-blue-600">Tıklayın</span> veya sürükleyip bırakın
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG (Otomatik olarak WebP'ye sıkıştırılır)</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </label>
    </div>
  );
}
// ============================================================
// Supabase Storage Yardımcı Fonksiyonları
// Upload, delete ve URL parse işlemlerini merkeze çeker.
// ============================================================

import { type SupabaseClient } from '@supabase/supabase-js'
import { FILE_UPLOAD } from './constants'

type UploadResult = {
    url: string | null
    error: string | null
}

/**
 * Dosyayı doğrular (tip + boyut), Supabase Storage'a yükler
 * ve public URL'yi döndürür.
 */
export async function uploadImage(
    supabase: SupabaseClient,
    bucket: string,
    folder: string,
    file: File,
    fileNameSlug: string,
): Promise<UploadResult> {
    // — Boyut kontrolü
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
        return { url: null, error: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' }
    }

    // — Tip kontrolü
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
        return { url: null, error: 'Sadece WEBP, JPEG ve PNG formatları kabul edilir.' }
    }

    // — Benzersiz dosya adı oluştur
    const safeSlug = fileNameSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .substring(0, 40)
    const ext = file.type.split('/')[1] || 'webp'
    const fileName = `${Date.now()}-${safeSlug}.${ext}`
    const filePath = `${folder}/${fileName}`

    // — Storage'a yükle
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
        })

    if (uploadError) {
        console.error(`Storage upload hatası [${bucket}/${folder}]:`, uploadError)
        return { url: null, error: 'Dosya yüklenirken bir hata oluştu.' }
    }

    // — Public URL al
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return { url: urlData.publicUrl, error: null }
}

/**
 * Supabase Storage public URL'sinden dosyanın bucket-relative
 * yolunu çıkarır.
 * 
 * @example
 * extractStoragePath(
 *   "https://xxx.supabase.co/storage/v1/object/public/blogs/blog-covers/123.webp",
 *   "blogs"
 * )
 * // → "blog-covers/123.webp"
 */
export function extractStoragePath(url: string, bucket: string): string | null {
    if (!url) return null
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.substring(idx + marker.length)
}

/**
 * Supabase Storage'dan dosyayı siler.
 * Sessizce hataları loglar, throw etmez.
 */
export async function deleteStorageFile(
    supabase: SupabaseClient,
    bucket: string,
    publicUrl: string,
): Promise<void> {
    const filePath = extractStoragePath(publicUrl, bucket)
    if (!filePath) return

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

    if (error) {
        console.error(`Storage silme hatası [${bucket}]:`, error)
    }
}

/**
 * Bir update formunda eski resmin silinmesi ve/veya yeni resmin yüklenmesini
 * yöneten üst düzey fonksiyon.
 *
 * @returns Güncellenmiş image URL (null olabilir).
 */
export async function handleImageUpdate(
    supabase: SupabaseClient,
    bucket: string,
    folder: string,
    options: {
        newFile: File | null
        removeImage: boolean
        oldImageUrl: string
        fileNameSlug: string
    }
): Promise<{ url: string | null; error: string | null }> {
    const { newFile, removeImage, oldImageUrl, fileNameSlug } = options
    let finalUrl: string | null = oldImageUrl || null

    // Eski resmi sil (yeni dosya yüklenecekse veya kullanıcı kaldırmak istediyse)
    const shouldDeleteOld = (removeImage || (newFile && newFile.size > 0)) && oldImageUrl
    if (shouldDeleteOld) {
        await deleteStorageFile(supabase, bucket, oldImageUrl)
        if (removeImage) {
            finalUrl = null
        }
    }

    // Yeni dosya yükle
    if (newFile && newFile.size > 0) {
        const result = await uploadImage(supabase, bucket, folder, newFile, fileNameSlug)
        if (result.error) {
            return { url: null, error: result.error }
        }
        finalUrl = result.url
    }

    return { url: finalUrl, error: null }
}

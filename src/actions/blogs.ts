'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// YENİ: Başlıktan otomatik Slug (SEO URL) üreten yardımcı fonksiyon
function generateSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9 -]/g, '') // Harf, rakam ve tire dışındaki her şeyi sil
        .replace(/\s+/g, '-') // Boşlukları tireye çevir
        .replace(/-+/g, '-'); // Yan yana gelmiş birden fazla tireyi tek tire yap
}

export async function createBlog(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const postType = parseInt(formData.get('type') as string, 10) 
    const imageFile = formData.get('image_file') as File | null

    // YENİ: Başlık varsa Slug'ı otomatik üret, yoksa boş bırak
    const generatedSlug = title ? generateSlug(title) : '';

    if (!title || !generatedSlug || !content) {
        return { error: 'Gerekli alanları doldurunuz.' }
    }

    const { data: { user } } = await supabase.auth.getUser()

    // --- STORAGE UPLOAD ---
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        // Oluşturduğumuz slug'ı dosya isminde de kullanıyoruz
        const fileName = `${Date.now()}-${generatedSlug}.webp`
        const filePath = `blog-covers/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('blogs') 
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Kapak görseli yüklenirken hata oluştu: ' + uploadError.message }
        }

        const { data: urlData } = supabase.storage
            .from('blogs')
            .getPublicUrl(filePath)

        image_url = urlData.publicUrl
    }

    // --- VERİTABANINA KAYIT ---
    const { error } = await supabase.from('blogs').insert({
        title,
        slug: generatedSlug, 
        content,
        type: postType, 
        cover_image_url: image_url, // Tablodaki 'cover_image_url' sütununa eşitliyoruz
        author_id: user?.id,        // Tablodaki 'author_id' sütununa eşitliyoruz
        published_at: new Date().toISOString(), // Yayınlanma tarihini de o anki saat olarak basıyoruz
    })

    if (error) {
        console.error('DB insert hatası:', error)
        return { error: 'Yazı oluşturulurken hata oluştu: ' + error.message }
    }

    revalidatePath('/admin/blogs')
    redirect('/admin/blogs')
}

export async function deleteBlog(id: string) {
    const supabase = await createClient()

    // 1. Önce kaydı çek, kapak görseli URL'sini al
    const { data: blog, error: fetchError } = await supabase
        .from('blogs')
        .select('cover_image_url') // Tablodaki sütun adımız cover_image_url
        .eq('id', id)
        .single()

    if (fetchError) {
        console.error('Blog fetch hatası:', fetchError)
    }

    // 2. Storage'dan resmi sil
    if (blog?.cover_image_url) {
        // Blogs bucket'ına göre URL'yi parçalıyoruz
        const filePath = blog.cover_image_url.split('/storage/v1/object/public/blogs/')[1]
        
        if (filePath) {
            const { error: storageError } = await supabase.storage
                .from('blogs') // Bucket adımız blogs
                .remove([filePath])

            if (storageError) {
                console.error('Storage silme hatası:', storageError)
            }
        }
    }

    // 3. Veritabanından (DB) sil
    const { error } = await supabase.from('blogs').delete().eq('id', id)

    if (error) {
        console.error('Error deleting blog:', error)
        throw new Error('Yazı silinirken hata oluştu.')
    }

    // Tabloyu güncelle
    revalidatePath('/admin/blogs')
}

export async function updateBlog(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const postType = parseInt(formData.get('type') as string, 10) 

    const imageFile = formData.get('image_file') as File | null
    const removeImage = formData.get('remove_image') === 'true'
    const oldImageUrl = formData.get('old_image_url') as string

    // YENİ: Başlıktan otomatik Slug (SEO URL) üretiyoruz
    const generatedSlug = title ? generateSlug(title) : '';

    if (!title || !generatedSlug || !content) {
        return { error: 'Gerekli alanları doldurunuz.' }
    }

    let finalImageUrl = oldImageUrl; 

    const extractPathFromUrl = (url: string) => {
        if (!url) return null;
        const parts = url.split('/storage/v1/object/public/blogs/');
        return parts.length > 1 ? parts[1] : null;
    }

    if ((removeImage || (imageFile && imageFile.size > 0)) && oldImageUrl) {
        const pathToDelete = extractPathFromUrl(oldImageUrl);
        if (pathToDelete) {
            const { error: storageError } = await supabase.storage
                .from('blogs')
                .remove([pathToDelete]);
            
            if (storageError) {
                console.error('Eski storage silme hatası:', storageError)
            }
        }
        if (removeImage) {
            finalImageUrl = ''; 
        }
    }

    if (imageFile && imageFile.size > 0) {
        // Yeni dosya adını oluşturduğumuz otomatik slug ile kaydediyoruz
        const fileName = `${Date.now()}-${generatedSlug}.webp`
        const filePath = `blog-covers/${fileName}` 

        const { error: uploadError } = await supabase.storage
            .from('blogs')           
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Kapak görseli güncellenirken hata oluştu: ' + uploadError.message }
        }

        const { data: urlData } = supabase.storage
            .from('blogs')           
            .getPublicUrl(filePath)

        finalImageUrl = urlData.publicUrl
    }

    const { error } = await supabase
        .from('blogs')
        .update({
            title,
            slug: generatedSlug, // Artık formdan geleni değil, arka planda üretileni kaydediyoruz
            content,
            type: postType,
            cover_image_url: finalImageUrl || null, 
        })
        .eq('id', id)

    if (error) {
        console.error('DB update hatası:', error)
        return { error: 'Yazı güncellenirken bir hata oluştu: ' + error.message }
    }

    revalidatePath('/admin/blogs')
    revalidatePath(`/blogs/${generatedSlug}`) // Cache'i yeni slug ile temizliyoruz
    redirect('/admin/blogs')
}
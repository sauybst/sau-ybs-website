'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
    const supabase = await createClient()

    // Formdan gelen verileri çekiyoruz (projects tablosuna göre)
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const developer_names = formData.get('developer_names') as string
    const description = formData.get('description') as string
    const project_url = formData.get('project_url') as string
    const imageFile = formData.get('image') as File | null
    const slug = formData.get('slug') as string

    // Zorunlu alan kontrolü
    if (!title || !category || !developer_names || !description) {
        return { error: 'Lütfen zorunlu alanları (Başlık, Kategori, Geliştiriciler, Açıklama) doldurunuz.' }
    }

    // --- STORAGE UPLOAD ---
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        // Slug olmadığı için dosya adına güvenli başlık (boşlukları tire yaparak) ve timestamp ekliyoruz
        const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 20);
        const fileName = `${Date.now()}-${safeTitle}.webp`
        const filePath = `project-covers/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('projects')         // Supabase'de 'projects' adında bir bucket oluşturmayı unutma!
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Proje görseli yüklenirken hata oluştu: ' + uploadError.message }
        }

        // Public URL al
        const { data: urlData } = supabase.storage
            .from('projects')
            .getPublicUrl(filePath)

        image_url = urlData.publicUrl
    }
    // --- STORAGE UPLOAD SON ---

    // Veritabanına Ekleme
    const { error } = await supabase.from('projects').insert({
        title,
        slug,
        category,
        developer_names,
        description,
        project_url: project_url || null,
        image_url,                    
    })

    if (error) {
        console.error('DB insert hatası:', error)
        return { error: 'Proje oluşturulurken hata oluştu: ' + error.message }
    }

    revalidatePath('/admin/projects')
    revalidatePath('/projects')
    redirect('/admin/projects')
}

export async function deleteProject(id: string) {
    const supabase = await createClient()
 
    // 1. Önce kaydı çek, image_url'yi al
    const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('image_url')
        .eq('id', id)
        .single()

    if (fetchError) {
        console.error('Proje fetch hatası:', fetchError)
    }

    // 2. Storage'dan resmi sil
    if (project?.image_url) {
        const filePath = project.image_url.split('/storage/v1/object/public/projects/')[1]
        
        if (filePath) {
            const { error: storageError } = await supabase.storage
                .from('projects')
                .remove([filePath])

            if (storageError) {
                console.error('Storage silme hatası:', storageError)
            }
        }
    }

    // 3. Veritabanından (DB) sil
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
        console.error('Error deleting project:', error)
        throw new Error('Proje silinirken hata oluştu.')
    }

    revalidatePath('/admin/projects')
    revalidatePath('/projects')
}

export async function updateProject(formData: FormData) {
    const supabase = await createClient()

    // Formdan gelen verileri çekiyoruz
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const developer_names = formData.get('developer_names') as string
    const description = formData.get('description') as string
    const project_url = formData.get('project_url') as string

    // Görsel işlemleri için formdan gelen yeni veriler
    const imageFile = formData.get('image_file') as File | null
    const removeImage = formData.get('remove_image') === 'true'
    const oldImageUrl = formData.get('old_image_url') as string

    let finalImageUrl = oldImageUrl;

    // URL'den dosyanın Storage'daki yolunu bulan fonksiyon (projects bucket'ına uyarlandı)
    const extractPathFromUrl = (url: string) => {
        if (!url) return null;
        const parts = url.split('/storage/v1/object/public/projects/');
        return parts.length > 1 ? parts[1] : null;
    }

    // SENARYO 1: Kullanıcı resmi sildiyse VEYA yeni bir resim yüklediyse
    if ((removeImage || (imageFile && imageFile.size > 0)) && oldImageUrl) {
        const pathToDelete = extractPathFromUrl(oldImageUrl);
        if (pathToDelete) {
            const { error: storageError } = await supabase.storage
                .from('projects')
                .remove([pathToDelete]);
            
            if (storageError) {
                console.error('Eski storage silme hatası:', storageError)
            }
        }
        if (removeImage) {
            finalImageUrl = ''; 
        }
    }

    // SENARYO 2: Yeni bir dosya yüklendiyse
    if (imageFile && imageFile.size > 0) {
        const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 20);
        const fileName = `${Date.now()}-${safeTitle}.webp`
        const filePath = `project-covers/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('projects')           
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Görsel güncellenirken hata oluştu: ' + uploadError.message }
        }

        const { data: urlData } = supabase.storage
            .from('projects')           
            .getPublicUrl(filePath)

        finalImageUrl = urlData.publicUrl
    }

    // Tüm verileri Veritabanında Güncelle
    const { error } = await supabase
        .from('projects')
        .update({
            title,
            category,
            developer_names,
            description,
            project_url: project_url || null,
            image_url: finalImageUrl || null,
        })
        .eq('id', id)

    if (error) {
        console.error('DB update hatası:', error)
        return { error: 'Proje güncellenirken bir hata oluştu: ' + error.message }
    }

    // Önbelleği temizle ve tabloya geri dön
    revalidatePath('/admin/projects')
    revalidatePath('/projects')
    redirect('/admin/projects')
}
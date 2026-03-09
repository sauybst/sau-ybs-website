'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const generateSlug = (text: string) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export async function createJobPosting(formData: FormData) {
    const supabase = await createClient()

    // Form verilerini çekiyoruz (SQL tablosuna uyumlu)
    const company_name = formData.get('company_name') as string
    const position_name = formData.get('position_name') as string
    const work_model = parseInt(formData.get('work_model') as string, 10)
    const description = formData.get('description') as string
    const deadline_date = formData.get('deadline_date') as string 
    const application_link = formData.get('application_link') as string 
    const is_active = formData.get('is_active') === 'true' 
    const slug = generateSlug(`${company_name} ${position_name}`);
    
    const imageFile = formData.get('image') as File | null // Şirket logosu

    if (!company_name || !position_name || isNaN(work_model) || !description) {
        return { error: 'Gerekli alanları (Şirket, Pozisyon, Model, Açıklama) doldurunuz.' }
    }

    // --- STORAGE UPLOAD (Şirket Logosu) ---
    let company_logo_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        // Dosya adı: timestamp-sirket-pozisyon.webp
        const safeCompanyName = company_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const fileName = `${Date.now()}-${safeCompanyName}.webp`
        const filePath = `company-logos/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('jobs') // DİKKAT: Supabase'de 'jobs' isimli bir public bucket oluşturmalısın!
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Şirket logosu yüklenirken hata oluştu: ' + uploadError.message }
        }

        // Public URL al
        const { data: urlData } = supabase.storage
            .from('jobs')
            .getPublicUrl(filePath)

        company_logo_url = urlData.publicUrl
    }
    // --- STORAGE UPLOAD SON ---

    const { error } = await supabase.from('job_postings').insert({
        company_name,
        position_name,
        slug,
        work_model,
        description,
        deadline_date: deadline_date ? new Date(deadline_date).toISOString() : null,
        application_link: application_link || null,
        company_logo_url,
        is_active,
    })

    if (error) {
        console.error('DB insert hatası:', error)
        return { error: 'İlan oluşturulurken hata oluştu: ' + error.message }
    }

    revalidatePath('/admin/jobs')
    revalidatePath('/jobs')
    redirect('/admin/jobs')
}

export async function deleteJobPosting(id: string) {
    const supabase = await createClient()

    // 1. Önce kaydı çek, logoyu al
    const { data: job, error: fetchError } = await supabase
        .from('job_postings')
        .select('company_logo_url')
        .eq('id', id)
        .single()

    if (fetchError) {
        console.error('İlan bulunamadı:', fetchError)
    }

    // 2. Storage'dan logoyu sil
    if (job?.company_logo_url) {
        const filePath = job.company_logo_url.split('/storage/v1/object/public/jobs/')[1]

        if (filePath) {
            const { error: storageError } = await supabase.storage
                .from('jobs')
                .remove([filePath])

            if (storageError) {
                console.error('Storage silme hatası:', storageError)
            }
        }
    }

    // 3. DB'den sil
    const { error } = await supabase.from('job_postings').delete().eq('id', id)

    if (error) {
        console.error('Error deleting job posting:', error)
        throw new Error('İlan silinirken hata oluştu.')
    }

    revalidatePath('/admin/jobs')
    revalidatePath('/jobs')
}

export async function updateJobPosting(formData: FormData) {
    const supabase = await createClient()

    // Formdan gelen ID'yi yakalıyoruz
    const id = formData.get('id') as string

    // Diğer verileri çekiyoruz
    const company_name = formData.get('company_name') as string
    const position_name = formData.get('position_name') as string
    const work_model = formData.get('work_model') as string
    const description = formData.get('description') as string
    const deadline_date = formData.get('deadline_date') as string
    const application_link = formData.get('application_link') as string
    const is_active = formData.get('is_active') === 'true'
    const slug = generateSlug(`${company_name} ${position_name}`);
    
    // Görsel işlemleri için veriler
    const imageFile = formData.get('image_file') as File | null
    const removeImage = formData.get('remove_image') === 'true'
    const oldImageUrl = formData.get('old_image_url') as string

    let finalImageUrl = oldImageUrl; // Varsayılan olarak eski logoyu tut

    const extractPathFromUrl = (url: string) => {
        if (!url) return null;
        const parts = url.split('/storage/v1/object/public/jobs/');
        return parts.length > 1 ? parts[1] : null;
    }

    // SENARYO 1: Logo silindiyse VEYA yeni logo yüklendiyse (Eskisini çöpe at)
    if ((removeImage || (imageFile && imageFile.size > 0)) && oldImageUrl) {
        const pathToDelete = extractPathFromUrl(oldImageUrl);
        if (pathToDelete) {
            const { error: storageError } = await supabase.storage
                .from('jobs')
                .remove([pathToDelete]);
            
            if (storageError) {
                console.error('Eski logo silinirken hata:', storageError)
            }
        }
        if (removeImage) {
            finalImageUrl = ''; // "Kaldır"a basıldıysa URL sıfırlanır
        }
    }

    // SENARYO 2: Yeni bir logo yüklendiyse
    if (imageFile && imageFile.size > 0) {
        const safeCompanyName = company_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const fileName = `${Date.now()}-${safeCompanyName}.webp`
        const filePath = `company-logos/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('jobs') 
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Yeni logo yüklenirken hata oluştu: ' + uploadError.message }
        }

        const { data: urlData } = supabase.storage
            .from('jobs') 
            .getPublicUrl(filePath)

        finalImageUrl = urlData.publicUrl
    }

    // Veritabanında Güncelle
    const { error } = await supabase
        .from('job_postings')
        .update({
            company_name,
            position_name,
            work_model,
            slug,
            description,
            deadline_date: deadline_date ? new Date(deadline_date).toISOString() : null,
            application_link: application_link || null,
            is_active,
            company_logo_url: finalImageUrl || null, 
        })
        .eq('id', id)

    if (error) {
        console.error('DB update hatası:', error)
        return { error: 'İlan güncellenirken bir hata oluştu: ' + error.message }
    }

    // Önbelleği temizle
    revalidatePath('/admin/jobs')
    revalidatePath('/jobs')
    revalidatePath(`/jobs/${slug}`)
    redirect('/admin/jobs')
}
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/utils/auth-guard'
import { generateSlug } from '@/utils/slugify'
import { uploadImage, deleteStorageFile, handleImageUpdate } from '@/utils/storage'
import { JobSchema, UUIDSchema } from '@/utils/schemas'
import { STORAGE_BUCKETS, STORAGE_FOLDERS, USER_ROLES } from '@/utils/constants'

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.EDITOR] as const
const MODULE_NAME = 'jobs'

export async function createJobPosting(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    // — Girdi doğrulama
    const raw = {
        company_name: formData.get('company_name') as string,
        position_name: formData.get('position_name') as string,
        work_model: parseInt(formData.get('work_model') as string, 10),
        description: formData.get('description') as string,
        deadline_date: formData.get('deadline_date') as string,
        application_link: formData.get('application_link') as string,
        is_active: formData.get('is_active') === 'true',
    }
    const validated = JobSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { company_name, position_name, work_model, description, deadline_date, application_link, is_active } = validated.data

    const slug = generateSlug(`${company_name} ${position_name}`)

    // — Logo yükleme
    const imageFile = formData.get('image') as File | null
    let company_logo_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        const result = await uploadImage(
            supabase, STORAGE_BUCKETS.JOBS, STORAGE_FOLDERS.COMPANY_LOGOS, imageFile,
            company_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        )
        if (result.error) return { error: result.error }
        company_logo_url = result.url
    }

    // — Veritabanına kayıt
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
        console.error('İlan oluşturma hatası:', error)
        return { error: 'İlan oluşturulurken bir hata oluştu.' }
    }

    revalidatePath('/admin/jobs')
    revalidatePath('/jobs')
    redirect('/admin/jobs')
}

export async function deleteJobPosting(id: string) {
    const idCheck = UUIDSchema.safeParse(id)
    if (!idCheck.success) return { error: 'Geçersiz kayıt kimliği.' }

    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    // — Logoyu Storage'dan sil
    const { data: job } = await supabase
        .from('job_postings')
        .select('company_logo_url')
        .eq('id', id)
        .single()

    if (job?.company_logo_url) {
        await deleteStorageFile(supabase, STORAGE_BUCKETS.JOBS, job.company_logo_url)
    }

    // — Veritabanından sil
    const { error } = await supabase.from('job_postings').delete().eq('id', id)

    if (error) {
        console.error('İlan silme hatası:', error)
        return { error: 'İlan silinirken bir hata oluştu.' }
    }

    revalidatePath('/admin/jobs')
    revalidatePath('/jobs')
}

export async function updateJobPosting(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    const id = formData.get('id') as string
    const idCheck = UUIDSchema.safeParse(id)
    if (!idCheck.success) return { error: 'Geçersiz kayıt kimliği.' }

    // — Girdi doğrulama
    const raw = {
        company_name: formData.get('company_name') as string,
        position_name: formData.get('position_name') as string,
        work_model: parseInt(formData.get('work_model') as string, 10),
        description: formData.get('description') as string,
        deadline_date: formData.get('deadline_date') as string,
        application_link: formData.get('application_link') as string,
        is_active: formData.get('is_active') === 'true',
    }
    const validated = JobSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { company_name, position_name, work_model, description, deadline_date, application_link, is_active } = validated.data

    const slug = generateSlug(`${company_name} ${position_name}`)

    // — Logo güncelleme
    const imageResult = await handleImageUpdate(supabase, STORAGE_BUCKETS.JOBS, STORAGE_FOLDERS.COMPANY_LOGOS, {
        newFile: formData.get('image_file') as File | null,
        removeImage: formData.get('remove_image') === 'true',
        oldImageUrl: formData.get('old_image_url') as string,
        fileNameSlug: company_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    })
    if (imageResult.error) return { error: imageResult.error }

    // — Veritabanını güncelle
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
            company_logo_url: imageResult.url,
        })
        .eq('id', id)

    if (error) {
        console.error('İlan güncelleme hatası:', error)
        return { error: 'İlan güncellenirken bir hata oluştu.' }
    }

    revalidatePath('/admin/jobs')
    revalidatePath('/jobs')
    revalidatePath(`/jobs/${slug}`)
    redirect('/admin/jobs')
}
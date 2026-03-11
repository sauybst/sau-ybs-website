'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/utils/auth-guard'
import { uploadImage, deleteStorageFile, handleImageUpdate } from '@/utils/storage'
import { ProjectSchema } from '@/utils/schemas'
import { STORAGE_BUCKETS, STORAGE_FOLDERS, USER_ROLES } from '@/utils/constants'

const ALLOWED_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.EDITOR] as const
const MODULE_NAME = 'projects'

export async function createProject(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    // — Girdi doğrulama
    const raw = {
        title: formData.get('title') as string,
        category: formData.get('category') as string,
        developer_names: formData.get('developer_names') as string,
        description: formData.get('description') as string,
        project_url: formData.get('project_url') as string,
        slug: formData.get('slug') as string,
    }
    const validated = ProjectSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { title, category, developer_names, description, project_url, slug } = validated.data

    // — Görsel yükleme
    const imageFile = formData.get('image') as File | null
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 20)
        const result = await uploadImage(
            supabase, STORAGE_BUCKETS.PROJECTS, STORAGE_FOLDERS.PROJECT_COVERS, imageFile, safeTitle,
        )
        if (result.error) return { error: result.error }
        image_url = result.url
    }

    // — Veritabanına kayıt
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
        console.error('Proje oluşturma hatası:', error)
        return { error: 'Proje oluşturulurken bir hata oluştu.' }
    }

    revalidatePath('/admin/projects')
    revalidatePath('/projects')
    redirect('/admin/projects')
}

export async function deleteProject(id: string) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    // — Görseli Storage'dan sil
    const { data: project } = await supabase
        .from('projects')
        .select('image_url')
        .eq('id', id)
        .single()

    if (project?.image_url) {
        await deleteStorageFile(supabase, STORAGE_BUCKETS.PROJECTS, project.image_url)
    }

    // — Veritabanından sil
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
        console.error('Proje silme hatası:', error)
        return { error: 'Proje silinirken bir hata oluştu.' }
    }

    revalidatePath('/admin/projects')
    revalidatePath('/projects')
}

export async function updateProject(formData: FormData) {
    const supabase = await createClient()

    // — Yetki kontrolü
    const auth = await requireAuth(supabase, {
        allowedRoles: [...ALLOWED_ROLES],
        requiredModule: MODULE_NAME,
    })
    if (!auth.authorized) return { error: auth.error }

    const id = formData.get('id') as string

    // — Girdi doğrulama
    const raw = {
        title: formData.get('title') as string,
        category: formData.get('category') as string,
        developer_names: formData.get('developer_names') as string,
        description: formData.get('description') as string,
        project_url: formData.get('project_url') as string,
    }
    const validated = ProjectSchema.safeParse(raw)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }
    const { title, category, developer_names, description, project_url } = validated.data

    // — Görsel güncelleme
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 20)
    const imageResult = await handleImageUpdate(supabase, STORAGE_BUCKETS.PROJECTS, STORAGE_FOLDERS.PROJECT_COVERS, {
        newFile: formData.get('image_file') as File | null,
        removeImage: formData.get('remove_image') === 'true',
        oldImageUrl: formData.get('old_image_url') as string,
        fileNameSlug: safeTitle,
    })
    if (imageResult.error) return { error: imageResult.error }

    // — Veritabanını güncelle
    const { error } = await supabase
        .from('projects')
        .update({
            title,
            category,
            developer_names,
            description,
            project_url: project_url || null,
            image_url: imageResult.url,
        })
        .eq('id', id)

    if (error) {
        console.error('Proje güncelleme hatası:', error)
        return { error: 'Proje güncellenirken bir hata oluştu.' }
    }

    revalidatePath('/admin/projects')
    revalidatePath('/projects')
    redirect('/admin/projects')
}
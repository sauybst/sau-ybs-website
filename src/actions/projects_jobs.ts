'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const developer_names = formData.get('developer_names') as string
    const description = formData.get('description') as string
    const image_url = formData.get('image_url') as string
    const project_url = formData.get('project_url') as string

    if (!title || !category || !developer_names || !description) {
        throw new Error('Gerekli alanları doldurunuz.')
    }

    const { error } = await supabase.from('projects').insert({
        title,
        category,
        developer_names,
        description,
        image_url,
        project_url
    })

    if (error) {
        console.error('Error creating project:', error)
        throw new Error('Proje oluşturulurken hata oluştu.')
    }

    revalidatePath('/admin/projects')
    redirect('/admin/projects')
}

export async function deleteProject(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
        console.error('Error deleting project:', error)
        throw new Error('Proje silinirken hata oluştu.')
    }

    revalidatePath('/admin/projects')
}

export async function createJobPosting(formData: FormData) {
    const supabase = await createClient()

    const company_name = formData.get('company_name') as string
    const position_name = formData.get('position_name') as string
    const work_model = formData.get('work_model') as string
    const description = formData.get('description') as string
    const company_logo_url = formData.get('company_logo_url') as string
    const application_link = formData.get('application_link') as string
    const deadline_date = formData.get('deadline_date') as string

    if (!company_name || !position_name || !work_model || !description) {
        throw new Error('Gerekli alanları doldurunuz.')
    }

    const { error } = await supabase.from('job_postings').insert({
        company_name,
        position_name,
        work_model,
        description,
        company_logo_url,
        application_link,
        deadline_date: deadline_date ? new Date(deadline_date).toISOString() : null,
        is_active: true
    })

    if (error) {
        console.error('Error creating job posting:', error)
        throw new Error('İlan oluşturulurken hata oluştu.')
    }

    revalidatePath('/admin/jobs')
    redirect('/admin/jobs')
}

export async function deleteJobPosting(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('job_postings').delete().eq('id', id)

    if (error) {
        console.error('Error deleting job posting:', error)
        throw new Error('İlan silinirken hata oluştu.')
    }

    revalidatePath('/admin/jobs')
}

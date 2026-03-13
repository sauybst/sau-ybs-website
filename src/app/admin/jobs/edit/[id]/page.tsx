import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EditJobForm from './EditJobsForm'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. URL'den ID'yi al
    const { id } = await params;
    const supabase = await createClient()

    // 2. Veritabanından o ilanı bul
    const { data: job, error } = await supabase
        .from('job_postings')
        .select('id, slug, company_name, company_logo_url, position_name, work_model, description, deadline_date, application_link, is_active')
        .eq('id', id)
        .single()

    // 3. İlan yoksa veya hata varsa 404 sayfasına fırlat
    if (error || !job) {
        notFound()
    }

    // 4. Veriyi bulduysa, form bileşenine "job" prop'u olarak gönder
    return <EditJobForm job={job} />
}
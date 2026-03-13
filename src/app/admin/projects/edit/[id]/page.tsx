import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EditProjectForm from './EditProjectForm'
export const runtime = 'edge';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. URL'den ID'yi al (Next.js 15 formatı)
    const { id } = await params;
    const supabase = await createClient()

    // 2. Veritabanından o projeyi bul
    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    // 3. Proje yoksa 404 sayfasına fırlat
    if (error || !project) {
        notFound()
    }

    // 4. Veriyi bulduysa, form bileşenine "project" prop'u olarak gönder
    return <EditProjectForm project={project} />
}
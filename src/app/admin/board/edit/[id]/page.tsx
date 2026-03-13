import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EditBoardMemberForm from './EditBoardForm'

export default async function EditBoardMemberPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. URL'den ID'yi al
    const { id } = await params;
    const supabase = await createClient()

    // 2. Veritabanından o üyeyi bul
    const { data: member, error } = await supabase
        .from('board_members')
        .select('id, slug, full_name, board_role, board_level, term_year, is_active, image_url, linkedin_url, description')
        .eq('id', id)
        .single()

    // 3. Üye yoksa 404 sayfasına fırlat
    if (error || !member) {
        notFound()
    }

    // 4. Veriyi bulduysa, form bileşenine "member" prop'u olarak gönder
    return <EditBoardMemberForm member={member} />
}
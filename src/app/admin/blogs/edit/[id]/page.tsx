import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EditBlogForm from './EditBlogForm'
export const runtime = 'edge';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    // URL'den ID'yi alıyoruz
    const { id } = await params;
    const supabase = await createClient()

    // Düzenlenecek blogun mevcut verilerini veritabanından çekiyoruz
    const { data: blog, error } = await supabase
        .from('blogs')
        .select('id, title, content, type, cover_image_url')
        .eq('id', id)
        .single()

    // Eğer ID hatalıysa veya yazı silinmişse 404 sayfasına yönlendir
    if (error || !blog) {
        notFound()
    }

    // Yazı bulunduysa, verileri form bileşenimize gönderiyoruz
    return <EditBlogForm blog={blog} />
}
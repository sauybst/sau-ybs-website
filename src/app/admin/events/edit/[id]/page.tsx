import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EditEventForm from './EditEventForm'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. URL'den ID'yi al (Next.js 15 formatı)
    const { id } = await params;
    const supabase = await createClient()

    // 2. Veritabanından o etkinliği bul
    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    // 3. Etkinlik yoksa 404 sayfasına fırlat
    if (error || !event) {
        notFound()
    }

    // 4. Veriyi bulduysa, form bileşenine "event" prop'u olarak gönder
    return <EditEventForm event={event} />
}
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const event_date = formData.get('event_date') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string
    const registration_url = formData.get('registration_url') as string
    const imageFile = formData.get('image') as File | null  // 'image_url' değil 'image'!

    if (!title || !slug || !event_date || !location) {
        return { error: 'Gerekli alanları doldurunuz.' }
    }

    const { data: { user } } = await supabase.auth.getUser()

    // --- STORAGE UPLOAD ---
    let image_url: string | null = null

    if (imageFile && imageFile.size > 0) {
        // Benzersiz dosya adı: timestamp + slug + .webp
        const fileName = `${Date.now()}-${slug}.webp`
        const filePath = `event-posters/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('events')           // ← Supabase'deki bucket adın neyse onu yaz
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Afiş yüklenirken hata oluştu: ' + uploadError.message }
        }

        // Public URL al
        const { data: urlData } = supabase.storage
            .from('events')           // ← aynı bucket adı
            .getPublicUrl(filePath)

        image_url = urlData.publicUrl
    }
    // --- STORAGE UPLOAD SON ---

    const { error } = await supabase.from('events').insert({
        title,
        slug,
        event_date: new Date(event_date).toISOString(),
        location,
        description,
        registration_url: registration_url || null,
        image_url,                    // Artık gerçek URL geliyor
        created_by: user?.id,
    })

    if (error) {
        console.error('DB insert hatası:', error)
        return { error: 'Etkinlik oluşturulurken hata oluştu: ' + error.message }
    }

    revalidatePath('/admin/events')
    redirect('/admin/events')
}

export async function deleteEvent(id: string) {
    const supabase = await createClient()

    // 1. Önce kaydı çek, image_url'yi al
    const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('image_url')
        .eq('id', id)
        .single()

    console.log('event:', event)
    console.log('fetchError:', fetchError)

    // 2. Storage'dan resmi sil
    if (event?.image_url) {
        console.log('image_url:', event.image_url)
        const filePath = event.image_url.split('/storage/v1/object/public/events/')[1]
        console.log('filePath:', filePath)

        if (filePath) {
            const { error: storageError } = await supabase.storage
                .from('events')
                .remove([filePath])

            if (storageError) {
                console.error('Storage silme hatası:', storageError)
            }
        }
    }

    // 3. DB'den sil
    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
        console.error('Error deleting event:', error)
        throw new Error('Etkinlik silinirken hata oluştu.')
    }

    revalidatePath('/admin/events')
}

export async function updateEvent(formData: FormData) {
    const supabase = await createClient()

    // Formdan gelen ID'yi yakalıyoruz
    const id = formData.get('id') as string

    // Diğer verileri çekiyoruz
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const event_date = formData.get('event_date') as string
    const location = formData.get('location') as string
    const registration_url = formData.get('registration_url') as string
    const description = formData.get('description') as string

    // Görsel işlemleri için formdan gelen yeni veriler
    const imageFile = formData.get('image_file') as File | null
    const removeImage = formData.get('remove_image') === 'true'
    const oldImageUrl = formData.get('old_image_url') as string

    let finalImageUrl = oldImageUrl; // Varsayılan olarak eski URL'yi tutuyoruz

    // URL'den dosyanın Storage'daki yolunu (path) bulan senin yazdığın mantıkla aynı çalışan fonksiyon
    const extractPathFromUrl = (url: string) => {
        if (!url) return null;
        const parts = url.split('/storage/v1/object/public/events/');
        return parts.length > 1 ? parts[1] : null;
    }

    // SENARYO 1: Kullanıcı resmi sildiyse VEYA yeni bir resim yüklediyse (Eskisini çöpe at)
    if ((removeImage || (imageFile && imageFile.size > 0)) && oldImageUrl) {
        const pathToDelete = extractPathFromUrl(oldImageUrl);
        if (pathToDelete) {
            // Eski resmi Supabase Storage'dan kalıcı olarak sil
            const { error: storageError } = await supabase.storage
                .from('events')
                .remove([pathToDelete]);
            
            if (storageError) {
                console.error('Eski storage silme hatası:', storageError)
            }
        }
        if (removeImage) {
            finalImageUrl = ''; // Sadece "Kaldır"a basıldıysa URL'yi sıfırla
        }
    }

    // SENARYO 2: Yeni bir dosya yüklendiyse (Storage'a gönder ve yeni URL'yi al)
    // Bu kısım senin createEvent fonksiyonundaki mantıkla birebir aynı!
    if (imageFile && imageFile.size > 0) {
        // Benzersiz dosya adı: timestamp + slug + .webp
        const fileName = `${Date.now()}-${slug}.webp`
        const filePath = `event-posters/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('events')           
            .upload(filePath, imageFile, {
                contentType: 'image/webp',
                upsert: false,
            })

        if (uploadError) {
            console.error('Storage upload hatası:', uploadError)
            return { error: 'Afiş yüklenirken hata oluştu: ' + uploadError.message }
        }

        // Public URL al
        const { data: urlData } = supabase.storage
            .from('events')           
            .getPublicUrl(filePath)

        finalImageUrl = urlData.publicUrl
    }

    // Tüm verileri (Varsa yeni resim URL'si ile) Veritabanında Güncelle
    const { error } = await supabase
        .from('events')
        .update({
            title,
            slug,
            event_date: new Date(event_date).toISOString(), // Tarih formatını standartlaştırıyoruz
            location,
            registration_url: registration_url || null,
            description,
            image_url: finalImageUrl || null, // Boş string yerine null atıyoruz
        })
        .eq('id', id)

    if (error) {
        console.error('DB update hatası:', error)
        return { error: 'Etkinlik güncellenirken bir hata oluştu: ' + error.message }
    }

    // Önbelleği temizle ve tabloya geri dön
    revalidatePath('/admin/events')
    revalidatePath(`/events/${slug}`) // Canlı sitedeki detay sayfasının önbelleğini de temizler
    redirect('/admin/events')
}
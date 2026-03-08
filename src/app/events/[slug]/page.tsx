import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CalendarIcon, MapPin, Clock, ArrowLeft, ExternalLink } from 'lucide-react'
export const dynamic = 'force-dynamic';

// Next.js 15 ile uyumlu dinamik parametre yakalama
export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    // URL'deki slug ile veritabanındaki etkinliği eşleştirip çekiyoruz
    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single(); // Sadece bir tane eşleşen etkinlik bekle

    // Eğer böyle bir slug veritabanında yoksa (veya silinmişse) 404 sayfasına yönlendir
    if (error || !event) {
        notFound();
    }

    const eventDate = new Date(event.event_date);
    const isUpcoming = eventDate > new Date();

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Geri Dön Butonu */}
                <Link 
                    href="/events" 
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Etkinliklere Dön
                </Link>

                {/* Ana İçerik Kartı */}
                <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    
                    <div className="h-[28rem] sm:h-[36rem] w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
                        {event.image_url ? (
                            <>
                                {/* Arka plan bulanık efekti (Sinematik etki) */}
                                <div className="absolute inset-0 opacity-40">
                                    <img 
                                        src={event.image_url} 
                                        alt="" 
                                        className="object-cover w-full h-full blur-2xl scale-125" 
                                    />
                                </div>
                                {/* Ana afiş (Kırpılmadan tam boy gösterilir) */}
                                <img 
                                    src={event.image_url} 
                                    alt={event.title} 
                                    className="relative z-10 object-contain w-full h-full p-4 sm:p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                                />
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-brand-300">
                                <CalendarIcon className="h-32 w-32 opacity-20" />
                            </div>
                        )}
                        
                        {/* Yaklaşan / Geçmiş Rozeti */}
                        <div className="absolute top-6 right-6 z-10">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${isUpcoming ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-slate-800/90 text-white'}`}>
                                {isUpcoming ? 'Yaklaşan Etkinlik' : 'Geçmiş Etkinlik'}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        {/* Başlık ve Temel Bilgiler */}
                        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                            {event.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                            <div className="flex items-center text-slate-600">
                                <CalendarIcon className="w-5 h-5 mr-2 text-brand-500" />
                                <span className="font-medium">{eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <Clock className="w-5 h-5 mr-2 text-brand-500" />
                                <span className="font-medium">{eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <MapPin className="w-5 h-5 mr-2 text-brand-500" />
                                <span className="font-medium">{event.location}</span>
                            </div>
                        </div>

                        {/* Zengin Metin Açıklaması (React Quill HTML Çıktısı Buraya Basılır) */}
                        <div className="prose prose-slate prose-lg max-w-none font-montserrat prose-a:text-brand-600 hover:prose-a:text-brand-700">
                            {/* dangerouslySetInnerHTML, React'te HTML stringlerini render etmek için kullanılır */}
                            <div dangerouslySetInnerHTML={{ __html: event.description || '<p>Bu etkinlik için henüz bir açıklama girilmemiş.</p>' }} />
                        </div>

                        {/* Kayıt Butonu (Sadece Yaklaşan etkinliklerde ve link varsa çıkar) */}
                        {isUpcoming && event.registration_url && (
                            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                                <a 
                                    href={event.registration_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-brand-600 hover:bg-brand-500 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto"
                                >
                                    Etkinliğe Kayıt Ol <ExternalLink className="ml-2 w-5 h-5" />
                                </a>
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </div>
    )
}
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, Trash2, MapPin, Eye, Edit, ScanLine, BarChart2} from 'lucide-react'
import { deleteEvent } from '@/actions/events'
import DeleteConfirmButton from '@/components/DeleteConfirmButton'
import { TICKETING_MODE } from '@/types/event'

export default async function EventsPage() {
    const supabase = await createClient()

    // SİSTEM DÜZELTMESİ: ticketing_mode eklendi
    const { data: events, error } = await supabase
        .from('events')
        .select('id, slug, title, event_date, location, image_url, ticketing_mode')
        .order('event_date', { ascending: false })

    if (error) {
        console.error('[Events:admin]', error)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                        Etkinlik Yönetimi
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Sistemdeki tüm etkinlikleri görüntüleyin, düzenleyin veya silin.</p>
                </div>
                <Link 
                    href="/admin/events/create" 
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Yeni Etkinlik Ekle
                </Link>
            </div>

            <div className="flex flex-col gap-4">
                {events?.map((event) => {
                    const isUpcoming = new Date(event.event_date) > new Date();
                    // SİSTEM DÜZELTMESİ: Etkinlik biletli mi kontrolü
                    const hasTicketing = event.ticketing_mode !== TICKETING_MODE.FREE;

                    return (
                        <div key={event.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 sm:items-center justify-between group">
                            
                            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                    {event.image_url ? (
                                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Calendar className="w-8 h-8 text-brand-200" />
                                    )}
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isUpcoming ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {isUpcoming ? 'Yaklaşan' : 'Geçmiş'}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900 truncate">
                                            {event.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium mt-1">
                                        <div className="flex items-center">
                                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
                                            <time dateTime={event.event_date}>
                                                {new Date(event.event_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
                                            <span className="truncate max-w-[150px] sm:max-w-xs">{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                
                                {/* SİSTEM DÜZELTMESİ: İstatistik butonu sadece biletli etkinliklerde görünür */}
                                {hasTicketing && (
                                    <Link 
                                        href={`/admin/events/${event.id}`} 
                                        className="p-2.5 text-slate-400 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-colors tooltip-trigger"
                                        title="Etkinlik İstatistikleri"
                                    >
                                        <BarChart2 className="w-5 h-5" />
                                    </Link>
                                )}
                                
                                {/* SİSTEM DÜZELTMESİ: Scanner butonu sadece biletli ve yaklaşan etkinliklerde görünür */}
                                {hasTicketing && isUpcoming && (
                                    <Link 
                                        href={`/admin/events/${event.id}/scanner`}
                                        className="p-2.5 text-slate-400 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors tooltip-trigger"
                                        title="Kamera ile Yoklama Al"
                                    >
                                        <ScanLine className="w-5 h-5" />
                                    </Link>
                                )}

                                <Link 
                                    href={`/events/${event.slug}`} 
                                    target="_blank"
                                    className="p-2.5 text-slate-400 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-colors tooltip-trigger"
                                    title="Sitede Görüntüle"
                                >
                                    <Eye className="w-5 h-5" />
                                </Link>

                                <Link 
                                    href={`/admin/events/edit/${event.id}`} 
                                    className="p-2.5 text-slate-400 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>

                                <DeleteConfirmButton
                                    id={event.id}
                                    onDelete={deleteEvent}
                                    itemName={event.title}
                                />
                            </div>

                        </div>
                    )
                })}

                {(!events || events.length === 0) && (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz Etkinlik Yok</h3>
                        <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
                            Sistemde kayıtlı herhangi bir etkinlik bulunamadı. Yeni bir etkinlik oluşturarak hemen başlayabilirsiniz.
                        </p>
                        <Link 
                            href="/admin/events/create" 
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            İlk Etkinliği Ekle
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
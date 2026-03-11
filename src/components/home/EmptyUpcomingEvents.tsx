import { Calendar as CalendarIcon } from 'lucide-react'

export default function EmptyUpcomingEvents() {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
      <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <CalendarIcon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-slate-900 mb-2">Yakında Görüşmek Üzere</h3>
      <p className="text-slate-500">
        Şu an için listelenmiş yeni bir etkinlik bulunmamaktadır. Sosyal medya hesaplarımızı takipte kalın!
      </p>
    </div>
  )
}

import { CheckCircle } from 'lucide-react'
import type { IdentityCardItem } from '@/data/identity-cards'

export default function IdentityCard({ item }: { item: IdentityCardItem }) {
  const Icon = item.icon

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-heading font-bold text-slate-900 mb-4">{item.title}</h4>
        <ul className="mt-2 text-left space-y-4 text-sm md:text-base text-slate-700 font-normal leading-relaxed w-full font-montserrat">
          {item.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

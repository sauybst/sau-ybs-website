import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  icon: LucideIcon
  value: string | number
  label: string
  /** Tailwind text-size class — varsayılan: text-5xl */
  textSize?: string
}

export default function MetricCard({ icon: Icon, value, label, textSize = 'text-5xl' }: MetricCardProps) {
  return (
    <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:-translate-y-1 hover:bg-white/20 transition-all duration-300">
      <Icon className="w-12 h-12 mx-auto text-brand-300 mb-5 drop-shadow-md" />
      <div className={`${textSize} font-heading font-extrabold text-white mb-3 drop-shadow-md`}>
        {value}
      </div>
      <div className="text-brand-200 text-sm font-semibold tracking-wide uppercase">
        {label}
      </div>
    </div>
  )
}


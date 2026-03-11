import { Target, Lightbulb, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type IdentityCardItem = {
  title: string
  icon: LucideIcon
  bullets: string[]
}

export const identityCards: IdentityCardItem[] = [
  {
    title: 'Amacımız',
    icon: Target,
    bullets: [
      'Öğrencilerde takım çalışması, liderlik ve analitik düşünme becerilerini geliştirmek.',
      'Bilişim ve yönetim bilimlerini harmanlayarak sektöre nitelikli yetenekler kazandırmak.',
    ],
  },
  {
    title: 'Vizyonumuz',
    icon: Lightbulb,
    bullets: [
      'Sadece üniversite içinde değil, ulusal çapta teknoloji ve bilişim ekosistemine yön vermek.',
      'Sektörel sorunlara çözüm sunan, yenilikçi projeler üreten öncü bir öğrenci topluluğu olmak.',
    ],
  },
  {
    title: 'Neden Biz?',
    icon: Trophy,
    bullets: [
      'İdeathon ve kariyer zirveleriyle dolu dinamik bir ekosistem.',
      'Yapay zeka ve topluluk otomasyonu gibi pratik projeler geliştirme imkanı.',
      'Proje yönetimi ve kurumsal sistem analizi alanlarında gerçek dünya tecrübesi.',
    ],
  },
]

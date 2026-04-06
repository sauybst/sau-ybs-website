// ============================================================
// Site Geneli Navigasyon Yapılandırması
// Header, Footer ve Mobil menüde ortak kullanılır (DRY).
// ============================================================

export interface NavItem {
    name: string
    href: string
}

/** Ana navigasyon linkleri — Header ve Footer'da kullanılır */
export const NAV_ITEMS: NavItem[] = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Etkinlikler', href: '/events' },
    { name: 'Duyurular & Blog', href: '/blogs' },
    { name: 'Projeler', href: '/projects' },
    { name: 'Hakkımızda', href: '/board' },
    { name: 'Staj & İş İlanları', href: '/jobs' },
]

/** Footer'da ek olarak görünen yasal sayfalar */
export const LEGAL_LINKS: NavItem[] = [
    { name: 'Aydınlatma Metni', href: '/privacyPolicy' },
    { name: 'Çerez Politikası', href: '/cookiePolicy' },
    { name: 'Kullanıcı Sözleşmesi', href: '/terms' }
]

/** Sosyal medya linkleri */
export interface SocialLink {
    name: string
    href: string
    icon: string // lucide-react ikon adı
}

export const SOCIAL_LINKS: SocialLink[] = [
    { name: 'Facebook', href: 'https://www.facebook.com/sauybst/', icon: 'Facebook' },
    { name: 'Instagram', href: 'https://www.instagram.com/sauybst/', icon: 'Instagram' },
    { name: 'Twitter', href: 'https://x.com/SAUYBST', icon: 'Twitter' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/sauybst/', icon: 'Linkedin' },
    { name: 'Github', href: 'https://github.com/sauybst', icon: 'Github' },
]

/** Dış bağlantılar */
export const EXTERNAL_LINKS = {
    SABIS_COMMUNITY: 'https://topluluk.sabis.sakarya.edu.tr/sau-yonetim-bilisim-sistemleri-ogrenci-toplulugu',
    CONTACT_EMAIL: 'sauybst@gmail.com',
    INSTAGRAM_DM: 'https://ig.me/m/sauybst',
} as const

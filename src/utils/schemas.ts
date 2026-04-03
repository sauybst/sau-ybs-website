// ============================================================
// Girdi Doğrulama Şemaları (Zod)
// Tüm form verilerinin server-side doğrulaması için kullanılır.
// ============================================================

import { z } from 'zod'
import { TICKETING_MODE } from '@/types/event';

// --- Blog ---

export const BlogSchema = z.object({
    title: z.string().min(1, 'Başlık boş bırakılamaz.').max(200, 'Başlık en fazla 200 karakter olmalı.'),
    content: z.string().min(10, 'İçerik en az 10 karakter olmalı.'),
    type: z.coerce.number().int().min(0).max(10, 'Geçersiz yazı tipi.'),
})

// --- Etkinlik ---

export const EventSchema = z.object({
    title: z.string().min(1, 'Başlık boş bırakılamaz.').max(200),
    slug: z.string().min(1, 'Slug boş bırakılamaz.').max(200),
    event_date: z.string().min(1, 'Etkinlik tarihi zorunludur.'),
    location: z.string().min(1, 'Konum zorunludur.').max(300),
    description: z.string().optional(),
    registration_url: z.string().url('Geçerli bir URL giriniz.').or(z.literal('')).optional(),
    
    ticketing_mode: z.union([
        z.literal(TICKETING_MODE.FREE),
        z.literal(TICKETING_MODE.STANDARD_QR),
        z.literal(TICKETING_MODE.BUS_QR)
    ]).default(TICKETING_MODE.FREE),
    
    capacity: z.number().int('Kontenjan tam sayı olmalıdır.').positive('Kontenjan 0\'dan büyük olmalıdır.').nullable().optional(),
})

// --- İş İlanı ---

export const JobSchema = z.object({
    company_name: z.string().min(1, 'Şirket adı zorunludur.').max(200),
    position_name: z.string().min(1, 'Pozisyon adı zorunludur.').max(200),
    work_model: z.coerce.number().int().min(0).max(10, 'Geçersiz çalışma modeli.'),
    description: z.string().min(1, 'Açıklama zorunludur.'),
    deadline_date: z.string().optional(),
    application_link: z.string().url('Geçerli bir URL giriniz.').or(z.literal('')).optional(),
    is_active: z.boolean().optional().default(true),
})

// --- Proje ---

export const ProjectSchema = z.object({
    title: z.string().min(1, 'Başlık boş bırakılamaz.').max(200),
    slug: z.string().optional(),
    category: z.string().min(1, 'Kategori zorunludur.').max(100),
    developer_names: z.string().min(1, 'Geliştiriciler zorunludur.').max(500),
    description: z.string().min(1, 'Açıklama zorunludur.'),
    project_url: z.string().url('Geçerli bir URL giriniz.').or(z.literal('')).optional(),
})

// --- Yönetim Kurulu Üyesi ---

export const BoardMemberSchema = z.object({
    full_name: z.string().min(1, 'Ad Soyad zorunludur.').max(200),
    slug: z.string().optional(),
    board_role: z.string().min(1, 'Görev zorunludur.').max(200),
    board_level: z.string().min(1, 'Seviye zorunludur.').max(100),
    term_year: z.string().min(1, 'Dönem yılı zorunludur.').max(20),
    is_active: z.boolean().optional().default(false),
    linkedin_url: z.string().url('Geçerli bir URL giriniz.').or(z.literal('')).optional(),
    description: z.string().optional(),
})

// --- Kullanıcı Oluşturma ---

export const CreateUserSchema = z.object({
    email: z.string().min(1, 'E-posta zorunludur.').email('Geçerli bir e-posta adresi giriniz.'),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalı.'),
    first_name: z.string().min(1, 'Ad zorunludur.').max(100),
    last_name: z.string().min(1, 'Soyad zorunludur.').max(100),
    role: z.string().min(1, 'Rol zorunludur.'),
})

// --- UUID Doğrulama ---

export const UUIDSchema = z.string().uuid('Geçersiz kayıt kimliği.')

// --- Kullanıcı Yetki Güncelleme ---

const VALID_ROLES = ['super_admin', 'editor', 'viewer'] as const
const VALID_MODULES = ['blogs', 'events', 'jobs', 'projects'] as const

export const UpdateUserPermissionsSchema = z.object({
    userId: z.string().uuid('Geçersiz kullanıcı kimliği.'),
    role: z.enum(VALID_ROLES, { error: 'Geçersiz rol.' }),
    modules: z.array(
        z.enum(VALID_MODULES, { error: 'Geçersiz modül.' })
    ),
})

// --- Yardımcı tip ---

export type ActionState = {
    error?: string
    success?: boolean
}

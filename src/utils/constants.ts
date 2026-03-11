// ============================================================
// Proje Genelinde Kullanılan Sabitler
// Magic string'lerin merkezi yönetimi
// ============================================================

export const STORAGE_BUCKETS = {
    BLOGS: 'blogs',
    EVENTS: 'events',
    JOBS: 'jobs',
    PROJECTS: 'projects',
    BOARD: 'board',
} as const

export const STORAGE_FOLDERS = {
    BLOG_COVERS: 'blog-covers',
    EVENT_POSTERS: 'event-posters',
    COMPANY_LOGOS: 'company-logos',
    PROJECT_COVERS: 'project-covers',
    MEMBERS: 'members',
} as const

export const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Dosya yükleme limitleri
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/webp', 'image/jpeg', 'image/png'] as string[],
} as const

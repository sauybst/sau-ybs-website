import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()
    
    // Sitenin canlıdaki ana domaini (Sonunda slash / olmasın)
    const baseUrl = 'https://www.sauybst.com' 

    // 1. STATİK SAYFALAR (Tüm ana menü linkleri)
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0, // Ana sayfa her zaman 1.0 olmalı
        },
        {
            url: `${baseUrl}/board`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/events`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/jobs`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }
    ]

    // 2. DİNAMİK SAYFALAR (Veritabanından Slug ile Çekilenler)

    // A) Blog Yazıları
    const { data: blogs } = await supabase.from('blogs').select('slug, created_at')
    const dynamicBlogRoutes: MetadataRoute.Sitemap = blogs?.map((blog) => ({
        url: `${baseUrl}/blogs/${blog.slug}`,
        lastModified: new Date(blog.created_at),
        changeFrequency: 'weekly',
        priority: 0.7,
    })) || []

    // B) Etkinlikler
    const { data: events } = await supabase.from('events').select('slug, created_at')
    const dynamicEventRoutes: MetadataRoute.Sitemap = events?.map((event) => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: new Date(event.created_at),
        changeFrequency: 'weekly',
        priority: 0.7,
    })) || []

    // C) Staj & İş İlanları
    const { data: jobs } = await supabase.from('job_postings').select('slug, created_at')
    const dynamicJobRoutes: MetadataRoute.Sitemap = jobs?.map((job) => ({
        url: `${baseUrl}/jobs/${job.slug}`,
        lastModified: new Date(job.created_at),
        changeFrequency: 'weekly',
        priority: 0.7,
    })) || []

    // D) Öğrenci Projeleri
    const { data: projects } = await supabase.from('projects').select('slug, created_at')
    const dynamicProjectRoutes: MetadataRoute.Sitemap = projects?.map((project) => ({
        url: `${baseUrl}/projects/${project.slug}`,
        lastModified: new Date(project.created_at),
        changeFrequency: 'monthly',
        priority: 0.6,
    })) || []

    // 3. Tüm rotaları birleştirip arama motoru botlarına teslim ediyoruz
    return [
        ...staticRoutes, 
        ...dynamicBlogRoutes, 
        ...dynamicEventRoutes,
        ...dynamicJobRoutes,
        ...dynamicProjectRoutes
    ]
}
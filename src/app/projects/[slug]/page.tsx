import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FolderOpen, User, Calendar, ArrowLeft, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'

import ShareButton from '@/components/ShareButton'
import ProjectJsonLd from '@/components/projects/ProjectJsonLd'
import { sanitizeHtml } from '@/lib/sanitize'
import type { ProjectDetail } from '@/types/project'

export const runtime = 'edge';
export const dynamic = 'force-dynamic'

/** Detay sayfasında kullanılan alanlar */
const PROJECT_DETAIL_SELECT =
  'id,slug,title,description,image_url,project_url,developer_names,category,created_at' as const

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('title, description, image_url')
    .eq('slug', slug)
    .single()

  if (!project) return {}

  const cleanDescription =
    project.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'

  return {
    title: project.title,
    description: cleanDescription,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.title,
      description: cleanDescription,
      images: [
        {
          url: project.image_url || '/og-default.webp',
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: cleanDescription,
      images: [project.image_url || '/og-default.webp'],
    },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select(PROJECT_DETAIL_SELECT)
    .eq('slug', slug)
    .single()

  if (error || !project) {
    if (error) console.error('[Projects:detail]', error)
    notFound()
  }

  const typedProject = project as unknown as ProjectDetail
  const createdDate = new Date(typedProject.created_at)

  /* XSS koruması: Veritabanından gelen HTML'i DOMPurify ile temizle */
  const safeDescription = typedProject.description
    ? sanitizeHtml(typedProject.description)
    : '<p>Bu proje için henüz bir açıklama girilmemiş.</p>'

  return (
    <section aria-label="Proje detayı" className="bg-slate-50 min-h-screen pt-24 pb-16">
      {/* JSON-LD Yapılandırılmış Veri */}
      <ProjectJsonLd project={typedProject} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Geri Dön */}
        <Link
          href="/projects"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Projelere Dön
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Görsel Alanı */}
          <div className="h-[28rem] sm:h-[36rem] w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
            {typedProject.image_url ? (
              <>
                <div className="absolute inset-0 opacity-40" aria-hidden="true">
                  <Image
                    src={typedProject.image_url}
                    alt=""
                    fill
                    className="object-cover blur-2xl scale-125"
                    sizes="100vw"
                    priority
                  />
                </div>
                <Image
                  src={typedProject.image_url}
                  alt={typedProject.title}
                  fill
                  className="relative z-10 object-contain p-4 sm:p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              </>
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-brand-300"
                aria-hidden="true"
              >
                <FolderOpen className="h-32 w-32 opacity-20" />
              </div>
            )}

            {/* Kategori Rozeti */}
            {typedProject.category && (
              <div className="absolute top-6 right-6 z-10">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md bg-slate-900/90 text-white">
                  {typedProject.category}
                </span>
              </div>
            )}
          </div>

          {/* İçerik */}
          <div className="p-8 sm:p-12">
            {/* Başlık ve Paylaş */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight flex-1">
                {typedProject.title}
              </h1>
              <div className="flex-shrink-0 mt-1 sm:mt-0">
                <ShareButton title={typedProject.title} />
              </div>
            </div>

            {/* Meta Bilgileri */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-slate-100">
              {typedProject.developer_names && (
                <div className="flex items-center text-slate-600">
                  <User className="w-5 h-5 mr-2 text-brand-500" />
                  <span className="font-medium">{typedProject.developer_names}</span>
                </div>
              )}
              {typedProject.category && (
                <div className="flex items-center text-slate-600">
                  <FolderOpen className="w-5 h-5 mr-2 text-brand-500" />
                  <span className="font-medium">{typedProject.category}</span>
                </div>
              )}
              <div className="flex items-center text-slate-600">
                <Calendar className="w-5 h-5 mr-2 text-brand-500" />
                <time dateTime={typedProject.created_at} className="font-medium">
                  {createdDate.toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>
            </div>

            {/* Açıklama — DOMPurify ile sanitize edilmiş HTML */}
            <div className="prose prose-slate prose-lg max-w-none font-montserrat prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-img:rounded-xl prose-img:shadow-sm">
              <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
            </div>

            {/* Proje / GitHub Link Butonu */}
            {typedProject.project_url && (
              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                <a
                  href={typedProject.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-brand-600 hover:bg-brand-500 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto group"
                >
                  Projeyi İncele{' '}
                  <ExternalLink className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </a>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { Metadata } from 'next'

import ShareButton from '@/components/ShareButton'
import BlogJsonLd from '@/components/blogs/BlogJsonLd'
import { sanitizeHtml } from '@/lib/sanitize'
import { getBlogTypeConfig } from '@/data/blog-types'
import type { BlogDetail } from '@/types/blog'

export const dynamic = 'force-dynamic'

/** Detay sayfasında kullanılan alanlar */
const BLOG_DETAIL_SELECT =
  'id,slug,title,content,cover_image_url,published_at,type,profiles(first_name,last_name)' as const

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: blog } = await supabase
    .from('blogs')
    .select('title, content, cover_image_url')
    .eq('slug', slug)
    .single()

  if (!blog) return {}

  const cleanDescription =
    blog.content?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'

  return {
    title: blog.title,
    description: cleanDescription,
    alternates: { canonical: `/blogs/${slug}` },
    openGraph: {
      title: blog.title,
      description: cleanDescription,
      images: [
        {
          url: blog.cover_image_url || '/og-default.webp',
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: cleanDescription,
      images: [blog.cover_image_url || '/og-default.webp'],
    },
  }
}

export default async function BlogReadingPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: blog, error } = await supabase
    .from('blogs')
    .select(BLOG_DETAIL_SELECT)
    .eq('slug', slug)
    .single()

  /* Güvenlik: Hata detaylarını kullanıcıya gösterme, sadece logla */
  if (error || !blog) {
    if (error) console.error('[Blogs:detail]', error)
    notFound()
  }

  const typedBlog = blog as unknown as BlogDetail
  const typeConfig = getBlogTypeConfig(typedBlog.type)
  const TypeIcon = typeConfig.icon

  /* XSS koruması: Veritabanından gelen HTML'i DOMPurify ile temizle */
  const safeContent = sanitizeHtml(typedBlog.content)

  const authorName = typedBlog.profiles
    ? `${typedBlog.profiles.first_name || 'SAU YBS'} ${typedBlog.profiles.last_name || 'Topluluğu'}`
    : 'SAU YBS Topluluğu'

  return (
    <section aria-label="Blog detayı" className="bg-slate-50 min-h-screen pt-24 pb-16">
      {/* JSON-LD Yapılandırılmış Veri */}
      <BlogJsonLd blog={typedBlog} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Geri Dön */}
        <Link
          href="/blogs"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Tüm Yazılara Dön
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Kapak Görseli */}
          <div className="h-[24rem] sm:h-[32rem] w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
            {typedBlog.cover_image_url ? (
              <>
                <div className="absolute inset-0 opacity-40" aria-hidden="true">
                  <Image
                    src={typedBlog.cover_image_url}
                    alt=""
                    fill
                    className="object-cover blur-2xl scale-125"
                    sizes="100vw"
                    priority
                  />
                </div>
                <Image
                  src={typedBlog.cover_image_url}
                  alt={typedBlog.title}
                  fill
                  className="relative z-10 object-contain p-4 sm:p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              </>
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400"
                aria-hidden="true"
              >
                <TypeIcon className="h-32 w-32 opacity-20" />
              </div>
            )}

            {/* Kategori Rozeti */}
            <div className="absolute top-6 left-6 z-20">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${typeConfig.color}`}
              >
                <TypeIcon className="w-4 h-4 mr-1.5" />
                {typeConfig.name}
              </span>
            </div>
          </div>

          {/* İçerik */}
          <div className="p-8 sm:p-12 sm:pt-10">
            {/* Başlık ve Metadata */}
            <div className="mb-10 pb-10 border-b border-slate-100">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.15]">
                {typedBlog.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-6">
                {/* Yazar ve Tarih */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-full flex items-center justify-center text-brand-600 border border-brand-200/50 shadow-inner">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="text-sm leading-tight">
                      <p className="font-bold text-slate-900 text-base">{authorName}</p>
                      <p className="text-brand-500 font-medium tracking-wide text-xs uppercase mt-0.5">
                        Yazar
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block h-8 w-px bg-slate-200" />

                  <div className="flex items-center text-slate-500">
                    <Calendar className="w-5 h-5 mr-2 text-slate-400" />
                    <time dateTime={typedBlog.published_at ?? undefined} className="font-medium">
                      {typedBlog.published_at
                        ? new Date(typedBlog.published_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Tarih belirtilmedi'}
                    </time>
                  </div>
                </div>

                <ShareButton title={typedBlog.title} />
              </div>
            </div>

            {/* Açıklama — DOMPurify ile sanitize edilmiş HTML */}
            <div className="prose prose-slate prose-lg md:prose-xl max-w-none font-montserrat prose-headings:font-heading prose-headings:font-bold prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-img:rounded-2xl prose-img:shadow-md">
              <div dangerouslySetInnerHTML={{ __html: safeContent }} />
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
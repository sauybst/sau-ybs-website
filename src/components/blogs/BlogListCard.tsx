import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Calendar, User } from 'lucide-react'
import type { BlogListItem } from '@/types/blog'
import { getBlogTypeConfig } from '@/data/blog-types'

/** HTML etiketlerini temizleyip düz metin özeti oluşturur */
function stripHtmlToPlainText(html: string): string {
  if (!html) return ''
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<\/?br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n+/g, '\n')
    .trim()
}

export default function BlogListCard({ blog }: { blog: BlogListItem }) {
  const typeConfig = getBlogTypeConfig(blog.type)
  const TypeIcon = typeConfig.icon

  return (
    <article className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group">
      {/* Görsel Alanı */}
      <div className="h-64 sm:h-72 w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
        {blog.cover_image_url ? (
          <>
            <div className="absolute inset-0 opacity-50" aria-hidden="true">
              <Image
                src={blog.cover_image_url}
                alt=""
                fill
                className="object-cover blur-xl scale-125 group-hover:scale-150 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <Image
              src={blog.cover_image_url}
              alt={blog.title}
              fill
              className="relative z-10 object-contain p-4 group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400"
            aria-hidden="true"
          >
            <BookOpen className="h-20 w-20 opacity-40" />
          </div>
        )}

        {/* Kategori Rozeti */}
        <div className="absolute top-4 left-4 z-20">
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md border ${typeConfig.color}`}
          >
            <TypeIcon className="w-3.5 h-3.5 mr-1.5" />
            {typeConfig.name}
          </span>
        </div>
      </div>

      {/* İçerik */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium mb-3">
          <Calendar className="w-4 h-4 text-brand-400" />
          <time dateTime={blog.published_at ?? undefined}>
            {blog.published_at
              ? new Date(blog.published_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Tarih belirtilmedi'}
          </time>
        </div>

        <h3 className="text-2xl font-heading font-bold text-slate-900 mb-4 tracking-tight leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
          <Link href={`/blogs/${blog.slug}`} className="before:absolute before:inset-0 before:z-20">
            {blog.title}
          </Link>
        </h3>

        <p className="text-slate-600 text-sm flex-1 leading-relaxed line-clamp-3 mb-6 font-montserrat whitespace-pre-line">
          {stripHtmlToPlainText(blog.content)}
        </p>

        {/* Yazar */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center relative z-30">
          <div className="flex items-center gap-x-3">
            <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-full flex items-center justify-center text-brand-600 border border-brand-200/50 shadow-inner">
              <User className="h-5 w-5" />
            </div>
            <div className="text-sm leading-tight">
              <p className="font-bold text-slate-900">
                {blog.profiles?.first_name || 'SAU YBS'}{' '}
                {blog.profiles?.last_name || 'Topluluğu'}
              </p>
              <p className="text-brand-500 font-medium tracking-wide text-[10px] uppercase mt-0.5">
                Yazar
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

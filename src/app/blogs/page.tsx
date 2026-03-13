import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FileText } from 'lucide-react'

import BlogListCard from '@/components/blogs/BlogListCard'
import { blogFilterButtons, VALID_BLOG_TYPE_FILTERS } from '@/data/blog-types'
import type { BlogListItem } from '@/types/blog'
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Blog ve Duyurular',
  description:
    'Sakarya Üniversitesi YBS Topluluğu — makaleler, teknoloji haberleri ve topluluk duyuruları.',
  alternates: { canonical: '/blogs' },
}

/** Liste sayfasında kullanılan alanlar */
const BLOG_LIST_SELECT =
  'id,slug,title,content,cover_image_url,published_at,type,profiles(first_name,last_name)' as const

type SearchParams = Promise<{ type?: string }>

export default async function PublicBlogsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { type: typeFilter } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('blogs')
    .select(BLOG_LIST_SELECT)
    .order('published_at', { ascending: false })

  /* Güvenli filtre: sadece izin verilen değerler kabul edilir */
  if (
    typeFilter &&
    typeFilter !== 'all' &&
    (VALID_BLOG_TYPE_FILTERS as readonly string[]).includes(typeFilter)
  ) {
    query = query.eq('type', parseInt(typeFilter, 10))
  }

  const { data: blogs, error } = await query

  if (error) {
    console.error('[Blogs:list]', error)
  }

  const typedBlogs = (blogs ?? []) as unknown as BlogListItem[]

  return (
    <section aria-label="Blog ve duyurular" className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <header className="text-center mb-12">
          <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">
            İçeriklerimiz
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
            Blog ve Duyurular
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto font-montserrat leading-relaxed">
            Topluluğumuzdan haberdar olun, bilim, teknoloji ve yönetim dünyasından yazılarımızı okuyun.
          </p>
        </header>

        {/* Filtre Butonları */}
        <nav aria-label="Blog filtresi" className="flex flex-wrap justify-center gap-3 mb-12">
          {blogFilterButtons.map((btn) => {
            const isActive =
              btn.filterValue === 'all'
                ? !typeFilter || typeFilter === 'all'
                : typeFilter === btn.filterValue

            return (
              <Link
                key={btn.filterValue}
                href={btn.href}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center ${
                  isActive
                    ? `${btn.activeColor} text-white shadow-lg scale-105`
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {btn.label}
              </Link>
            )
          })}
        </nav>

        {/* Blog Kartları */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {typedBlogs.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-slate-300">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Bu Kategoride Yazı Yok</h2>
              <p className="text-slate-500 max-w-sm">
                Şu anda bu kriterlere uygun yayınlanmış bir içerik bulunmuyor. Lütfen daha sonra tekrar kontrol edin.
              </p>
            </div>
          ) : (
            typedBlogs.map((blog) => <BlogListCard key={blog.id} blog={blog} />)
          )}
        </div>
      </div>
    </section>
  )
}
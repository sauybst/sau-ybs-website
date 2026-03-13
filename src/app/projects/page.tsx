import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

import ProjectListCard from '@/components/projects/ProjectListCard'
import type { ProjectListItem } from '@/types/project'


export const metadata: Metadata = {
  title: 'Açık Kaynak Projeler',
  description:
    'Sakarya Üniversitesi YBS Topluluğu üyeleri tarafından geliştirilen açık kaynak ve teknoloji projeleri.',
  alternates: { canonical: '/projects' },
}

/** Liste sayfasında kullanılan alanlar */
const PROJECT_LIST_SELECT = 'id,slug,title,image_url,project_url,developer_names,category' as const

type SearchParams = Promise<{ category?: string }>

export default async function PublicProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { category: categoryFilter } = await searchParams
  const currentFilter = categoryFilter || 'all'

  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select(PROJECT_LIST_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Projects:list]', error)
  }

  const typedProjects = (projects ?? []) as unknown as ProjectListItem[]

  /* Kategorileri filtre butonları için çıkar */
  const uniqueCategories = Array.from(
    new Set(typedProjects.map((p) => p.category).filter(Boolean))
  ) as string[]

  /* Seçili kategoriye göre filtrele */
  const filteredProjects =
    currentFilter === 'all'
      ? typedProjects
      : typedProjects.filter((p) => p.category === currentFilter)

  return (
    <section aria-label="Proje vitrinimiz" className="bg-slate-50 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <header className="text-center mb-12">
          <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">
            Açık Kaynak
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
            Projelerimiz
          </h1>
          <p className="mt-4 max-w-2xl text-medium text-slate-600 mx-auto font-montserrat">
            Topluluk üyelerimizin geliştirdiği yenilikçi yazılımlar, yapay zeka modelleri ve otomasyon sistemleri.
          </p>

          {/* Kategori Filtreleri */}
          <nav aria-label="Proje kategori filtresi" className="flex flex-wrap justify-center items-center gap-3 mt-8">
            <Link
              href="?category=all"
              scroll={false}
              className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                currentFilter === 'all'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tümü
            </Link>
            {uniqueCategories.map((category) => (
              <Link
                key={category}
                href={`?category=${encodeURIComponent(category)}`}
                scroll={false}
                className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                  currentFilter === category
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category}
              </Link>
            ))}
          </nav>
        </header>

        {/* Proje Kartları */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.length === 0 ? (
            <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
              Bu kategoride henüz listelenmiş bir proje bulunmamaktadır.
            </p>
          ) : (
            filteredProjects.map((project) => (
              <ProjectListCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
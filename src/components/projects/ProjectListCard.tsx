import Link from 'next/link'
import Image from 'next/image'
import { FolderOpen, ExternalLink, User, Code } from 'lucide-react'
import type { ProjectListItem } from '@/types/project'

export default function ProjectListCard({ project }: { project: ProjectListItem }) {
  return (
    <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group">
      {/* Kategori Rozeti */}
      {project.category && (
        <div className="absolute top-4 right-4 z-20">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md bg-slate-900/90 text-white">
            {project.category}
          </span>
        </div>
      )}

      {/* Görsel Alanı */}
      <div className="h-64 bg-slate-950 w-full relative overflow-hidden flex items-center justify-center">
        {project.image_url ? (
          <>
            <div className="absolute inset-0 opacity-40" aria-hidden="true">
              <Image
                src={project.image_url}
                alt=""
                fill
                className="object-cover blur-xl scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <Image
              src={project.image_url}
              alt={project.title}
              fill
              className="relative z-10 object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-in-out drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center text-slate-300"
            aria-hidden="true"
          >
            <Code className="h-20 w-20 opacity-50" />
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center space-x-2 text-sm text-brand-500 font-semibold mb-3">
          <FolderOpen className="h-4 w-4" />
          <span>Açık Kaynak</span>
        </div>

        <h3 className="text-2xl font-heading font-bold text-slate-900 mb-4 tracking-tight leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
          <Link href={`/projects/${project.slug}`}>
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            {project.title}
          </Link>
        </h3>

        {project.developer_names && (
          <div className="flex items-start text-slate-500 text-sm mb-6">
            <User className="h-5 w-5 mr-2 flex-shrink-0 text-brand-400 mt-0.5" />
            <span className="line-clamp-1" title={project.developer_names}>
              {project.developer_names}
            </span>
          </div>
        )}

        {/* Alt Kısım */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between relative z-20">
          <Link
            href={`/projects/${project.slug}`}
            className="text-brand-600 font-bold text-sm hover:text-brand-700 transition-colors"
          >
            Detayları İncele &rarr;
          </Link>

          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all"
              title="Projeye / GitHub'a Git"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

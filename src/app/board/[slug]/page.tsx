import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Shield, Calendar, Linkedin, Info } from 'lucide-react'
import { Metadata } from 'next'

import ShareButton from '@/components/ShareButton'
import PersonJsonLd from '@/components/board/PersonJsonLd'
import { sanitizeHtml } from '@/lib/sanitize'
import type { BoardMemberDetail } from '@/types/board-member'

export const dynamic = 'force-dynamic'

/** Detay sayfasında kullanılan alanlar */
const MEMBER_DETAIL_SELECT =
  'id,slug,full_name,board_role,board_level,term_year,is_active,image_url,linkedin_url,description' as const

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: member } = await supabase
    .from('board_members')
    .select('full_name, board_role, description, image_url')
    .eq('slug', slug)
    .single()

  if (!member) return {}

  const cleanDescription = member.description
    ? member.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
    : `${member.full_name} — ${member.board_role}, SAÜ YBS Topluluğu Yönetim Kurulu üyesi.`

  return {
    title: `${member.full_name} — ${member.board_role}`,
    description: cleanDescription,
    alternates: { canonical: `/board/${slug}` },
    openGraph: {
      title: `${member.full_name} — ${member.board_role}`,
      description: cleanDescription,
      images: [
        {
          url: member.image_url || '/og-default.webp',
          width: 1200,
          height: 630,
          alt: member.full_name,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${member.full_name} — ${member.board_role}`,
      description: cleanDescription,
      images: [member.image_url || '/og-default.webp'],
    },
  }
}

export default async function BoardMemberDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('board_members')
    .select(MEMBER_DETAIL_SELECT)
    .eq('slug', slug)
    .single()

  /* Güvenlik: Hata detaylarını kullanıcıya gösterme */
  if (error || !member) {
    if (error) console.error('[Board:detail]', error)
    notFound()
  }

  const typedMember = member as unknown as BoardMemberDetail

  /* XSS koruması */
  const safeDescription = typedMember.description ? sanitizeHtml(typedMember.description) : null

  return (
    <section aria-label="Üye profili" className="bg-slate-50 min-h-screen pt-24 pb-16">
      <PersonJsonLd member={typedMember} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Geri Dön */}
        <Link
          href="/board"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Yönetim Kuruluna Dön
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Profil Görseli */}
          <div className="h-[24rem] sm:h-[32rem] w-full relative bg-slate-950 overflow-hidden flex items-center justify-center">
            {typedMember.image_url ? (
              <>
                <div className="absolute inset-0 opacity-40" aria-hidden="true">
                  <Image
                    src={typedMember.image_url}
                    alt=""
                    fill
                    className="object-cover blur-2xl scale-125"
                    sizes="100vw"
                    priority
                  />
                </div>
                <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-slate-100">
                  <Image
                    src={typedMember.image_url}
                    alt={typedMember.full_name}
                    fill
                    className="object-cover"
                    sizes="320px"
                    priority
                  />
                </div>
              </>
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-brand-300"
                aria-hidden="true"
              >
                <User className="h-32 w-32 opacity-20" />
              </div>
            )}

            {/* Aktiflik Rozeti */}
            <div className="absolute top-6 left-6 z-20">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                  typedMember.is_active
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-slate-800/90 text-white border-slate-700'
                }`}
              >
                {typedMember.is_active ? 'Aktif Üye' : 'Geçmiş Dönem'}
              </span>
            </div>
          </div>

          {/* İçerik */}
          <div className="p-8 sm:p-12 sm:pt-10">
            {/* Başlık ve Meta */}
            <div className="mb-10 pb-10 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.15] flex-1">
                  {typedMember.full_name}
                </h1>
                <div className="flex-shrink-0">
                  <ShareButton title={`${typedMember.full_name} - ${typedMember.board_role}`} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Görev */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-full flex items-center justify-center text-brand-600 border border-brand-200/50 shadow-inner">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="text-sm leading-tight">
                      <p className="font-bold text-slate-900 text-base">{typedMember.board_role}</p>
                      <p className="text-brand-500 font-medium tracking-wide text-xs uppercase mt-0.5">
                        Görev
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block h-8 w-px bg-slate-200" aria-hidden="true" />

                  {/* Dönem */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 shadow-inner">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="text-sm leading-tight">
                      <p className="font-bold text-slate-900 text-base">{typedMember.term_year}</p>
                      <p className="text-slate-500 font-medium tracking-wide text-xs uppercase mt-0.5">
                        Dönemi
                      </p>
                    </div>
                  </div>
                </div>

                {/* LinkedIn */}
                {typedMember.linkedin_url && (
                  <a
                    href={typedMember.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <Linkedin className="w-4 h-4 mr-2" /> LinkedIn'de Gör
                  </a>
                )}
              </div>
            </div>

            {/* Açıklama — DOMPurify ile sanitize */}
            <div className="prose prose-slate prose-lg max-w-none font-montserrat prose-headings:font-heading prose-headings:font-bold prose-a:text-brand-600 hover:prose-a:text-brand-700">
              {safeDescription ? (
                <div dangerouslySetInnerHTML={{ __html: safeDescription.replace(/&nbsp;|\u00A0/g, ' ') }} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Info className="h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-slate-500 font-medium">
                    Bu üye için henüz bir açıklama veya not eklenmemiş.
                  </p>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
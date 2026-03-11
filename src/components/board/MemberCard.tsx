import Link from 'next/link'
import Image from 'next/image'
import { Users, Linkedin } from 'lucide-react'
import type { BoardMemberListItem } from '@/types/board-member'

type MemberCardProps = {
  member: BoardMemberListItem
  isPresident?: boolean
}

/**
 * Yönetim kurulu üye kartı.
 * Hem aktif hem geçmiş kurullar için kullanılır.
 */
export default function MemberCard({ member, isPresident = false }: MemberCardProps) {
  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-2 hover:border-brand-200 transition-all duration-300 group relative ${
        isPresident ? 'w-full max-w-sm mx-auto' : 'w-full'
      }`}
    >
      <Link
        href={`/board/${member.slug}`}
        className="absolute inset-0 rounded-3xl z-10"
        aria-label={`${member.full_name} profilini görüntüle`}
      />

      {/* Profil Fotoğrafı */}
      <div
        className={`${
          isPresident ? 'h-40 w-40' : 'h-32 w-32'
        } rounded-full bg-slate-50 mb-6 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center relative`}
      >
        {member.image_url ? (
          <Image
            src={member.image_url}
            alt={member.full_name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes={isPresident ? '160px' : '128px'}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
            <Users className={`${isPresident ? 'h-16 w-16' : 'h-12 w-12'} text-brand-300`} />
          </div>
        )}
      </div>

      <h3
        className={`${
          isPresident ? 'text-2xl' : 'text-xl'
        } font-heading font-bold text-slate-900 group-hover:text-brand-600 transition-colors`}
      >
        {member.full_name}
      </h3>

      <p
        className={`font-semibold tracking-wide uppercase mt-2 ${
          isPresident ? 'text-brand-600 text-sm' : 'text-brand-500 text-xs'
        }`}
      >
        {member.board_role}
      </p>

      {member.linkedin_url && (
        <a
          href={member.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-20 mt-5 text-slate-400 hover:text-[#0A66C2] transition-colors bg-slate-50 p-2.5 rounded-full hover:bg-blue-50"
          aria-label={`${member.full_name} LinkedIn profili`}
        >
          <span className="sr-only">LinkedIn</span>
          <Linkedin className="h-5 w-5" />
        </a>
      )}
    </div>
  )
}

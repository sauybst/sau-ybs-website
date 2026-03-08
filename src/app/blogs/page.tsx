import { createClient } from '@/utils/supabase/server'
import { BookOpen, User } from 'lucide-react'

export const metadata = {
    title: 'Blog ve Duyurular - YBS Topluluğu',
    description: 'Makaleler, teknoloji haberleri ve topluluk duyuruları',
}

export default async function PublicBlogsPage() {
    const supabase = await createClient()

    const { data: blogs, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false })

    if (error) {
        console.error('Blogs fetch error:', error)
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2">İçeriklerimiz</h2>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Blog ve Duyurular</h1>
                    <p className="mt-4 max-w-2xl text-l text-slate-600 mx-auto font-montserrat">
                        Topluluğumuzdan haberdar olun, bilim, teknoloji ve yönetim dünyasından yazılarımızı okuyun.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {(!blogs || blogs.length === 0) ? (
                        <p className="text-slate-500 col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                            Henüz yayınlanmış bir yazı bulunmuyor.
                        </p>
                    ) : (
                        blogs.map((blog) => (
                            <article key={blog.id} className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group block">
                                <div className="h-56 bg-slate-100 w-full relative overflow-hidden">
                                    {blog.cover_image_url ? (
                                        <img src={blog.cover_image_url} alt={blog.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center text-brand-300">
                                            <BookOpen className="h-16 w-16 opacity-40" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md bg-white/90 text-brand-700 border border-white/50">
                                            Makale
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium mb-3">
                                        <time dateTime={blog.published_at}>
                                            {new Date(blog.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </time>
                                    </div>

                                    <h3 className="text-2xl font-heading font-bold text-slate-900 mb-4 tracking-tight leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
                                        <a href={`/blogs/${blog.slug || blog.id}`}>
                                            <span className="absolute inset-0 z-20" />
                                            {blog.title}
                                        </a>
                                    </h3>

                                    <p className="text-slate-600 text-sm flex-1 leading-relaxed line-clamp-3 mb-6">
                                        {blog.content}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center">
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-10 w-10 flex-shrink-0 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="text-sm leading-tight">
                                                <p className="font-bold text-slate-900">
                                                    {/*@ts-ignore*/}
                                                    {blog.profiles?.first_name || 'Topluluk'} {/*@ts-ignore*/}{blog.profiles?.last_name || 'Editörü'}
                                                </p>
                                                <p className="text-slate-500 font-medium tracking-wide text-xs uppercase">Yazar</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

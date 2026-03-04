import { createClient } from '@/utils/supabase/server'
import { BookOpen } from 'lucide-react'

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
        <div className="bg-white min-h-screen py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Blog ve Duyurular</h2>
                    <p className="mt-2 text-lg leading-8 text-gray-600">
                        Topluluğumuzdan haberdar olun, bilişim ve yönetim dünyasından yazılarımızı okuyun.
                    </p>
                </div>

                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {blogs?.map((blog) => (
                        <article key={blog.id} className="flex flex-col items-start justify-between">
                            <div className="relative w-full">
                                {blog.cover_image_url ? (
                                    <img
                                        src={blog.cover_image_url}
                                        alt=""
                                        className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                                    />
                                ) : (
                                    <div className="aspect-[16/9] w-full rounded-2xl bg-indigo-50 sm:aspect-[2/1] lg:aspect-[3/2] flex justify-center items-center">
                                        <BookOpen className="h-12 w-12 text-indigo-200" />
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                            </div>
                            <div className="max-w-xl">
                                <div className="mt-8 flex items-center gap-x-4 text-xs">
                                    <time dateTime={blog.published_at} className="text-gray-500">
                                        {new Date(blog.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </time>
                                    <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">
                                        Makale
                                    </span>
                                </div>
                                <div className="group relative">
                                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600 line-clamp-2">
                                        {/* Gelecekte blog detail sayfasına yönlendirilebilir */}
                                        <span className="absolute inset-0" />
                                        {blog.title}
                                    </h3>
                                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                                        {blog.content}
                                    </p>
                                </div>
                                <div className="relative mt-8 flex items-center gap-x-4">
                                    <div className="text-sm leading-6">
                                        <p className="font-semibold text-gray-900">
                                            <span>
                                                <span className="absolute inset-0" />
                                                {/*@ts-ignore*/}
                                                {blog.profiles?.first_name || 'Topluluk'} {/*@ts-ignore*/}{blog.profiles?.last_name || 'Editörü'}
                                            </span>
                                        </p>
                                        <p className="text-gray-600">Yazar</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                    {!blogs?.length && (
                        <p className="text-gray-500 text-center col-span-3">Henüz yayınlanmış bir yazı bulunmuyor.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

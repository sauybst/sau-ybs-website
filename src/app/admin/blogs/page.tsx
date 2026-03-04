import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, Trash2, BookOpen } from 'lucide-react'
import { deleteBlog } from '@/actions/blogs'

export default async function BlogsPage() {
    const supabase = await createClient()

    const { data: blogs, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false })

    if (error) {
        console.error('Error fetching blogs:', error)
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Blog ve Duyurular
                </h2>
                <Link href="/admin/blogs/create" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Yazı Ekle
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                    {blogs?.map((blog) => (
                        <li key={blog.id}>
                            <div className="px-4 py-4 flex items-center sm:px-6">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="truncate">
                                        <div className="flex text-sm">
                                            <BookOpen className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <p className="font-medium text-indigo-600 truncate">{blog.title}</p>
                                        </div>
                                        <div className="mt-2 flex">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                                                <p>
                                                    Yayın Tarihi: <time dateTime={blog.published_at}>{new Date(blog.published_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</time>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                                    <form action={async () => {
                                        'use server'
                                        await deleteBlog(blog.id)
                                    }}>
                                        <button type="submit" className="text-red-500 hover:text-red-700" title="Sil">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </li>
                    ))}
                    {!blogs?.length && (
                        <li className="px-4 py-8 text-center text-sm text-gray-500">
                            Henüz bir yazı bulunmuyor. Yeni bir yazı veya duyuru ekleyerek başlayabilirsiniz.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

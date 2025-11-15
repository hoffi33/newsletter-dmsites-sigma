'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setNewsletters(data)
    setLoading(false)
  }

  const filteredNewsletters = newsletters
    .filter((n) => {
      // Filter by status
      if (filter !== 'all' && n.status !== filter) return false

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          (n.title && n.title.toLowerCase().includes(query)) ||
          (n.selected_subject_line && n.selected_subject_line.toLowerCase().includes(query)) ||
          (n.content_markdown && n.content_markdown.toLowerCase().includes(query))
        )
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '')
      } else if (sortBy === 'words') {
        return (b.word_count || 0) - (a.word_count || 0)
      }
      return 0
    })

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Newsletters</h1>
          <p className="text-muted-foreground">View and manage your newsletters</p>
        </div>
        <Link
          href="/content-studio"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          + New Newsletter
        </Link>
      </div>

      {newsletters.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📰</div>
          <h2 className="text-2xl font-semibold mb-2">No Newsletters Yet</h2>
          <p className="text-muted-foreground mb-6">Create your first newsletter from the Content Studio</p>
          <Link
            href="/content-studio"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Create Newsletter
          </Link>
        </div>
      ) : (
        <>
          {/* Search and Sort */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search newsletters by title or content..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="words">Sort by Word Count</option>
            </select>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-2">
            {['all', 'draft', 'ready', 'sent'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f} ({newsletters.filter((n) => f === 'all' || n.status === f).length})
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredNewsletters.length} of {newsletters.length} newsletters
          </div>

          {/* Newsletters List */}
          <div className="space-y-4">
            {filteredNewsletters.map((newsletter) => (
              <Link
                key={newsletter.id}
                href={`/content-studio/edit/${newsletter.id}`}
                className="block bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{newsletter.title || 'Untitled Newsletter'}</h3>
                    {newsletter.selected_subject_line && (
                      <p className="text-sm text-muted-foreground">{newsletter.selected_subject_line}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full capitalize ${
                      newsletter.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : newsletter.status === 'ready'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {newsletter.status}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">{newsletter.word_count || 0}</span> words
                  </div>
                  <div>
                    <span className="font-medium">{newsletter.reading_time_minutes || 0}</span> min read
                  </div>
                  <div className="capitalize">{newsletter.tone}</div>
                  <div className="capitalize">{newsletter.length}</div>
                  <div className="ml-auto">
                    {new Date(newsletter.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

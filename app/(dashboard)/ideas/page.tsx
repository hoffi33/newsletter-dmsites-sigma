'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('content_ideas')
      .select('*')
      .order('priority_score', { ascending: false })

    if (data) setIdeas(data)
    setLoading(false)
  }

  const filteredIdeas = ideas.filter((idea) => {
    if (filter === 'all') return true
    if (filter === 'suggested') return idea.status === 'suggested'
    if (filter === 'scheduled') return idea.status === 'scheduled'
    if (filter === 'used') return idea.status === 'used'
    return true
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
          <h1 className="text-3xl font-bold mb-2">Content Ideas</h1>
          <p className="text-muted-foreground">Your AI-generated newsletter ideas</p>
        </div>
        <Link
          href="/ideas/generate"
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all"
        >
          💡 Generate 52 Ideas
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">💡</div>
          <h2 className="text-2xl font-semibold mb-2">No Ideas Yet</h2>
          <p className="text-muted-foreground mb-6">Generate 52 weeks of content ideas instantly</p>
          <Link
            href="/ideas/generate"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6 flex gap-2">
            {['all', 'suggested', 'scheduled', 'used'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f} ({ideas.filter((i) => f === 'all' || i.status === f).length})
              </button>
            ))}
          </div>

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      idea.urgency === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : idea.urgency === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}
                  >
                    {idea.urgency} urgency
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{idea.category}</span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{idea.suggested_headline}</h3>
                <p className="text-sm text-muted-foreground mb-4">{idea.angle}</p>

                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-1">Outline:</div>
                  <p className="text-sm line-clamp-2">{idea.outline}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Priority:</span>
                    <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${idea.priority_score * 100}%` }}
                      />
                    </div>
                  </div>
                  <button className="text-blue-600 hover:underline text-sm">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

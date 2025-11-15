'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompetitors()
  }, [])

  const fetchCompetitors = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('competitors').select('*')

    if (data) setCompetitors(data)
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Competitor Intelligence</h1>
          <p className="text-muted-foreground">Monitor competition and find content gaps</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/competitors/analysis"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all"
          >
            🔍 Analysis
          </Link>
          <Link
            href="/competitors/gaps"
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold transition-all"
          >
            💡 Content Gaps
          </Link>
          <Link
            href="/competitors/add"
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-semibold transition-all"
          >
            ➕ Add Competitor
          </Link>
        </div>
      </div>

      {competitors.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">No Competitors Yet</h2>
          <p className="text-muted-foreground mb-6">
            Add competitors to monitor their newsletters and find content opportunities
          </p>
          <Link
            href="/competitors/add"
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Add First Competitor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitors.map((competitor) => (
            <div
              key={competitor.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-lg font-semibold mb-2">{competitor.name}</h3>
              <div className="text-sm text-muted-foreground mb-4">{competitor.email}</div>
              {competitor.website && (
                <a
                  href={competitor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Visit website →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

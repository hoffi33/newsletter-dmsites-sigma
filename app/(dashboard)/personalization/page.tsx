'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PersonalizationPage() {
  const [segments, setSegments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('audience_segments').select('*')

    if (data) setSegments(data)
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Personalization</h1>
          <p className="text-muted-foreground">Create variants for different audience segments</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/personalization/generate"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all"
          >
            ✨ Generate Variants
          </Link>
          <Link
            href="/personalization/segments"
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-semibold transition-all"
          >
            🎯 Manage Segments
          </Link>
        </div>
      </div>

      {segments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-semibold mb-2">No Segments Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create audience segments to generate personalized newsletter variants
          </p>
          <Link
            href="/personalization/segments"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Create First Segment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-lg font-semibold mb-2">{segment.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{segment.description}</p>
              {segment.size_estimate && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Est. size:</span>{' '}
                  <span className="font-semibold">{segment.size_estimate}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

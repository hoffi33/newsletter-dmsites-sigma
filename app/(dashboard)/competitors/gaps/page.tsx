'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ContentGapsPage() {
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [gaps, setGaps] = useState<any[]>([])

  useEffect(() => {
    fetchGaps()
  }, [])

  const fetchGaps = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('content_gaps')
      .select('*')
      .order('priority_score', { ascending: false })

    if (data) setGaps(data)
    setLoading(false)
  }

  const handleFindGaps = async () => {
    setAnalyzing(true)

    try {
      const res = await fetch('/api/competitors/gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        setGaps(data.gaps)
        toast.success(`Found ${data.gaps.length} content opportunities!`)
      } else {
        const error = await res.json()
        toast.error(`Error: ${error.error}`)
      }
    } catch (err) {
      toast.error('Failed to find content gaps')
    }

    setAnalyzing(false)
  }

  const handleMarkAsUsed = async (gapId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('content_gaps')
      .update({ status: 'used' })
      .eq('id', gapId)

    if (!error) {
      setGaps(gaps.map((g) => (g.id === gapId ? { ...g, status: 'used' } : g)))
      toast.success('Marked as used')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Gap Analysis</h1>
          <p className="text-muted-foreground">
            Find untapped opportunities by analyzing competitor content and trends
          </p>
        </div>
        <button
          onClick={handleFindGaps}
          disabled={analyzing}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold transition-all"
        >
          {analyzing ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Finding Gaps...
            </span>
          ) : (
            '🔍 Find Content Gaps'
          )}
        </button>
      </div>

      {/* Gap Summary */}
      {gaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-4xl font-bold mb-2">
              {gaps.filter((g) => g.opportunity_type === 'uncovered_high_value').length}
            </div>
            <div className="text-blue-100">Uncovered High-Value Topics</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-4xl font-bold mb-2">
              {gaps.filter((g) => g.opportunity_type === 'trending_opportunity').length}
            </div>
            <div className="text-purple-100">Trending Opportunities</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-4xl font-bold mb-2">
              {gaps.filter((g) => g.opportunity_type === 'competitor_response').length}
            </div>
            <div className="text-orange-100">Competitor Response Needed</div>
          </div>
        </div>
      )}

      {/* Content Gaps */}
      {gaps.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Opportunities ({gaps.length})</h2>
            <div className="text-sm text-muted-foreground">
              Sorted by priority (highest first)
            </div>
          </div>

          {gaps.map((gap) => (
            <div
              key={gap.id}
              className={`bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 ${
                gap.opportunity_type === 'uncovered_high_value'
                  ? 'border-blue-500'
                  : gap.opportunity_type === 'trending_opportunity'
                    ? 'border-purple-500'
                    : 'border-orange-500'
              } ${gap.status === 'used' ? 'opacity-50' : ''}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{gap.topic}</h3>
                    {gap.status === 'used' && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        ✓ Used
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        gap.opportunity_type === 'uncovered_high_value'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : gap.opportunity_type === 'trending_opportunity'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      }`}
                    >
                      {gap.opportunity_type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        gap.urgency === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : gap.urgency === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {gap.urgency} urgency
                    </span>
                  </div>
                </div>
                <div className="ml-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Priority</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {(gap.priority_score * 100).toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-700 dark:text-slate-300 mb-4">{gap.description}</p>

              {/* Rationale */}
              {gap.rationale && (
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Supporting Data:
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {gap.rationale.competitor_coverage !== undefined && (
                      <div>
                        <div className="text-xs text-muted-foreground">Competitor Coverage</div>
                        <div className="text-xl font-semibold">
                          {gap.rationale.competitor_coverage}
                        </div>
                      </div>
                    )}
                    {gap.rationale.user_coverage !== undefined && (
                      <div>
                        <div className="text-xs text-muted-foreground">Your Coverage</div>
                        <div className="text-xl font-semibold">{gap.rationale.user_coverage}</div>
                      </div>
                    )}
                    {gap.rationale.trending !== undefined && (
                      <div>
                        <div className="text-xs text-muted-foreground">Trending</div>
                        <div className="text-xl font-semibold">
                          {gap.rationale.trending ? '✓' : '✗'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Suggested Angle */}
              {gap.suggested_angle && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    💡 Suggested Angle:
                  </div>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    {gap.suggested_angle}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleMarkAsUsed(gap.id)}
                  disabled={gap.status === 'used'}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                >
                  {gap.status === 'used' ? 'Marked as Used' : 'Mark as Used'}
                </button>
                <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md font-medium transition-colors">
                  Create Newsletter
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">Find Content Opportunities</h2>
          <p className="text-muted-foreground mb-6">
            Click &ldquo;Find Content Gaps&rdquo; to analyze competitor content and trending topics to discover
            untapped opportunities
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function CompetitorAnalysisPage() {
  const [competitors, setCompetitors] = useState<any[]>([])
  const [selectedCompetitor, setSelectedCompetitor] = useState('')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    fetchCompetitors()
  }, [])

  const fetchCompetitors = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('competitors').select('*')

    if (data) setCompetitors(data)
    setLoading(false)
  }

  const handleAnalyze = async () => {
    if (!selectedCompetitor) {
      toast.error('Please select a competitor')
      return
    }

    setAnalyzing(true)
    setAnalysis(null)

    try {
      const res = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorId: selectedCompetitor }),
      })

      if (res.ok) {
        const data = await res.json()
        setAnalysis(data)
        toast.success('Competitor analysis complete!')
      } else {
        const error = await res.json()
        toast.error(`Error: ${error.error}`)
      }
    } catch (err) {
      toast.error('Failed to analyze competitor')
    }

    setAnalyzing(false)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Competitor Analysis</h1>
        <p className="text-muted-foreground">
          AI-powered analysis of competitor newsletters and strategies
        </p>
      </div>

      {/* Competitor Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Competitor to Analyze</h2>
        <select
          value={selectedCompetitor}
          onChange={(e) => setSelectedCompetitor(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 mb-4"
        >
          <option value="">Choose a competitor...</option>
          {competitors.map((competitor) => (
            <option key={competitor.id} value={competitor.id}>
              {competitor.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !selectedCompetitor}
          className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold transition-all text-lg"
        >
          {analyzing ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Analyzing Newsletters...
            </span>
          ) : (
            '🔍 Analyze Competitor'
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Aggregate Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Newsletters Analyzed</div>
                <div className="text-3xl font-bold">
                  {analysis.aggregate.total_newsletters_analyzed}
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Avg Quality Score</div>
                <div className="text-3xl font-bold">{analysis.aggregate.average_quality_score}/10</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Publishing Frequency</div>
                <div className="text-lg font-bold">{analysis.aggregate.frequency}</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Common Topics</div>
                <div className="text-sm font-semibold">
                  {analysis.aggregate.common_topics.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Newsletter Analyses */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Newsletter Breakdown</h2>
            {analysis.analyses.map((item: any, index: number) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-red-500"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{item.subject_line}</h3>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.sent_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Quality</div>
                    <div className="text-3xl font-bold text-red-600">
                      {item.analysis.overall_quality_score}/10
                    </div>
                  </div>
                </div>

                {/* Main Topics */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Topics:</div>
                  <div className="flex flex-wrap gap-2">
                    {item.analysis.main_topics.map((topic: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Angle & Structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Angle:</div>
                    <div className="text-sm">{item.analysis.angle}</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Tone:</div>
                    <div className="text-sm capitalize">{item.analysis.tone}</div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      ✅ Strengths:
                    </div>
                    <ul className="space-y-1">
                      {item.analysis.strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                      ⚠️ Weaknesses:
                    </div>
                    <ul className="space-y-1">
                      {item.analysis.weaknesses.map((weakness: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300">
                          • {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Response Strategy */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    💡 Our Response Strategy:
                  </div>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    {item.analysis.response_strategy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !analyzing && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">Analyze Competitor Strategy</h2>
          <p className="text-muted-foreground">
            Select a competitor above to get AI-powered insights into their newsletter strategy
          </p>
        </div>
      )}
    </div>
  )
}

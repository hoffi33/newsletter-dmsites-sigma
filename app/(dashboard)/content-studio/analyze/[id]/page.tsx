'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyzePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Auto-analyze when page loads
    analyzeContent()
  }, [id])

  const analyzeContent = async () => {
    setAnalyzing(true)
    setError(null)

    try {
      const res = await fetch('/api/content/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentSourceId: id }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Analysis failed')

      setAnalysis(data.analysis)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
      setLoading(false)
    }
  }

  const handleGenerateNewsletter = () => {
    if (analysis) {
      router.push(`/content-studio/generate/${id}?analysisId=${analysis.id}`)
    }
  }

  if (loading || analyzing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Analyzing Content...</h2>
          <p className="text-muted-foreground">
            AI is analyzing your content. This may take 30-60 seconds.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
          <button
            onClick={() => router.push('/content-studio')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Content Studio
          </button>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const analysisData = analysis.full_analysis

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Analysis</h1>
        <p className="text-muted-foreground">AI has analyzed your content</p>
      </div>

      <div className="space-y-6">
        {/* Main Topic */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">📌 Main Topic</h2>
          <p className="text-xl">{analysisData.main_topic}</p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className="text-sm text-muted-foreground mb-1">Target Audience</div>
            <div className="font-semibold">{analysisData.target_audience}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className="text-sm text-muted-foreground mb-1">Level</div>
            <div className="font-semibold capitalize">{analysisData.audience_level}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className="text-sm text-muted-foreground mb-1">Sentiment</div>
            <div className="font-semibold capitalize">{analysisData.sentiment}</div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">💡 Key Takeaways</h2>
          <ul className="space-y-2">
            {analysisData.key_takeaways?.map((takeaway: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sub Topics */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">📚 Sub Topics</h2>
          <div className="flex flex-wrap gap-2">
            {analysisData.sub_topics?.map((topic: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Quotes */}
        {analysisData.quotes && analysisData.quotes.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">💬 Notable Quotes</h2>
            <div className="space-y-3">
              {analysisData.quotes.map((quote: string, i: number) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4 italic">
                  &ldquo;{quote}&rdquo;
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pain Points */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">🎯 Pain Points Addressed</h2>
          <ul className="space-y-2">
            {analysisData.pain_points?.map((point: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">📣 Suggested CTAs</h2>
          <div className="space-y-2">
            {analysisData.suggested_ctas?.map((cta: string, i: number) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                {cta}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Ready to Generate Your Newsletter?</h2>
          <p className="mb-4 opacity-90">
            Based on this analysis, AI will create a compelling newsletter
          </p>
          <button
            onClick={handleGenerateNewsletter}
            className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 transition-colors"
          >
            Generate Newsletter →
          </button>
        </div>
      </div>
    </div>
  )
}

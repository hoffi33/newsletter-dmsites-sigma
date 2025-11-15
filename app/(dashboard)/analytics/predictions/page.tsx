'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function PredictionsPage() {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [selectedNewsletter, setSelectedNewsletter] = useState('')
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [prediction, setPrediction] = useState<any>(null)

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setNewsletters(data)
    setLoading(false)
  }

  const handlePredict = async () => {
    if (!selectedNewsletter) {
      toast.error('Please select a newsletter')
      return
    }

    setPredicting(true)
    setPrediction(null)

    try {
      const res = await fetch('/api/analytics/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: selectedNewsletter }),
      })

      if (res.ok) {
        const data = await res.json()
        setPrediction(data.prediction)
        toast.success('Performance prediction generated!')
      } else {
        const error = await res.json()
        toast.error(`Error: ${error.error}`)
      }
    } catch (err) {
      toast.error('Failed to generate prediction')
    }

    setPredicting(false)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Performance Predictions</h1>
        <p className="text-muted-foreground">
          Predict how your newsletter will perform before sending it
        </p>
      </div>

      {/* Newsletter Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Newsletter to Analyze</h2>
        <select
          value={selectedNewsletter}
          onChange={(e) => setSelectedNewsletter(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 mb-4"
        >
          <option value="">Choose a newsletter...</option>
          {newsletters.map((newsletter) => (
            <option key={newsletter.id} value={newsletter.id}>
              {newsletter.title || `Newsletter ${newsletter.id.slice(0, 8)}`}
            </option>
          ))}
        </select>

        <button
          onClick={handlePredict}
          disabled={predicting || !selectedNewsletter}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold transition-all text-lg"
        >
          {predicting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Analyzing & Predicting...
            </span>
          ) : (
            '🔮 Predict Performance'
          )}
        </button>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Open Rate Prediction */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Predicted Open Rate</h3>
                <span className="text-3xl">📧</span>
              </div>
              <div className="text-5xl font-bold mb-2">
                {prediction.predicted_open_rate.toFixed(1)}%
              </div>
              <div className="text-blue-100">
                Range: {prediction.confidence_interval.open_rate.min.toFixed(1)}% -{' '}
                {prediction.confidence_interval.open_rate.max.toFixed(1)}%
              </div>
            </div>

            {/* Click Rate Prediction */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Predicted Click Rate</h3>
                <span className="text-3xl">👆</span>
              </div>
              <div className="text-5xl font-bold mb-2">
                {prediction.predicted_click_rate.toFixed(1)}%
              </div>
              <div className="text-purple-100">
                Range: {prediction.confidence_interval.click_rate.min.toFixed(1)}% -{' '}
                {prediction.confidence_interval.click_rate.max.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Prediction Confidence</h3>
              <div className="text-3xl font-bold text-blue-600">
                {(prediction.confidence_score * 100).toFixed(0)}%
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all"
                style={{ width: `${prediction.confidence_score * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Risk Factors */}
          {prediction.risk_factors && prediction.risk_factors.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                Risk Factors
              </h3>
              <div className="space-y-3">
                {prediction.risk_factors.map((risk: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                  >
                    <p className="text-red-800 dark:text-red-200">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {prediction.opportunities && prediction.opportunities.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">✨</span>
                Opportunities
              </h3>
              <div className="space-y-3">
                {prediction.opportunities.map((opportunity: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
                  >
                    <p className="text-green-800 dark:text-green-200">{opportunity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Recommendations
              </h3>
              <div className="space-y-3">
                {prediction.recommendations.map((rec: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex items-start"
                  >
                    <div className="text-blue-600 dark:text-blue-400 mr-3 mt-1">✓</div>
                    <p className="text-blue-800 dark:text-blue-200 flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              Predictions are based on analysis of your historical performance data, subject line
              quality, content characteristics, and industry benchmarks. Results may vary based on
              audience engagement patterns and external factors.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!prediction && !predicting && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h2 className="text-2xl font-semibold mb-2">Predict Your Newsletter Performance</h2>
          <p className="text-muted-foreground">
            Select a newsletter above to see AI-powered predictions on how it will perform
          </p>
        </div>
      )}
    </div>
  )
}

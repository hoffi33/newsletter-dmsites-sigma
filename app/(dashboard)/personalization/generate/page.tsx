'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function GenerateVariantsPage() {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [segments, setSegments] = useState<any[]>([])
  const [selectedNewsletter, setSelectedNewsletter] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [variants, setVariants] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: newsletterData } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: segmentData } = await supabase.from('audience_segments').select('*')

    if (newsletterData) setNewsletters(newsletterData)
    if (segmentData) setSegments(segmentData)
    setLoading(false)
  }

  const handleGenerateVariants = async () => {
    if (!selectedNewsletter) {
      toast.error('Please select a newsletter')
      return
    }

    if (segments.length === 0) {
      toast.error('Please create segments first')
      return
    }

    setGenerating(true)
    setVariants([])

    try {
      const res = await fetch('/api/personalization/generate-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterId: selectedNewsletter,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setVariants(data.variants)
        toast.success(`Generated ${data.variants.length} personalized variants!`)
      } else {
        const error = await res.json()
        toast.error(`Error: ${error.error}`)
      }
    } catch (err) {
      toast.error('Failed to generate variants')
    }

    setGenerating(false)
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
        <h1 className="text-3xl font-bold mb-2">Generate Personalized Variants</h1>
        <p className="text-muted-foreground">
          Create customized versions of your newsletter for different audience segments
        </p>
      </div>

      {/* Newsletter Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Newsletter</h2>
        <select
          value={selectedNewsletter}
          onChange={(e) => setSelectedNewsletter(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
        >
          <option value="">Choose a newsletter...</option>
          {newsletters.map((newsletter) => (
            <option key={newsletter.id} value={newsletter.id}>
              {newsletter.title || `Newsletter ${newsletter.id.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Segments Info */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Target Segments ({segments.length})</h2>
        {segments.length === 0 ? (
          <p className="text-muted-foreground">
            No segments created yet. Create segments first to generate variants.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <div className="font-semibold">{segment.name}</div>
                <div className="text-sm text-muted-foreground">{segment.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateVariants}
        disabled={generating || !selectedNewsletter || segments.length === 0}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold transition-all text-lg mb-6"
      >
        {generating ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Generating Variants...
          </span>
        ) : (
          '✨ Generate Personalized Variants'
        )}
      </button>

      {/* Results */}
      {variants.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Generated Variants</h2>
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-purple-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{variant.segment_name}</h3>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  Personalized
                </span>
              </div>

              {/* Subject Line */}
              <div className="mb-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">Subject Line:</div>
                <div className="text-lg font-semibold">{variant.subject_line}</div>
              </div>

              {/* Changes */}
              {variant.changes && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Personalization Changes:
                  </div>
                  <div className="text-sm bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
                    {variant.changes}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              <div className="mb-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Content Preview:
                </div>
                <div
                  className="text-sm bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md max-h-64 overflow-y-auto prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: variant.content.substring(0, 500) + '...',
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
                  View Full Content
                </button>
                <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md font-medium transition-colors">
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

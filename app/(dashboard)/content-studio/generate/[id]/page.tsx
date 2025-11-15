'use client'

import { use, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const analysisId = searchParams.get('analysisId')
  const router = useRouter()

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [options, setOptions] = useState({
    tone: 'professional',
    length: 'medium',
    structure: 'problem-solution',
  })

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentSourceId: id,
          analysisId,
          options,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Generation failed')

      // Redirect to editor
      router.push(`/content-studio/edit/${data.newsletter.id}`)
    } catch (err: any) {
      setError(err.message)
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Generating Newsletter...</h2>
          <p className="text-muted-foreground">
            AI is crafting your newsletter. This may take 60-90 seconds.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Newsletter</h1>
        <p className="text-muted-foreground">Customize how your newsletter will be generated</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-8">
        {/* Tone */}
        <div>
          <h2 className="text-lg font-semibold mb-4">✍️ Tone</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['professional', 'casual', 'friendly', 'enthusiastic'].map((tone) => (
              <button
                key={tone}
                onClick={() => setOptions({ ...options, tone })}
                className={`p-4 border-2 rounded-lg capitalize transition-colors ${
                  options.tone === tone
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-300'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div>
          <h2 className="text-lg font-semibold mb-4">📏 Length</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'short', label: 'Short', desc: '300-500 words' },
              { value: 'medium', label: 'Medium', desc: '500-800 words' },
              { value: 'long', label: 'Long', desc: '800-1200 words' },
            ].map((length) => (
              <button
                key={length.value}
                onClick={() => setOptions({ ...options, length: length.value })}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  options.length === length.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold">{length.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{length.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Structure */}
        <div>
          <h2 className="text-lg font-semibold mb-4">🏗️ Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                value: 'problem-solution',
                label: 'Problem → Solution',
                desc: 'Present problem, then solution',
              },
              { value: 'story', label: 'Story-driven', desc: 'Narrative format with story arc' },
              { value: 'listicle', label: 'Listicle', desc: 'Numbered list of key points' },
              { value: 'tutorial', label: 'How-to Guide', desc: 'Step-by-step tutorial' },
            ].map((structure) => (
              <button
                key={structure.value}
                onClick={() => setOptions({ ...options, structure: structure.value })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  options.structure === structure.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold">{structure.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{structure.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Newsletter'}
          </button>
        </div>
      </div>
    </div>
  )
}

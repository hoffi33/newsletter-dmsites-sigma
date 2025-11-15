'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContentStudioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Form states
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [blogUrl, setBlogUrl] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textTitle, setTextTitle] = useState('')

  const handleImport = async () => {
    setLoading(true)
    setError(null)

    try {
      let requestBody: any = { type: selectedType }

      if (selectedType === 'youtube') {
        if (!youtubeUrl) throw new Error('Please enter a YouTube URL')
        requestBody.url = youtubeUrl
      } else if (selectedType === 'blog') {
        if (!blogUrl) throw new Error('Please enter a blog URL')
        requestBody.url = blogUrl
      } else if (selectedType === 'text') {
        if (!textContent) throw new Error('Please paste your content')
        requestBody.text = textContent
        requestBody.title = textTitle || 'Text Content'
      } else if (selectedType === 'podcast') {
        if (!textContent) throw new Error('Please paste the podcast transcript')
        requestBody.text = textContent
        requestBody.title = textTitle || 'Podcast Transcript'
      }

      const res = await fetch('/api/content/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Import failed')

      // Redirect to analyze page
      router.push(`/content-studio/analyze/${data.contentSource.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const contentTypes = [
    {
      id: 'youtube',
      name: 'YouTube Video',
      icon: '🎥',
      description: 'Import from YouTube URL',
      color: 'from-red-500 to-red-600',
    },
    {
      id: 'podcast',
      name: 'Podcast',
      icon: '🎙️',
      description: 'Paste podcast transcript',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'blog',
      name: 'Blog Post',
      icon: '📰',
      description: 'Import from blog URL',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'text',
      name: 'Text/Notes',
      icon: '📝',
      description: 'Paste your own content',
      color: 'from-green-500 to-green-600',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Studio</h1>
        <p className="text-muted-foreground">
          Import content and transform it into engaging newsletters
        </p>
      </div>

      {!selectedType ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className="group bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all text-left"
            >
              <div className={`h-2 bg-gradient-to-r ${type.color}`} />
              <div className="p-8">
                <div className="text-5xl mb-4">{type.icon}</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {type.name}
                </h3>
                <p className="text-muted-foreground">{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <button
            onClick={() => {
              setSelectedType(null)
              setError(null)
            }}
            className="text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            ← Back to content types
          </button>

          <h2 className="text-2xl font-semibold mb-6">
            Import {contentTypes.find((t) => t.id === selectedType)?.name}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {selectedType === 'youtube' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>
            </div>
          )}

          {selectedType === 'blog' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Blog Post URL</label>
                <input
                  type="url"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                  placeholder="https://example.com/blog-post"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>
            </div>
          )}

          {(selectedType === 'text' || selectedType === 'podcast') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Enter a title..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {selectedType === 'podcast' ? 'Podcast Transcript' : 'Content'}
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your content here..."
                  rows={12}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            {loading ? 'Importing...' : 'Import & Analyze'}
          </button>
        </div>
      )}
    </div>
  )
}

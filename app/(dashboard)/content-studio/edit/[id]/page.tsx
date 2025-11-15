'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TiptapEditor } from '@/components/content-studio/TiptapEditor'
import { toast } from 'sonner'

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [newsletter, setNewsletter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [subjectLines, setSubjectLines] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [generatingSubjects, setGeneratingSubjects] = useState(false)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showTestEmailForm, setShowTestEmailForm] = useState(false)

  useEffect(() => {
    fetchNewsletter()
  }, [id])

  const fetchNewsletter = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from('newsletters').select('*').eq('id', id).single()

    if (data) {
      setNewsletter(data)
      setContent(data.content_html || data.content_markdown || '')
      setTitle(data.title || '')
      setSubjectLines(data.subject_lines || [])
      setSelectedSubject(data.selected_subject_line || '')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('newsletters')
      .update({
        title,
        content_html: content,
        content_markdown: content, // Store HTML in both for now
        selected_subject_line: selectedSubject,
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      toast.error('Failed to save newsletter')
    } else {
      toast.success('Newsletter saved successfully!')
    }
  }

  const handleGenerateSubjects = async () => {
    setGeneratingSubjects(true)
    try {
      const res = await fetch('/api/newsletter/subject-lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: id }),
      })
      const data = await res.json()
      setSubjectLines(data.subjectLines)
      toast.success('Subject lines generated!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate subject lines')
    }
    setGeneratingSubjects(false)
  }

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address')
      return
    }

    setSendingTestEmail(true)
    try {
      const res = await fetch('/api/newsletter/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterId: id,
          recipientEmail: testEmail,
        }),
      })

      if (res.ok) {
        toast.success(`Test email sent to ${testEmail}!`)
        setShowTestEmailForm(false)
        setTestEmail('')
      } else {
        const error = await res.json()
        toast.error(`Error: ${error.error}`)
      }
    } catch (err) {
      toast.error('Failed to send test email')
    }
    setSendingTestEmail(false)
  }

  const handleExport = (format: 'markdown' | 'html') => {
    const blob =
      format === 'markdown'
        ? new Blob([content], { type: 'text/markdown' })
        : new Blob([content], { type: 'text/html' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-${id}.${format === 'markdown' ? 'md' : 'html'}`
    a.click()
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Newsletter</h1>
          <p className="text-muted-foreground">Fine-tune your newsletter before sending</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTestEmailForm(!showTestEmailForm)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md font-medium transition-colors"
          >
            📧 Test Email
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <div className="relative group">
            <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md font-medium transition-colors">
              Export ▾
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 hidden group-hover:block z-10">
              <button
                onClick={() => handleExport('markdown')}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Download Markdown
              </button>
              <button
                onClick={() => handleExport('html')}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Download HTML
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Email Form */}
      {showTestEmailForm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Send Test Email</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
            <button
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
            >
              {sendingTestEmail ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <label className="block text-sm font-medium mb-2">Newsletter Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 text-lg font-semibold"
            />
          </div>

          {/* Rich Text Editor (Tiptap) */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <label className="block text-sm font-medium mb-2">Content</label>
            <TiptapEditor content={content} onChange={setContent} />
            <div className="mt-2 text-xs text-muted-foreground">
              {content.replace(/<[^>]*>/g, '').split(/\s+/).length} words
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subject Lines */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Subject Lines</h3>
              <button
                onClick={handleGenerateSubjects}
                disabled={generatingSubjects}
                className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
              >
                {generatingSubjects ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {subjectLines.length > 0 ? (
              <div className="space-y-2">
                {subjectLines.map((subject: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSubject(subject.text)}
                    className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                      selectedSubject === subject.text
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{subject.text}</div>
                    <div className="text-xs text-muted-foreground mt-1">{subject.style}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click &ldquo;Generate&rdquo; to create AI-powered subject lines
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Word Count</div>
                <div className="text-lg font-semibold">
                  {content.replace(/<[^>]*>/g, '').split(/\s+/).length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Reading Time</div>
                <div className="text-lg font-semibold">
                  {Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)} min
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tone</div>
                <div className="text-lg font-semibold capitalize">{newsletter?.tone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

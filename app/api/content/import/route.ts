import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getYouTubeTranscript } from '@/lib/content/youtube'
import { scrapeWebContent } from '@/lib/content/scraper'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, url, text, title } = body

    let transcript = ''
    let contentTitle = title || ''
    let metadata: any = {}
    let wordCount = 0
    let durationMinutes = 0

    switch (type) {
      case 'youtube':
        const ytData = await getYouTubeTranscript(url)
        transcript = ytData.transcript
        durationMinutes = Math.ceil(ytData.duration / 60000)
        contentTitle = `YouTube: ${url}`
        break

      case 'blog':
        const blogData = await scrapeWebContent(url)
        transcript = blogData.content
        contentTitle = blogData.title || url
        break

      case 'text':
        transcript = text
        contentTitle = title || 'Text Content'
        break

      case 'podcast':
        // For MVP, user pastes transcript
        transcript = text
        contentTitle = title || 'Podcast Transcript'
        break

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    wordCount = transcript.split(/\s+/).length

    // Save to database
    const { data: contentSource, error } = await supabase
      .from('content_sources')
      .insert({
        user_id: user.id,
        type,
        url,
        title: contentTitle,
        transcript,
        metadata,
        word_count: wordCount,
        duration_minutes: durationMinutes,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contentSource })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

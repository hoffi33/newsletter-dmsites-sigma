import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateNewsletter } from '@/lib/ai/claude'
import { markdownToHtml, countWords, estimateReadingTime } from '@/lib/utils/markdown'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentSourceId, analysisId, options } = await request.json()

    // Fetch content and analysis
    const { data: contentSource } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', contentSourceId)
      .single()

    const { data: analysis } = await supabase
      .from('content_analyses')
      .select('*')
      .eq('id', analysisId)
      .single()

    if (!contentSource || !analysis) {
      return NextResponse.json({ error: 'Content or analysis not found' }, { status: 404 })
    }

    // Generate newsletter with Claude
    const newsletter = await generateNewsletter(
      analysis.full_analysis,
      contentSource.transcript,
      options
    )

    // Convert markdown to HTML
    const htmlContent = markdownToHtml(newsletter.content_markdown)
    const wordCount = countWords(newsletter.content_markdown)
    const readingTime = estimateReadingTime(wordCount)

    // Save newsletter
    const { data: savedNewsletter, error: saveError } = await supabase
      .from('newsletters')
      .insert({
        user_id: user.id,
        content_source_id: contentSourceId,
        analysis_id: analysisId,
        title: newsletter.title,
        content_markdown: newsletter.content_markdown,
        content_html: htmlContent,
        tone: options.tone,
        length: options.length,
        structure: options.structure,
        word_count: wordCount,
        reading_time_minutes: readingTime,
        status: 'draft',
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save newsletter error:', saveError)
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    return NextResponse.json({ newsletter: savedNewsletter })
  } catch (error: any) {
    console.error('Newsletter generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

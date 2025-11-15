import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeContent } from '@/lib/ai/claude'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentSourceId } = await request.json()

    // Fetch content source
    const { data: contentSource, error: fetchError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', contentSourceId)
      .single()

    if (fetchError || !contentSource) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Analyze with Claude
    const analysis = await analyzeContent(contentSource.transcript, contentSource.type)

    // Save analysis
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('content_analyses')
      .insert({
        content_source_id: contentSourceId,
        main_topic: analysis.main_topic,
        sub_topics: analysis.sub_topics,
        key_takeaways: analysis.key_takeaways,
        quotes: analysis.quotes,
        examples: analysis.examples,
        target_audience: analysis.target_audience,
        audience_level: analysis.audience_level,
        pain_points: analysis.pain_points,
        suggested_ctas: analysis.suggested_ctas,
        sentiment: analysis.sentiment,
        difficulty: analysis.difficulty,
        full_analysis: analysis,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save analysis error:', saveError)
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    return NextResponse.json({ analysis: savedAnalysis })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/ai/claude'

async function generateInsights(analytics: any[], newsletters: any[]) {
  const systemPrompt = `You are an expert email marketing analyst who provides actionable insights based on newsletter performance data.`

  const analyticsData = analytics.map((a) => ({
    newsletter_title: a.metadata?.title || 'Untitled',
    sent_count: a.sent_count,
    open_rate: a.open_rate,
    click_rate: a.click_rate,
    sent_date: a.sent_at,
  }))

  const prompt = `Analyze this newsletter performance data and provide actionable insights:

DATA:
${JSON.stringify(analyticsData, null, 2)}

Generate 5-8 insights covering:
1. TOPIC PERFORMANCE: Which topics/themes get best engagement
2. TIMING OPTIMIZATION: Best days/times to send
3. SUBJECT LINE PATTERNS: What works in subject lines
4. CONTENT LENGTH: Optimal newsletter length
5. ENGAGEMENT TRENDS: Overall trends over time
6. ACTIONABLE RECOMMENDATIONS: Specific next steps

For each insight, provide:
- insight_type: category (topic_performance, timing, subject_line, etc)
- insight_text: Clear, actionable insight (1-2 sentences)
- data_points: Supporting evidence from the data
- confidence_score: 0.0-1.0 (how confident you are)
- recommendation: Specific action to take

Return a JSON array of insights:
[
  {
    "insight_type": "topic_performance",
    "insight_text": "Your AI-related newsletters get 2.3x higher open rates",
    "data_points": ["AI newsletter: 45% open rate", "Marketing newsletter: 19% open rate"],
    "confidence_score": 0.9,
    "recommendation": "Focus more on AI topics in upcoming newsletters"
  }
]

Return ONLY valid JSON array.`

  const response = await generateCompletion(prompt, systemPrompt, 4000)

  try {
    return JSON.parse(response)
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse insights response')
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all user's analytics
    const { data: analytics } = await supabase
      .from('newsletter_analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })

    if (!analytics || analytics.length === 0) {
      return NextResponse.json({ error: 'No analytics data found' }, { status: 404 })
    }

    // Fetch newsletters for context
    const { data: newsletters } = await supabase
      .from('newsletters')
      .select('id, title, tone, length, structure')
      .eq('user_id', user.id)

    // Generate insights with AI
    const insights = await generateInsights(analytics, newsletters || [])

    // Save insights to database
    const insightsToSave = insights.map((insight: any) => ({
      user_id: user.id,
      insight_type: insight.insight_type,
      insight_text: insight.insight_text,
      data_points: insight.data_points,
      confidence_score: insight.confidence_score,
      actionable: true,
    }))

    // Delete old insights
    await supabase.from('performance_insights').delete().eq('user_id', user.id)

    // Insert new insights
    const { data: savedInsights } = await supabase
      .from('performance_insights')
      .insert(insightsToSave)
      .select()

    return NextResponse.json({ insights: savedInsights })
  } catch (error: any) {
    console.error('Insights generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

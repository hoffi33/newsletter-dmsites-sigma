import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/ai/claude'

async function predictPerformance(newsletter: any, historicalData: any[]) {
  const systemPrompt = `You are an expert at predicting email newsletter performance based on historical data and content analysis.`

  const prompt = `Predict the performance of this newsletter based on historical data:

NEWSLETTER TO PREDICT:
Title: ${newsletter.title}
Subject Line: ${newsletter.selected_subject_line || newsletter.title}
Tone: ${newsletter.tone}
Length: ${newsletter.length} (word count: ${newsletter.word_count})
Structure: ${newsletter.structure}

HISTORICAL PERFORMANCE:
${JSON.stringify(historicalData, null, 2)}

Analyze and predict:
1. Expected open rate (with confidence interval)
2. Expected click rate (with confidence interval)
3. Engagement score (1-10)
4. Risk factors (what might hurt performance)
5. Opportunities (what might boost performance)
6. Specific recommendations to improve

Return JSON:
{
  "predicted_open_rate": number,
  "open_rate_range": [min, max],
  "predicted_click_rate": number,
  "click_rate_range": [min, max],
  "engagement_score": number (1-10),
  "confidence": number (0.0-1.0),
  "risk_factors": ["factor 1", "factor 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "recommendations": [
    {
      "category": "subject_line | content | timing | structure",
      "recommendation": "specific action",
      "expected_impact": "% improvement"
    }
  ]
}

Return ONLY valid JSON.`

  const response = await generateCompletion(prompt, systemPrompt, 3000)

  try {
    return JSON.parse(response)
  } catch (e) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Failed to parse prediction response')
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

    const { newsletterId } = await request.json()

    // Fetch newsletter
    const { data: newsletter } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single()

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
    }

    // Fetch historical analytics
    const { data: analytics } = await supabase
      .from('newsletter_analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(20)

    const historicalData = analytics?.map((a) => ({
      title: a.metadata?.title,
      open_rate: a.open_rate,
      click_rate: a.click_rate,
      sent_date: a.sent_at,
    })) || []

    // Generate prediction
    const prediction = await predictPerformance(newsletter, historicalData)

    return NextResponse.json({ prediction })
  } catch (error: any) {
    console.error('Prediction error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
